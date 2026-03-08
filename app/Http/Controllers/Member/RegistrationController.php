<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\CareerLevel;
use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreRegistrationRequest;
use App\Mail\BonusAvailable;
use App\Mail\SponsorNewMemberRegistered;
use App\Mail\WelcomeNewMember;
use App\Models\Bonus;
use App\Models\MemberProfile;
use App\Models\RegistrationPin;
use App\Models\User;
use App\Services\BonusRunnerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function __construct(private readonly BonusRunnerService $bonusRunnerService) {}

    public function index(Request $request): \Inertia\Response
    {
        $myPins = RegistrationPin::where('assigned_to', auth()->id())
            ->where('status', 'available')
            ->get(['id', 'pin_code', 'package_type', 'price']);

        return Inertia::render('member/registration/index', [
            'myPins' => $myPins,
            'prefillParentId' => $request->integer('parent_id') ?: null,
            'prefillLeg' => $request->input('leg'),
        ]);
    }

    public function store(StoreRegistrationRequest $request)
    {
        $pin = RegistrationPin::where('pin_code', $request->pin_code)->first();
        $sponsor = auth()->user();

        $newUser = null;
        $newProfile = null;
        $sponsorBonus = null;
        $passUpDistributions = [];

        DB::transaction(function () use ($request, $sponsor, $pin, &$newUser, &$newProfile, &$sponsorBonus, &$passUpDistributions) {
            $sponsorProfile = $sponsor->memberProfile;

            if (! $sponsorProfile) {
                throw new \RuntimeException('Profil sponsor tidak ditemukan.');
            }

            // If a specific parent slot was pre-selected (from network diagram), use it directly.
            // Otherwise, BFS to find the shallowest empty slot in the chosen direction.
            if ($request->parent_id) {
                $parent = MemberProfile::findOrFail($request->parent_id);
                $leg = $request->leg_position;
            } else {
                ['parent' => $parent, 'leg' => $leg] = $this->findBfsSlot($sponsorProfile, $request->leg_position);
            }

            // 1. Create User
            $packageType = $pin->package_type instanceof PackageType
                ? $pin->package_type
                : PackageType::from($pin->package_type);

            $memberIdPrefix = match ($packageType) {
                PackageType::Silver => 'S',
                PackageType::Gold => 'G',
                PackageType::Platinum => 'P',
            };

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

            // 2. Create Member Profile
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

            // 3. Update parent's child pointer
            $childLeg = $leg === 'left' ? 'left_child_id' : 'right_child_id';
            $parent->update([$childLeg => $newProfile->id]);

            // 4. Mark PIN as used
            $pin->update([
                'status' => 'used',
                'used_by' => $newUser->id,
            ]);

            // 5. Initialize Wallet
            $newUser->wallet()->create(['balance' => 0]);

            // 6. Create Sponsor Bonus for the sponsor
            $newMemberPackage = $pin->package_type;
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

            // 7. Pass Up Sponsor Bonus (multi-recipient)
            $alokasi = $newMemberPackage->sponsorAlokasi();
            $sisa = $alokasi - $bonusAmount;

            if ($sisa > 0) {
                $passUpDistributions = $this->distributePassUpBonuses(
                    $sponsor, $sponsorPackage, $sisa, $newUser->id, $newMemberPackage
                );
            }

            // 8. Propagate Pairing Points + generate real-time bonuses
            $this->bonusRunnerService->propagatePairingPointsAndProcessBonuses($newProfile, $newMemberPackage);
        });

        // Send emails after transaction (queued)
        Mail::to($newUser->email)->queue(new WelcomeNewMember($newUser, $newProfile));
        Mail::to($sponsor->email)->queue(new SponsorNewMemberRegistered($sponsor, $newUser, $pin->package_type->value));
        Mail::to($sponsor->email)->queue(new BonusAvailable($sponsor, $sponsorBonus));

        foreach ($passUpDistributions as ['user' => $passUpUser, 'bonus' => $passUpBonus]) {
            Mail::to($passUpUser->email)->queue(new BonusAvailable($passUpUser, $passUpBonus));
        }

        return redirect()->route('member.network.index')
            ->with('success', 'Member baru berhasil didaftarkan.');
    }

    /**
     * Walk up the sponsor chain, distributing pass-up bonus to each eligible upline
     * (package strictly higher than sponsor's) until the remaining amount is exhausted.
     * Each upline can receive at most their maxPassUpAmount().
     *
     * @return array<int, array{user: User, bonus: Bonus}>
     */
    private function distributePassUpBonuses(
        User $sponsor,
        PackageType $sponsorPackage,
        int $remaining,
        int $newUserId,
        PackageType $newMemberPackage,
    ): array {
        $sponsorSortOrder = \App\Models\Package::findByKey($sponsorPackage->value)->sort_order;
        $current = $sponsor;
        $distributions = [];

        while ($current->sponsor_id && $remaining > 0) {
            $upline = User::find($current->sponsor_id);

            if (! $upline) {
                break;
            }

            $uplineProfile = $upline->memberProfile;

            if ($uplineProfile) {
                $uplineSortOrder = \App\Models\Package::findByKey($uplineProfile->package_type->value)->sort_order;

                if ($uplineSortOrder > $sponsorSortOrder) {
                    $give = min($remaining, $uplineProfile->package_type->maxPassUpAmount());
                    $passUpEwallet = (int) ($give * 0.2);
                    $passUpCash = $give - $passUpEwallet;

                    $bonus = Bonus::create([
                        'member_profile_id' => $uplineProfile->id,
                        'bonus_type' => BonusType::PassUpSponsor->value,
                        'amount' => $give,
                        'ewallet_amount' => $passUpEwallet,
                        'cash_amount' => $passUpCash,
                        'status' => BonusStatus::Pending->value,
                        'bonus_date' => now()->toDateString(),
                        'period_month' => (int) now()->format('n'),
                        'period_year' => (int) now()->format('Y'),
                        'meta' => [
                            'new_member_id' => $newUserId,
                            'new_member_package' => $newMemberPackage->value,
                            'sponsor_id' => $sponsor->id,
                            'sponsor_package' => $sponsorPackage->value,
                        ],
                    ]);

                    $distributions[] = ['user' => $upline, 'bonus' => $bonus];
                    $remaining -= $give;
                }
            }

            $current = $upline;
        }

        return $distributions;
    }

    /**
     * BFS to find the shallowest empty slot in the sponsor's chosen direction.
     *
     * The sponsor picks "left" or "right" to determine which subtree to place into.
     * Within that subtree the method finds the first available slot (left before right)
     * at the shallowest depth — the standard binary MLM spillover algorithm.
     *
     * @return array{parent: MemberProfile, leg: string}
     */
    private function findBfsSlot(MemberProfile $root, string $direction): array
    {
        // If the chosen slot on root is still empty, place directly under root.
        $rootLeg = $direction === 'left' ? 'left_child_id' : 'right_child_id';

        if (! $root->$rootLeg) {
            return ['parent' => $root, 'leg' => $direction];
        }

        // BFS within the chosen subtree to find the shallowest empty slot.
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
}
