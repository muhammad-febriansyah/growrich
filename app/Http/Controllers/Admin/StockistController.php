<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\StockistLevel;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Models\MemberProfile;
use App\Models\PinTransferLog;
use App\Models\RegistrationPin;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockistController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::where('role', UserRole::Member)
            ->whereHas('memberProfile', fn ($q) => $q->where('is_stockist', true))
            ->with(['memberProfile.stockistParent.user', 'memberProfile.stockistChildren.user']);

        if ($request->filled('level')) {
            $query->whereHas('memberProfile', fn ($q) => $q->where('stockist_level', $request->level));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('member_id', 'like', "%{$request->search}%");
            });
        }

        $stockists = $query->get()->map(function (User $user) {
            $profile = $user->memberProfile;
            $pinStok = RegistrationPin::where('assigned_to', $user->id)
                ->where('status', 'available')
                ->count();

            $totalTransferred = PinTransferLog::where('transferred_by', $user->id)
                ->where('actor_type', 'member')
                ->count();

            $totalOrdered = \App\Models\PinOrder::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('quantity');

            $level = $profile?->stockist_level;
            $parent = $profile?->stockistParent;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'member_id' => $user->member_id,
                'package_type' => $profile?->package_type?->value,
                'stockist_level' => $level?->value,
                'stockist_level_label' => $level?->label(),
                'stockist_parent_id' => $profile?->stockist_parent_id,
                'stockist_parent_name' => $parent?->user?->name,
                'stockist_parent_member_id' => $parent?->user?->member_id,
                'children_count' => $profile?->stockistChildren?->count() ?? 0,
                'pin_stok' => $pinStok,
                'total_transferred' => $totalTransferred,
                'total_ordered' => $totalOrdered,
            ];
        })->sortBy([
            fn ($a, $b) => (StockistLevel::tryFrom($a['stockist_level'] ?? '')?->sortOrder() ?? 99)
                <=> (StockistLevel::tryFrom($b['stockist_level'] ?? '')?->sortOrder() ?? 99),
            fn ($a, $b) => $b['total_transferred'] <=> $a['total_transferred'],
        ])->values();

        // Riwayat transfer terbaru
        $transferLogs = PinTransferLog::with([
            'pin:id,pin_code,package_type,upgrade_from',
            'fromUser:id,name,member_id',
            'toUser:id,name,member_id',
            'transferredBy:id,name,member_id',
        ])
            ->latest()
            ->paginate(20);

        $stats = [
            'total_stockists' => User::whereHas('memberProfile', fn ($q) => $q->where('is_stockist', true))->count(),
            'total_center' => MemberProfile::where('stockist_level', StockistLevel::Center)->count(),
            'total_point' => MemberProfile::where('stockist_level', StockistLevel::Point)->count(),
            'total_sub' => MemberProfile::where('stockist_level', StockistLevel::Sub)->count(),
            'total_pin_stok' => $stockists->sum('pin_stok'),
            'total_transferred_all_time' => PinTransferLog::count(),
        ];

        // Daftar semua stockist center untuk dropdown parent
        $centers = MemberProfile::where('stockist_level', StockistLevel::Center)
            ->with('user:id,name,member_id')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->user?->name,
                'member_id' => $p->user?->member_id,
            ]);

        return Inertia::render('admin/stockists/index', [
            'stockists' => $stockists,
            'transfer_logs' => $transferLogs,
            'stats' => $stats,
            'centers' => $centers,
            'filters' => $request->only(['level', 'search']),
        ]);
    }
}
