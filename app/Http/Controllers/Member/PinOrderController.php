<?php

namespace App\Http\Controllers\Member;

use App\Enums\Mlm\PackageType;
use App\Enums\Mlm\UpgradePinType;
use App\Http\Controllers\Controller;
use App\Models\PinOrder;
use App\Models\SiteSetting;
use App\Services\DuitkuService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
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

        $registrationPackages = collect(PackageType::cases())->map(fn (PackageType $p) => [
            'value' => $p->value,
            'label' => 'PIN Registrasi '.$p->value,
            'price' => $p->registrationPrice(),
            'upgrade_from' => null,
        ]);

        $upgradePackages = collect(UpgradePinType::cases())->map(fn (UpgradePinType $u) => [
            'value' => 'Upgrade'.$u->value,
            'label' => $u->label(),
            'price' => $u->price(),
            'upgrade_from' => $u->fromPackage()->value,
        ]);

        $packages = $registrationPackages->concat($upgradePackages);

        $user = auth()->user();
        $settings = SiteSetting::instance();
        $isStockist = $user->memberProfile?->is_stockist ?? false;

        return Inertia::render('member/pin-orders/index', [
            'orders' => $orders,
            'packages' => $packages,
            'prefill' => [
                'phone' => $user->phone ?? '',
                'shipping_name' => $user->name,
            ],
            'discount' => [
                'is_stockist' => $isStockist,
                'stockist_min_order' => (int) ($settings->stockist_min_order ?? 10),
                'stockist_percent' => (int) ($settings->stockist_discount_percent ?? 0),
                'volume_5_percent' => (int) ($settings->volume_discount_5_percent ?? 0),
                'volume_10_percent' => (int) ($settings->volume_discount_10_percent ?? 0),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse|HttpResponse
    {
        $settings = SiteSetting::instance();
        $isStockist = auth()->user()->memberProfile?->is_stockist ?? false;
        $minQty = $isStockist ? max(1, (int) ($settings->stockist_min_order ?? 10)) : 1;

        $request->validate([
            'package_type' => 'required|in:Silver,Gold,Platinum,UpgradeSilverToGold,UpgradeSilverToPlatinum,UpgradeGoldToPlatinum',
            'quantity' => "required|integer|min:{$minQty}|max:100",
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
            'quantity.min' => $isStockist
                ? "Stokis wajib order minimal {$minQty} PIN sekaligus."
                : 'Minimal pemesanan 1 PIN.',
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

        $rawPackageType = $request->package_type;
        $isUpgrade = str_starts_with($rawPackageType, 'Upgrade');

        if ($isUpgrade) {
            $upgradeType = UpgradePinType::from(substr($rawPackageType, strlen('Upgrade')));
            $packageValue = $upgradeType->toPackage()->value;
            $upgradeFrom = $upgradeType->fromPackage()->value;
            $unitPrice = $upgradeType->price();
            $productLabel = $upgradeType->label();
        } else {
            $package = PackageType::from($rawPackageType);
            $packageValue = $package->value;
            $upgradeFrom = null;
            $unitPrice = $package->registrationPrice();
            $productLabel = 'PIN Registrasi '.$package->value;
        }

        // Hitung diskon: stokis atau volume (ambil yang terbesar)
        $settings = SiteSetting::instance();
        $user = auth()->user();
        $isStockist = $user->memberProfile?->is_stockist ?? false;
        $qty = (int) $request->quantity;

        $discountPercent = 0;
        if ($isStockist) {
            $discountPercent = (int) ($settings->stockist_discount_percent ?? 0);
        } else {
            if ($qty >= 10) {
                $discountPercent = (int) ($settings->volume_discount_10_percent ?? 0);
            } elseif ($qty >= 5) {
                $discountPercent = (int) ($settings->volume_discount_5_percent ?? 0);
            }
        }

        if ($discountPercent > 0) {
            $unitPrice = (int) round($unitPrice * (1 - $discountPercent / 100));
        }

        $total = $unitPrice * $qty;

        $pinOrder = PinOrder::create([
            'order_number' => PinOrder::generateOrderNumber(),
            'user_id' => auth()->id(),
            'package_type' => $packageValue,
            'upgrade_from' => $upgradeFrom,
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
                    productDetails: "{$productLabel} x{$request->quantity}",
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
