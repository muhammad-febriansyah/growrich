<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\BonusStatus;
use App\Enums\Mlm\BonusType;
use App\Enums\Mlm\LegPosition;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\MemberDeletionLog;
use App\Models\MemberProfile;
use App\Models\PairingPointLedger;
use App\Models\RewardPointLedger;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemberDeletionController extends Controller
{
    public function index(): Response
    {
        $members = User::query()
            ->where('role', UserRole::Member)
            ->whereHas('memberProfile', fn ($q) => $q->whereNotNull('parent_id'))
            ->with('memberProfile:user_id,parent_id,package_type,package_status,career_level')
            ->get(['id', 'name', 'email', 'member_id', 'phone', 'created_at']);

        $logs = MemberDeletionLog::query()
            ->with('deletedBy:id,name')
            ->latest()
            ->get();

        return Inertia::render('admin/member-deletions/index', [
            'members' => $members,
            'logs' => $logs,
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        $profile = $user->memberProfile;

        if (! $profile || is_null($profile->parent_id)) {
            return back()->with('error', 'Member root tidak dapat dihapus.');
        }

        $this->deleteOneMember($user, $profile);

        return back()->with('success', "Member {$user->name} berhasil dihapus beserta seluruh data terkait.");
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate(['ids' => ['required', 'array', 'min:1'], 'ids.*' => ['integer']]);

        $users = User::query()
            ->whereIn('id', $request->ids)
            ->where('role', UserRole::Member)
            ->with('memberProfile')
            ->get();

        $deleted = 0;
        $skipped = 0;

        foreach ($users as $user) {
            $profile = $user->memberProfile;

            if (! $profile || is_null($profile->parent_id)) {
                $skipped++;

                continue;
            }

            $this->deleteOneMember($user, $profile);
            $deleted++;
        }

        $message = "{$deleted} member berhasil dihapus.";
        if ($skipped > 0) {
            $message .= " {$skipped} member dilewati (root).";
        }

        return back()->with('success', $message);
    }

    private function deleteOneMember(User $user, MemberProfile $profile): void
    {
        MemberDeletionLog::create([
            'member_id' => $user->member_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'package_type' => $profile->package_type?->value,
            'career_level' => $profile->career_level?->value,
            'deleted_by' => auth()->id(),
        ]);

        $parentProfile = MemberProfile::find($profile->parent_id);
        $legPosition = $profile->leg_position;

        // Collect all descendant IDs before deletion (for PP/RP reversal from ancestors)
        $subtreeIds = $this->getSubtreeProfileIds($profile->id);
        $allDeletedIds = array_merge([$profile->id], $subtreeIds);

        $user->delete();

        if ($parentProfile && $legPosition) {
            $leg = $legPosition === LegPosition::Left ? 'left' : 'right';

            // Reset direct parent's PP/RP for the deleted leg
            $parentProfile->update([
                $leg.'_pp_total' => 0,
                $leg.'_rp_total' => 0,
            ]);

            // Reverse PP/RP propagation for all ancestors above the direct parent
            $child = $parentProfile;
            $ancestor = MemberProfile::find($parentProfile->parent_id);

            while ($ancestor && $child->leg_position) {
                $ancestorLeg = $child->leg_position === LegPosition::Left ? 'left' : 'right';
                $ppCol = $ancestorLeg.'_pp_total';
                $rpCol = $ancestorLeg.'_rp_total';

                $ppToSubtract = (int) PairingPointLedger::where('member_profile_id', $ancestor->id)
                    ->where('leg', $ancestorLeg)
                    ->whereIn('reference_id', $allDeletedIds)
                    ->sum('points');

                $rpToSubtract = (int) RewardPointLedger::where('member_profile_id', $ancestor->id)
                    ->where('leg', $ancestorLeg)
                    ->whereIn('reference_id', $allDeletedIds)
                    ->sum('points');

                $ancestor->update([
                    $ppCol => max(0, (int) $ancestor->$ppCol - $ppToSubtract),
                    $rpCol => max(0, (int) $ancestor->$rpCol - $rpToSubtract),
                ]);

                $this->resetLevelingForProfile($ancestor);

                $child = $ancestor;
                $ancestor = MemberProfile::find($ancestor->parent_id);
            }

            // Reset leveling for the direct parent
            $this->resetLevelingForProfile($parentProfile);
        }
    }

    /**
     * Reset leveling_rewarded_levels based on approved bonuses only,
     * and delete any pending Leveling bonuses (since tree structure changed).
     */
    private function resetLevelingForProfile(MemberProfile $profile): void
    {
        Bonus::where('member_profile_id', $profile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->where('status', BonusStatus::Pending->value)
            ->delete();

        $approvedLevels = Bonus::where('member_profile_id', $profile->id)
            ->where('bonus_type', BonusType::Leveling->value)
            ->where('status', BonusStatus::Approved->value)
            ->get()
            ->map(fn (Bonus $b) => $b->meta['level'] ?? null)
            ->filter()
            ->values()
            ->toArray();

        $profile->update(['leveling_rewarded_levels' => $approvedLevels ?: null]);
    }

    /**
     * Get all descendant profile IDs using recursive CTE.
     */
    private function getSubtreeProfileIds(int $profileId): array
    {
        $results = DB::select(<<<'SQL'
            WITH RECURSIVE subtree AS (
                SELECT id FROM member_profiles WHERE parent_id = ?
                UNION ALL
                SELECT mp.id FROM member_profiles mp
                INNER JOIN subtree s ON mp.parent_id = s.id
            )
            SELECT id FROM subtree
        SQL, [$profileId]);

        return array_column($results, 'id');
    }
}
