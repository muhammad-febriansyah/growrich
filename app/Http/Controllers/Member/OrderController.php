<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\RepeatOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $products = Product::active()->get();
        $profile = auth()->user()->memberProfile;
        $orders = $profile
            ? RepeatOrder::where('member_profile_id', $profile->id)
                ->with('items.product')
                ->orderBy('created_at', 'desc')
                ->paginate(10)
            : RepeatOrder::where('member_profile_id', 0)->paginate(10);

        return Inertia::render('member/order/index', [
            'products' => $products,
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $memberProfile = auth()->user()->memberProfile;
        if (!$memberProfile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        DB::transaction(function () use ($request, $memberProfile) {

            $totalAmount = 0;
            $totalPoints = 0;

            $itemsData = [];
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                $price = $product->ro_price;
                $points = 1;
                $totalAmount += $price * $item['quantity'];
                $totalPoints += $points * $item['quantity'];

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ];
            }

            $order = RepeatOrder::create([
                'member_profile_id' => $memberProfile->id,
                'total_amount' => $totalAmount,
                'points' => $totalPoints,
                'status' => 'pending',
            ]);

            foreach ($itemsData as $itemData) {
                $order->items()->create($itemData);
            }
        });

        return back()->with('success', 'Pesanan Repeat Order berhasil dibuat.');
    }
}
