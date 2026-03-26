<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendRoApprovedEmail;
use App\Jobs\SendRoRejectedEmail;
use App\Models\RepeatOrder;
use App\Services\ActivityLogger;
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
            'pending' => RepeatOrder::whereIn('status', ['pending', 'paid'])->count(),
            'completed' => RepeatOrder::where('status', 'completed')->count(),
            'rejected' => RepeatOrder::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/repeat-orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'search']),
            'stats' => $stats,
        ]);
    }

    public function show(RepeatOrder $repeatOrder)
    {
        $repeatOrder->load(['memberProfile.user', 'items.product']);

        return Inertia::render('admin/repeat-orders/show', [
            'order' => $repeatOrder,
        ]);
    }

    public function approve(RepeatOrder $repeatOrder)
    {
        if (! in_array($repeatOrder->status, ['pending', 'paid'])) {
            return back()->with('error', 'Hanya order berstatus pending atau sudah bayar yang dapat disetujui.');
        }

        $repeatOrder->update(['status' => 'completed']);

        SendRoApprovedEmail::dispatch($repeatOrder->load('memberProfile.user', 'items.product'));

        ActivityLogger::log(
            'repeat_order.approved',
            "Repeat Order #{$repeatOrder->id} member '{$repeatOrder->memberProfile->user->name}' disetujui.",
            $repeatOrder,
        );

        return back()->with('success', 'Repeat Order berhasil disetujui.');
    }

    public function reject(RepeatOrder $repeatOrder)
    {
        if (! in_array($repeatOrder->status, ['pending', 'paid'])) {
            return back()->with('error', 'Hanya order berstatus pending atau sudah bayar yang dapat ditolak.');
        }

        $repeatOrder->load('items.product');

        foreach ($repeatOrder->items as $item) {
            if ($item->product && $item->product->stock !== null) {
                $item->product->increment('stock', $item->quantity);
            }
        }

        $repeatOrder->update(['status' => 'rejected']);

        SendRoRejectedEmail::dispatch($repeatOrder->load('memberProfile.user', 'items.product'));

        ActivityLogger::log(
            'repeat_order.rejected',
            "Repeat Order #{$repeatOrder->id} member '{$repeatOrder->memberProfile->user->name}' ditolak.",
            $repeatOrder,
        );

        return back()->with('success', 'Repeat Order berhasil ditolak.');
    }
}
