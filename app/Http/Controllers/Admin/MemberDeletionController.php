<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\LegPosition;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Models\MemberDeletionLog;
use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $user->delete();

        if ($parentProfile && $legPosition) {
            if ($legPosition === LegPosition::Left) {
                $parentProfile->update(['left_pp_total' => 0, 'left_rp_total' => 0]);
            } else {
                $parentProfile->update(['right_pp_total' => 0, 'right_rp_total' => 0]);
            }
        }
    }
}
