<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RepeatOrder;
use App\Models\RepeatOrderItem;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return redirect()->route('dashboard')->with('error', 'Profil member tidak ditemukan.');
        }

        $orders = RepeatOrder::where('member_profile_id', $profile->id)
            ->with(['items.product'])
            ->orderByDesc('created_at')
            ->paginate(10);

        $products = Product::active()->orderBy('name')->get(['id', 'name', 'sku', 'ro_price', 'unit', 'image', 'stock']);

        $totalRo = RepeatOrder::where('member_profile_id', $profile->id)
            ->where('status', 'completed')
            ->sum('total_amount');

        $thisMonthRo = RepeatOrder::where('member_profile_id', $profile->id)
            ->where('status', 'completed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        return Inertia::render('member/order/index', [
            'orders' => $orders,
            'products' => $products,
            'totalRo' => $totalRo,
            'thisMonthRo' => $thisMonthRo,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:duitku,manual_transfer',
            'duitku_method' => 'required_if:payment_method,duitku|nullable|string',
        ], [
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
            'duitku_method.required_if' => 'Pilih metode pembayaran Duitku.',
        ]);

        $order = null;

        DB::transaction(function () use ($request, $profile, &$order) {
            $totalAmount = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw new \RuntimeException("Produk {$product->name} tidak aktif.");
                }

                if ($product->stock !== null && $product->stock < $item['quantity']) {
                    throw new \RuntimeException("Stok produk {$product->name} tidak mencukupi.");
                }

                $subtotal = $product->ro_price * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->ro_price,
                    'subtotal' => $subtotal,
                ];

                if ($product->stock !== null) {
                    $product->decrement('stock', $item['quantity']);
                }
            }

            $order = RepeatOrder::create([
                'member_profile_id' => $profile->id,
                'order_number' => 'RO-'.strtoupper(uniqid()),
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'period_month' => now()->month,
                'period_year' => now()->year,
                'payment_method' => $request->payment_method,
            ]);

            foreach ($orderItems as $item) {
                RepeatOrderItem::create(array_merge($item, ['repeat_order_id' => $order->id]));
            }
        });

        if ($request->payment_method === 'duitku') {
            try {
                $duitku = app(DuitkuService::class);
                $user = auth()->user();
                $result = $duitku->createTransaction(
                    merchantOrderId: $order->order_number,
                    amount: $order->total_amount,
                    productDetails: "Repeat Order #{$order->order_number}",
                    customerName: $user->name,
                    email: $user->email,
                    returnUrl: route('member.ro.index'),
                    callbackUrl: route('payment.callback'),
                    paymentMethod: $request->duitku_method,
                );

                $order->update([
                    'payment_url' => $result['paymentUrl'],
                    'duitku_reference' => $result['reference'],
                ]);

                return Inertia::location($result['paymentUrl']);
            } catch (\RuntimeException $e) {
                // Rollback order items manually then delete order
                $order->items()->delete();
                $order->delete();

                return back()->with('error', 'Gagal menghubungi Duitku: '.$e->getMessage());
            }
        }

        // Manual transfer
        return redirect()->route('member.ro.payment', $order->id)
            ->with('success', 'Repeat Order berhasil dibuat. Silakan selesaikan pembayaran transfer.');
    }

    public function show(RepeatOrder $order)
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile || $order->member_profile_id !== $profile->id) {
            abort(403);
        }

        return Inertia::render('member/order/show', [
            'order' => $order->load(['items.product']),
        ]);
    }

    public function paymentPage(RepeatOrder $order)
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile || $order->member_profile_id !== $profile->id) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return redirect()->route('member.ro.index')
                ->with('info', 'Order ini sudah tidak dalam status menunggu pembayaran.');
        }

        return Inertia::render('member/order/payment', [
            'order' => $order->load('items.product'),
            'banks' => \App\Models\Bank::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function uploadReceipt(Request $request, RepeatOrder $order)
    {
        $user = auth()->user();
        $profile = $user->memberProfile;

        if (! $profile || $order->member_profile_id !== $profile->id) {
            abort(403);
        }

        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        if ($order->payment_receipt) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($order->payment_receipt);
        }

        $path = $request->file('image')->store('receipts/ro', 'public');
        $order->update(['payment_receipt' => $path]);

        return redirect()->route('member.ro.index')->with('success', 'Bukti transfer berhasil diunggah. Admin akan segera memverifikasi.');
    }
}
