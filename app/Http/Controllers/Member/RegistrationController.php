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
use App\Models\PairingPointLedger;
use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index()
    {
        $myPins = RegistrationPin::where('assigned_to', auth()->id())
            ->where('status', 'available')
            ->get(['id', 'pin_code', 'package_type', 'price']);

        return Inertia::render('member/registration/index', [
            'myPins' => $myPins,
        ]);
    }

    public function store(StoreRegistrationRequest $request)
    {
        $pin = RegistrationPin::where('pin_code', $request->pin_code)->first();
        $sponsor = auth()->user();

        $newUser = null;
        $newProfile = null;
        $sponsorBonus = null;

        DB::transaction(function () use ($request, $sponsor, $pin, &$newUser, &$newProfile, &$sponsorBonus) {
            $sponsorProfile = $sponsor->memberProfile;

            if (! $sponsorProfile) {
                throw new \RuntimeException('Profil sponsor tidak ditemukan.');
            }

            // Find the shallowest empty slot in the chosen direction via BFS
            ['parent' => $parent, 'leg' => $leg] = $this->findBfsSlot($sponsorProfile, $request->leg_position);

            // 1. Create User
            $newUser = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => UserRole::Member,
                'sponsor_id' => $sponsor->id,
                'referral_code' => Str::upper(Str::random(8)),
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

            // 7. Propagate Pairing Points up the tree
            $this->propagatePairingPoints($newProfile, $newMemberPackage);
        });

        // Send emails after transaction (queued)
        Mail::to($newUser->email)->queue(new WelcomeNewMember($newUser, $newProfile));
        Mail::to($sponsor->email)->queue(new SponsorNewMemberRegistered($sponsor, $newUser, $pin->package_type->value));
        Mail::to($sponsor->email)->queue(new BonusAvailable($sponsor, $sponsorBonus));

        return redirect()->route('member.network.index')
            ->with('success', 'Member baru berhasil didaftarkan.');
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
