<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Models\PinOrder;
use App\Models\RegistrationPin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PinOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PinOrder::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('package')) {
            $query->where('package_type', $request->package);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            })->orWhere('order_number', 'like', "%{$request->search}%");
        }

        $orders = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'pending' => PinOrder::where('status', 'pending')->count(),
            'completed' => PinOrder::where('status', 'completed')->count(),
            'cancelled' => PinOrder::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('admin/pin-orders/index', [
            'orders' => $orders,
            'stats' => $stats,
            'filters' => $request->only(['status', 'package', 'search']),
        ]);
    }

    public function complete(PinOrder $pinOrder): RedirectResponse
    {
        if ($pinOrder->status !== 'pending') {
            return back()->with('error', 'Order ini tidak dapat diselesaikan.');
        }

        // For Duitku orders, PINs are already auto-generated via callback.
        // For manual transfer, generate PINs now upon admin confirmation.
        if ($pinOrder->payment_method !== 'duitku') {
            if ($pinOrder->isUpgradePin()) {
                $upgradeType = $pinOrder->upgradePinType();
                for ($i = 0; $i < $pinOrder->quantity; $i++) {
                    RegistrationPin::create([
                        'pin_code' => 'UPIN-'.Str::upper(Str::random(8)),
                        'package_type' => $upgradeType->toPackage()->value,
                        'upgrade_from' => $upgradeType->fromPackage()->value,
                        'price' => $pinOrder->unit_price,
                        'status' => 'available',
                        'purchased_by' => $pinOrder->user_id,
                        'assigned_to' => $pinOrder->user_id,
                    ]);
                }
            } else {
                $package = $pinOrder->package_type instanceof PackageType
                    ? $pinOrder->package_type
                    : PackageType::from($pinOrder->package_type);

                for ($i = 0; $i < $pinOrder->quantity; $i++) {
                    RegistrationPin::create([
                        'pin_code' => 'PIN-'.Str::upper(Str::random(8)),
                        'package_type' => $package,
                        'price' => $pinOrder->unit_price,
                        'status' => 'available',
                        'purchased_by' => $pinOrder->user_id,
                        'assigned_to' => $pinOrder->user_id,
                    ]);
                }
            }
        }

        $pinOrder->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        $msg = $pinOrder->payment_method === 'duitku'
            ? "Order #{$pinOrder->order_number} selesai (PIN sudah di-generate via Duitku)."
            : "Order #{$pinOrder->order_number} selesai. {$pinOrder->quantity} PIN ditambahkan ke stok member.";

        return back()->with('success', $msg);
    }

    public function cancel(PinOrder $pinOrder): RedirectResponse
    {
        if ($pinOrder->status !== 'pending') {
            return back()->with('error', 'Hanya order berstatus pending yang dapat dibatalkan.');
        }

        $pinOrder->update(['status' => 'cancelled']);

        return back()->with('success', "Order #{$pinOrder->order_number} berhasil dibatalkan.");
    }

    public function export(Request $request): HttpResponse
    {
        $query = PinOrder::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('package')) {
            $query->where('package_type', $request->package);
        }

        $orders = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="pin-orders-'.now()->format('Ymd-His').'.csv"',
        ];

        $columns = [
            'No. Order',
            'Member',
            'Email',
            'Paket',
            'Jumlah',
            'Harga Satuan',
            'Total',
            'Status',
            'No. HP',
            'Penerima',
            'Alamat',
            'Provinsi',
            'Kota',
            'Kecamatan',
            'Kelurahan',
            'Kode Pos',
            'Catatan',
            'Tanggal Order',
            'Tanggal Selesai',
        ];

        $callback = function () use ($orders, $columns) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM for Excel
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                $pkg = $order->package_type instanceof PackageType
                    ? $order->package_type->value
                    : $order->package_type;

                fputcsv($file, [
                    $order->order_number,
                    $order->user?->name ?? '-',
                    $order->user?->email ?? '-',
                    $pkg,
                    $order->quantity,
                    $order->unit_price,
                    $order->total_amount,
                    $order->status,
                    $order->phone,
                    $order->shipping_name,
                    $order->shipping_address,
                    $order->shipping_province,
                    $order->shipping_city,
                    $order->shipping_district,
                    $order->shipping_village,
                    $order->shipping_postal_code,
                    $order->notes ?? '',
                    $order->created_at->format('Y-m-d H:i'),
                    $order->completed_at?->format('Y-m-d H:i') ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
