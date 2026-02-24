<?php

namespace App\Http\Controllers\Auth;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StoreGuestRegistrationRequest;
use App\Mail\BonusAvailable;
use App\Mail\SponsorNewMemberRegistered;
use App\Mail\WelcomeNewMember;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GuestRegistrationController extends Controller
{
    public function create(): \Inertia\Response
    {
        return Inertia::render('auth/register');
    }

    public function store(StoreGuestRegistrationRequest $request): \Illuminate\Http\RedirectResponse
    {
        $pin = RegistrationPin::where('pin_code', $request->pin_code)->first();
        $sponsor = User::find($pin->assigned_to);

        if (! $sponsor) {
            return back()->withErrors(['pin_code' => 'Sponsor untuk PIN ini tidak ditemukan.']);
        }

        $sponsorProfile = $sponsor->memberProfile;

        if (! $sponsorProfile) {
            return back()->withErrors(['pin_code' => 'Sponsor untuk PIN ini belum memiliki profil member aktif.']);
        }

        $newUser = null;
        $newProfile = null;
        $sponsorBonus = null;

        DB::transaction(function () use ($request, $sponsor, $sponsorProfile, $pin, &$newUser, &$newProfile, &$sponsorBonus) {
            ['parent' => $parent, 'leg' => $leg] = $this->findBfsSlot($sponsorProfile, $request->leg_position);

            // 1. Determine package from PIN
            $packageType = $pin->package_type instanceof PackageType
                ? $pin->package_type
                : PackageType::from($pin->package_type);

            $memberIdPrefix = match ($packageType) {
                PackageType::Silver => 'S',
                PackageType::Gold => 'G',
                PackageType::Platinum => 'P',
            };

            // 2. Create User
            $newUser = User::create([
                'name' => $request->name,
                'username' => $request->username ?: null,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => UserRole::Member,
                'sponsor_id' => $sponsor->id,
                'referral_code' => Str::upper(Str::random(8)),
                'member_id' => User::generateMemberId($memberIdPrefix),
                'email_verified_at' => now(),
            ]);

            // 3. Create Member Profile
            $newProfile = MemberProfile::create([
                'user_id' => $newUser->id,
                'package_type' => $pin->package_type,
                'package_status' => 'active',
                'pin_code' => $pin->pin_code,
                'activated_at' => now(),
                'parent_id' => $parent->id,
                'leg_position' => $leg,
                'career_level' => CareerLevel::Member->value,
                // Data Pribadi
                'birth_date' => $request->birth_date,
                'birth_place' => $request->birth_place,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'nationality' => $request->nationality,
                'id_number' => $request->id_number,
                'address' => $request->address,
                'province' => $request->province,
                'city' => $request->city,
                'district' => $request->district,
                'village' => $request->village,
                'postal_code' => $request->postal_code,
                // Rekening Bank
                'bank_name' => $request->bank_name,
                'bank_branch' => $request->bank_branch,
                'bank_account_number' => $request->bank_account_number,
                'bank_account_name' => $request->bank_account_name,
                // Data Ahli Waris
                'beneficiary_name' => $request->beneficiary_name,
                'beneficiary_relationship' => $request->beneficiary_relationship,
                'beneficiary_id_number' => $request->beneficiary_id_number,
                'beneficiary_phone' => $request->beneficiary_phone,
            ]);

            // 4. Update parent's child pointer
            $childLeg = $leg === 'left' ? 'left_child_id' : 'right_child_id';
            $parent->update([$childLeg => $newProfile->id]);

            // 5. Mark PIN as used
            $pin->update([
                'status' => 'used',
                'used_by' => $newUser->id,
            ]);

            // 6. Initialize Wallet
            $newUser->wallet()->create(['balance' => 0]);

            // 7. Create Sponsor Bonus
            $newMemberPackage = $pin->package_type instanceof PackageType
                ? $pin->package_type
                : PackageType::from($pin->package_type);
            $sponsorPackage = $sponsorProfile->package_type;
            $bonusAmount = $sponsorPackage->sponsorBonusFor($newMemberPackage);
            $ewalletAmount = (int) ($bonusAmount * 0.2);
            $cashAmount = $bonusAmount - $ewalletAmount;

            $sponsorBonus = Bonus::create([
                'member_profile_id' => $sponsorProfile->id,
                'bonus_type' => BonusType::Sponsor->value,
                'amount' => $bonusAmount,
                'ewallet_amount' => $ewalletAmount,
                'cash_amount' => $cashAmount,
                'status' => BonusStatus::Pending->value,
                'bonus_date' => now()->toDateString(),
                'period_month' => (int) now()->format('n'),
                'period_year' => (int) now()->format('Y'),
                'meta' => ['new_member_id' => $newUser->id, 'new_member_package' => $newMemberPackage->value, 'sponsor_package' => $sponsorPackage->value],
            ]);

            // 8. Propagate Pairing Points
            $this->propagatePairingPoints($newProfile, $newMemberPackage);
        });

        // Send emails after transaction (queued)
        Mail::to($newUser->email)->queue(new WelcomeNewMember($newUser, $newProfile));
        Mail::to($sponsor->email)->queue(new SponsorNewMemberRegistered($sponsor, $newUser, $pin->package_type instanceof PackageType ? $pin->package_type->value : $pin->package_type));
        Mail::to($sponsor->email)->queue(new BonusAvailable($sponsor, $sponsorBonus));

        // Auto-login the new user
        Auth::login($newUser);

        return redirect()->route('dashboard')
            ->with('success', 'Selamat datang! Akun Anda berhasil diaktifkan.');
    }

    /**
     * BFS to find the shallowest empty slot in the sponsor's chosen direction.
     *
     * @return array{parent: MemberProfile, leg: string}
     */
    private function findBfsSlot(MemberProfile $root, string $direction): array
    {
        $rootLeg = $direction === 'left' ? 'left_child_id' : 'right_child_id';

        if (! $root->$rootLeg) {
            return ['parent' => $root, 'leg' => $direction];
        }

        $start = $direction === 'left' ? $root->leftChild : $root->rightChild;
        $queue = [$start];

        while (! empty($queue)) {
            $node = array_shift($queue);

            if (! $node->left_child_id) {
                return ['parent' => $node, 'leg' => 'left'];
            }

            if (! $node->right_child_id) {
                return ['parent' => $node, 'leg' => 'right'];
            }

            $queue[] = $node->leftChild;
            $queue[] = $node->rightChild;
        }

        throw new \RuntimeException('Tidak ada slot kosong di jaringan.');
    }

    /**
     * Traverse from new profile upward, incrementing PP on each ancestor.
     */
    private function propagatePairingPoints(MemberProfile $newProfile, PackageType $packageType): void
    {
        $pp = $packageType->pairingPoint();
        $current = $newProfile;

        while ($current->parent_id) {
            $parent = MemberProfile::find($current->parent_id);

            if (! $parent) {
                break;
            }

            $leg = $current->leg_position?->value;

            if (! $leg) {
                break;
            }

            $totalColumn = $leg === 'left' ? 'left_pp_total' : 'right_pp_total';
            $balanceBefore = $parent->$totalColumn;
            $balanceAfter = $balanceBefore + $pp;

            $parent->increment($totalColumn, $pp);

            PairingPointLedger::create([
                'member_profile_id' => $parent->id,
                'leg' => $leg,
                'points' => $pp,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reason' => 'registration',
                'reference_id' => $newProfile->id,
                'ledger_date' => now()->toDateString(),
            ]);

            $current = $parent;
        }
    }
}
