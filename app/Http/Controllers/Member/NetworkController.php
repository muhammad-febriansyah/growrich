<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class NetworkController extends Controller
{
    public function index(Request $request): Response
    {
        $authProfile = auth()->user()->memberProfile;

        if (! $authProfile) {
            return Inertia::render('member/network/index', [
                'tree' => null,
                'ancestors' => [],
            ]);
        }

        $viewRoot = $authProfile;

        if ($request->filled('root_id')) {
            $rootId = (int) $request->root_id;
            $requested = MemberProfile::find($rootId);

            if ($requested && $this->isDescendant($authProfile->id, $requested->id)) {
                $viewRoot = $requested;
            }
        }

        return Inertia::render('member/network/index', [
            'tree' => $this->getTree($viewRoot, 3),
            'ancestors' => $this->buildAncestors($authProfile, $viewRoot),
        ]);
    }

    /**
     * Build the breadcrumb path from the auth root up to (but not including)
     * the current view root.
     *
     * @return array<int, array{id: int, name: string}>
     */
    private function buildAncestors(MemberProfile $authRoot, MemberProfile $viewRoot): array
    {
        if ($authRoot->id === $viewRoot->id) {
            return [];
        }

        $path = [];
        $current = $viewRoot->parent;

        while ($current && $current->id !== $authRoot->id) {
            array_unshift($path, ['id' => $current->id, 'name' => $current->user->name]);
            $current = $current->parent;
        }

        array_unshift($path, ['id' => $authRoot->id, 'name' => $authRoot->user->name]);

        return $path;
    }

    /** Check if $targetId is a descendant of (or equal to) $rootId. */
    private function isDescendant(int $rootId, int $targetId): bool
    {
        if ($rootId === $targetId) {
            return true;
        }

        $result = DB::select(<<<'SQL'
            WITH RECURSIVE downline AS (
                SELECT id FROM member_profiles WHERE id = ?
                UNION ALL
                SELECT mp.id FROM member_profiles mp
                INNER JOIN downline d ON mp.parent_id = d.id
            )
            SELECT COUNT(*) AS found FROM downline WHERE id = ?
        SQL, [$rootId, $targetId]);

        return (int) ($result[0]->found ?? 0) > 0;
    }

    /** @return array<string, mixed>|null */
    private function getTree(?MemberProfile $member, int $depth): ?array
    {
        if (! $member || $depth < 0) {
            return null;
        }

        return [
            'id' => $member->id,
            'referral_code' => $member->user->referral_code,
            'name' => $member->user->name,
            'package' => $member->package_type->value,
            'left_pp' => $member->left_pp_total,
            'right_pp' => $member->right_pp_total,
            'left' => $this->getTree($member->leftChild, $depth - 1),
            'right' => $this->getTree($member->rightChild, $depth - 1),
        ];
    }
}
