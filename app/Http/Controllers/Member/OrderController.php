<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RepeatOrder;
use App\Models\RepeatOrderItem;
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
        ]);

        DB::transaction(function () use ($request, $profile) {
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
            ]);

            foreach ($orderItems as $item) {
                RepeatOrderItem::create(array_merge($item, ['repeat_order_id' => $order->id]));
            }
        });

        return back()->with('success', 'Repeat Order berhasil dibuat. Menunggu konfirmasi admin.');
    }
}
