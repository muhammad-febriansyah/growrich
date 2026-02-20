<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendRoApprovedEmail;
use App\Jobs\SendRoRejectedEmail;
use App\Models\RepeatOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RepeatOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = RepeatOrder::query()->with(['memberProfile.user', 'items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $orders = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        $stats = [
            'pending' => RepeatOrder::where('status', 'pending')->count(),
            'completed' => RepeatOrder::where('status', 'completed')->count(),
            'rejected' => RepeatOrder::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/repeat-orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
        ]);
    }

    public function approve(RepeatOrder $repeatOrder)
    {
        if ($repeatOrder->status !== 'pending') {
            return back()->with('error', 'Hanya order berstatus pending yang dapat disetujui.');
        }

        $repeatOrder->update(['status' => 'completed']);

        SendRoApprovedEmail::dispatch($repeatOrder->load('memberProfile.user', 'items.product'));

        return back()->with('success', 'Repeat Order berhasil disetujui.');
    }

    public function reject(RepeatOrder $repeatOrder)
    {
        if ($repeatOrder->status !== 'pending') {
            return back()->with('error', 'Hanya order berstatus pending yang dapat ditolak.');
        }

        $repeatOrder->update(['status' => 'rejected']);

        SendRoRejectedEmail::dispatch($repeatOrder->load('memberProfile.user', 'items.product'));

        return back()->with('success', 'Repeat Order berhasil ditolak.');
    }
}
