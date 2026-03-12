<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\PackageType;
use App\Http\Controllers\Controller;
use App\Jobs\SendPinOrderCompletedEmail;
use App\Jobs\SendPinOrderShippedEmail;
use App\Models\PinOrder;
use App\Models\RegistrationPin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        SendPinOrderCompletedEmail::dispatch($pinOrder);

        return back()->with('success', $msg);
    }

    public function ship(Request $request, PinOrder $pinOrder): RedirectResponse
    {
        if ($pinOrder->status !== 'completed') {
            return back()->with('error', 'Hanya order yang sudah selesai dapat ditandai dikirim.');
        }

        if ($pinOrder->shipped_at) {
            return back()->with('error', 'Order ini sudah ditandai dikirim sebelumnya.');
        }

        $request->validate([
            'shipping_courier' => 'required|string|max:100',
            'shipping_tracking_number' => 'required|string|max:100',
        ], [
            'shipping_courier.required' => 'Nama kurir wajib diisi.',
            'shipping_tracking_number.required' => 'Nomor resi wajib diisi.',
        ]);

        $pinOrder->update([
            'shipped_at' => now(),
            'shipping_courier' => $request->shipping_courier,
            'shipping_tracking_number' => $request->shipping_tracking_number,
        ]);

        SendPinOrderShippedEmail::dispatch($pinOrder->fresh());

        return back()->with('success', "Order #{$pinOrder->order_number} ditandai sudah dikirim via {$request->shipping_courier}.");
    }

    public function cancel(PinOrder $pinOrder): RedirectResponse
    {
        if ($pinOrder->status !== 'pending') {
            return back()->with('error', 'Hanya order berstatus pending yang dapat dibatalkan.');
        }

        $pinOrder->update(['status' => 'cancelled']);

        return back()->with('success', "Order #{$pinOrder->order_number} berhasil dibatalkan.");
    }

    public function export(Request $request): StreamedResponse
    {
        $query = PinOrder::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('package')) {
            $query->where('package_type', $request->package);
        }

        $orders = $query->latest()->get();

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Order PIN');

        // ── Warna brand ───────────────────────────────────────────────────────
        $colorHeader = '1E3A5F'; // navy dark
        $colorSubhead = '2563EB'; // blue-600
        $colorAlt = 'EFF6FF'; // blue-50 (baris ganjil)
        $colorWhite = 'FFFFFF';
        $colorBorder = 'BFDBFE'; // blue-200
        $colorGreen = 'D1FAE5';
        $colorYellow = 'FEF9C3';
        $colorRed = 'FEE2E2';

        // ── Baris 1: Judul laporan ─────────────────────────────────────────────
        $sheet->mergeCells('A1:U1');
        $sheet->setCellValue('A1', 'LAPORAN ORDER PIN — GrowRich');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $colorWhite]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        // ── Baris 2: Tanggal cetak ─────────────────────────────────────────────
        $sheet->mergeCells('A2:U2');
        $sheet->setCellValue('A2', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total Order: '.$orders->count());
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => $colorWhite]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $colorSubhead]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(18);

        // ── Baris 3: Header kolom ──────────────────────────────────────────────
        $headers = [
            'A' => 'No. Order',
            'B' => 'Member',
            'C' => 'Email',
            'D' => 'Jenis PIN',
            'E' => 'Qty',
            'F' => 'Harga Satuan',
            'G' => 'Total',
            'H' => 'Status Order',
            'I' => 'Status Kirim',
            'J' => 'No. HP',
            'K' => 'Penerima',
            'L' => 'Alamat',
            'M' => 'Provinsi',
            'N' => 'Kota',
            'O' => 'Kecamatan',
            'P' => 'Kelurahan',
            'Q' => 'Kode Pos',
            'R' => 'Catatan',
            'S' => 'Tgl. Order',
            'T' => 'Tgl. Selesai',
            'U' => 'Tgl. Dikirim',
        ];

        foreach ($headers as $col => $label) {
            $sheet->setCellValue($col.'3', $label);
        }

        $sheet->getStyle('A3:U3')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $colorWhite]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $colorHeader]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $colorBorder]]],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(22);

        // ── Baris data ─────────────────────────────────────────────────────────
        $row = 4;
        foreach ($orders as $order) {
            $pkg = $order->package_type instanceof PackageType
                ? $order->package_type->value
                : $order->package_type;

            $pinLabel = $order->upgrade_from
                ? "Upgrade {$order->upgrade_from} → {$pkg}"
                : "Registrasi {$pkg}";

            $statusLabel = match ($order->status) {
                'completed' => 'Selesai',
                'cancelled' => 'Dibatalkan',
                default => 'Menunggu',
            };

            $shipLabel = $order->shipped_at ? 'Sudah Dikirim' : 'Belum Dikirim';

            $sheet->fromArray([
                $order->order_number,
                $order->user?->name ?? '-',
                $order->user?->email ?? '-',
                $pinLabel,
                $order->quantity,
                $order->unit_price,
                $order->total_amount,
                $statusLabel,
                $shipLabel,
                $order->phone,
                $order->shipping_name,
                $order->shipping_address,
                $order->shipping_province,
                $order->shipping_city,
                $order->shipping_district,
                $order->shipping_village,
                $order->shipping_postal_code,
                $order->notes ?? '',
                $order->created_at->format('d/m/Y H:i'),
                $order->completed_at?->format('d/m/Y H:i') ?? '',
                $order->shipped_at?->format('d/m/Y H:i') ?? '',
            ], null, 'A'.$row);

            // Warna baris selang-seling
            $bgRow = ($row % 2 === 0) ? $colorAlt : $colorWhite;
            $sheet->getStyle("A{$row}:U{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgRow]],
                'font' => ['size' => 9],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'DBEAFE']]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            // Warna badge Status Order
            $statusColor = match ($order->status) {
                'completed' => $colorGreen,
                'cancelled' => $colorRed,
                default => $colorYellow,
            };
            $sheet->getStyle("H{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $statusColor]],
                'font' => ['bold' => true, 'size' => 9],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Warna badge Status Kirim
            $shipColor = $order->shipped_at ? $colorGreen : $colorYellow;
            $sheet->getStyle("I{$row}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $shipColor]],
                'font' => ['bold' => true, 'size' => 9],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // Format rupiah
            $sheet->getStyle("F{$row}")->getNumberFormat()->setFormatCode('"Rp "#,##0');
            $sheet->getStyle("G{$row}")->getNumberFormat()->setFormatCode('"Rp "#,##0');

            // Center qty
            $sheet->getStyle("E{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet->getRowDimension($row)->setRowHeight(18);
            $row++;
        }

        // ── Lebar kolom ────────────────────────────────────────────────────────
        $colWidths = [
            'A' => 22, 'B' => 20, 'C' => 26, 'D' => 24, 'E' => 6,
            'F' => 16, 'G' => 16, 'H' => 14, 'I' => 16, 'J' => 16,
            'K' => 20, 'L' => 30, 'M' => 16, 'N' => 18, 'O' => 16,
            'P' => 16, 'Q' => 10, 'R' => 20, 'S' => 16, 'T' => 16, 'U' => 16,
        ];
        foreach ($colWidths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        // ── Freeze header ──────────────────────────────────────────────────────
        $sheet->freezePane('A4');

        // ── Auto-filter ────────────────────────────────────────────────────────
        $sheet->setAutoFilter('A3:U3');

        $filename = 'pin-orders-'.now()->format('Ymd-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
