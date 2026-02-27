<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Models\PinOrder;
use App\Services\DuitkuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PinOrderController extends Controller
{
    public function index(): Response
    {
        $orders = PinOrder::where('user_id', auth()->id())
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $packages = collect(PackageType::cases())->map(fn ($p) => [
            'value' => $p->value,
            'label' => $p->value,
            'price' => $p->registrationPrice(),
        ]);

        $user = auth()->user();

        return Inertia::render('member/pin-orders/index', [
            'orders' => $orders,
            'packages' => $packages,
            'prefill' => [
                'phone' => $user->phone ?? '',
                'shipping_name' => $user->name,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'package_type' => 'required|in:Silver,Gold,Platinum',
            'quantity' => 'required|integer|min:1|max:100',
            'payment_method' => 'required|in:duitku,manual_transfer',
            'phone' => 'required|string|max:20',
            'shipping_name' => 'required|string|max:255',
            'shipping_address' => 'required|string|max:500',
            'shipping_province' => 'required|string|max:100',
            'shipping_city' => 'required|string|max:100',
            'shipping_district' => 'required|string|max:100',
            'shipping_village' => 'required|string|max:100',
            'shipping_postal_code' => 'required|string|max:10',
            'notes' => 'nullable|string|max:500',
        ], [
            'package_type.required' => 'Jenis paket PIN wajib dipilih.',
            'quantity.required' => 'Jumlah PIN wajib diisi.',
            'quantity.min' => 'Minimal pemesanan 1 PIN.',
            'quantity.max' => 'Maksimal pemesanan 100 PIN sekaligus.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
            'phone.required' => 'No. HP wajib diisi.',
            'shipping_name.required' => 'Nama penerima wajib diisi.',
            'shipping_address.required' => 'Alamat pengiriman wajib diisi.',
            'shipping_province.required' => 'Provinsi wajib diisi.',
            'shipping_city.required' => 'Kota/Kabupaten wajib diisi.',
            'shipping_district.required' => 'Kecamatan wajib diisi.',
            'shipping_village.required' => 'Kelurahan/Desa wajib diisi.',
            'shipping_postal_code.required' => 'Kode Pos wajib diisi.',
        ]);

        $package = PackageType::from($request->package_type);
        $unitPrice = $package->registrationPrice();
        $total = $unitPrice * $request->quantity;

        $pinOrder = PinOrder::create([
            'order_number' => PinOrder::generateOrderNumber(),
            'user_id' => auth()->id(),
            'package_type' => $package,
            'quantity' => $request->quantity,
            'unit_price' => $unitPrice,
            'total_amount' => $total,
            'status' => 'pending',
            'payment_method' => $request->payment_method,
            'phone' => $request->phone,
            'shipping_name' => $request->shipping_name,
            'shipping_address' => $request->shipping_address,
            'shipping_province' => $request->shipping_province,
            'shipping_city' => $request->shipping_city,
            'shipping_district' => $request->shipping_district,
            'shipping_village' => $request->shipping_village,
            'shipping_postal_code' => $request->shipping_postal_code,
            'notes' => $request->notes,
        ]);

        if ($request->payment_method === 'duitku') {
            try {
                $duitku = app(DuitkuService::class);
                $user = auth()->user();
                $result = $duitku->createTransaction(
                    merchantOrderId: $pinOrder->order_number,
                    amount: $total,
                    productDetails: "Order PIN {$package->value} x{$request->quantity}",
                    customerName: $user->name,
                    email: $user->email,
                    returnUrl: route('member.pin-orders.index'),
                    callbackUrl: route('payment.callback'),
                );

                $pinOrder->update([
                    'payment_url' => $result['paymentUrl'],
                    'duitku_reference' => $result['reference'],
                ]);

                return Inertia::location($result['paymentUrl']);
            } catch (\RuntimeException $e) {
                $pinOrder->delete();

                return back()->with('error', 'Gagal menghubungi Duitku: '.$e->getMessage());
            }
        }

        // Manual transfer
        return redirect()->route('member.pin-orders.payment', $pinOrder->id)
            ->with('success', 'Order PIN berhasil dibuat. Silakan selesaikan pembayaran transfer.');
    }

    public function show(PinOrder $order)
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('member/pin-orders/show', [
            'order' => $order,
        ]);
    }

    public function paymentPage(PinOrder $order): Response|RedirectResponse
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status !== 'pending') {
            return redirect()->route('member.pin-orders.index')
                ->with('info', 'Order ini sudah tidak dalam status menunggu pembayaran.');
        }

        return Inertia::render('member/pin-orders/payment', [
            'order' => $order,
            'banks' => \App\Models\Bank::where('is_active', true)->orderBy('sort_order')->get(),
        ]);
    }

    public function uploadReceipt(Request $request, PinOrder $order): RedirectResponse
    {
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'image' => 'required|image|max:2048',
        ]);

        if ($order->payment_receipt) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($order->payment_receipt);
        }

        $path = $request->file('image')->store('receipts/pin-orders', 'public');
        $order->update(['payment_receipt' => $path]);

        return redirect()->route('member.pin-orders.index')->with('success', 'Bukti transfer berhasil diunggah. Admin akan segera memverifikasi.');
    }
}
