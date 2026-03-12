<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
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
        // Daftar stokis dengan statistik
        $stockists = User::where('role', UserRole::Member)
            ->whereHas('memberProfile', fn ($q) => $q->where('is_stockist', true))
            ->with('memberProfile')
            ->get()
            ->map(function (User $user) {
                $pinStok = RegistrationPin::where('assigned_to', $user->id)
                    ->where('status', 'available')
                    ->count();

                $totalTransferred = PinTransferLog::where('transferred_by', $user->id)
                    ->where('actor_type', 'member')
                    ->count();

                $totalOrdered = \App\Models\PinOrder::where('user_id', $user->id)
                    ->where('status', 'completed')
                    ->sum('quantity');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'member_id' => $user->member_id,
                    'package_type' => $user->memberProfile?->package_type?->value,
                    'pin_stok' => $pinStok,
                    'total_transferred' => $totalTransferred,
                    'total_ordered' => $totalOrdered,
                ];
            })
            ->sortByDesc('total_transferred')
            ->values();

        // Riwayat transfer terbaru
        $transferLogs = PinTransferLog::with([
            'pin:id,pin_code,package_type,upgrade_from',
            'fromUser:id,name,member_id',
            'toUser:id,name,member_id',
            'transferredBy:id,name,member_id',
        ])
            ->latest()
            ->paginate(20);

        // Summary stats
        $stats = [
            'total_stockists' => $stockists->count(),
            'total_pin_stok' => $stockists->sum('pin_stok'),
            'total_transferred_all_time' => PinTransferLog::count(),
        ];

        return Inertia::render('admin/stockists/index', [
            'stockists' => $stockists,
            'transfer_logs' => $transferLogs,
            'stats' => $stats,
        ]);
    }
}
