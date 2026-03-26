<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendWithdrawalApprovedEmail;
use App\Jobs\SendWithdrawalRejectedEmail;
use App\Models\Withdrawal;
use App\Notifications\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = Withdrawal::query()->with('user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $withdrawals = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Withdrawal::query()->with(['user', 'processedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $withdrawals = $query->orderByDesc('created_at')->get();

        // ── Palette ──────────────────────────────────────────────────────────
        $C_HEADER = '257A15';
        $C_SUBHEADER = '32A620';
        $C_COL_FG = 'FFFFFF';
        $C_ROW_ODD = 'FFFFFF';
        $C_ROW_EVEN = 'EDFBEA';
        $C_TOTAL_BG = 'D5F0CE';
        $C_TOTAL_FG = '1A5C0E';
        $C_BORDER = 'A8D8A0';
        $C_FOOTER = '888888';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Penarikan');
        $sheet->getDefaultRowDimension()->setRowHeight(18);

        $lastCol = 'J';

        // Row 1: Company
        $sheet->mergeCells("A1:{$lastCol}1");
        $sheet->setCellValue('A1', 'PT GROWRICH INTERNATIONAL');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_HEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(42);

        // Row 2: Title
        $sheet->mergeCells("A2:{$lastCol}2");
        $sheet->setCellValue('A2', 'LAPORAN DATA PENARIKAN DANA');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Info
        $sheet->mergeCells("A3:{$lastCol}3");
        $sheet->setCellValue('A3', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total: '.$withdrawals->count().'   |   Total Jumlah: Rp '.number_format($withdrawals->sum('amount'), 0, ',', '.'));
        $sheet->getStyle('A3')->applyFromArray([
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(20);

        // Row 4: Spacer
        $sheet->getRowDimension(4)->setRowHeight(6);

        // Row 5: Headers
        $headers = ['A' => 'No.', 'B' => 'Tanggal', 'C' => 'ID Member', 'D' => 'Nama Member',
            'E' => 'Bank', 'F' => 'No. Rekening', 'G' => 'Nama Rekening',
            'H' => 'Jumlah (Rp)', 'I' => 'Status', 'J' => 'Diproses Oleh'];
        foreach ($headers as $col => $label) {
            $sheet->setCellValue("{$col}5", $label);
        }
        $sheet->getStyle("A5:{$lastCol}5")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_HEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
        ]);
        $sheet->getRowDimension(5)->setRowHeight(28);

        // Data rows
        $rowNum = 6;
        $totalAmount = 0;
        $statusLabel = ['pending' => 'Pending', 'approved' => 'Disetujui', 'rejected' => 'Ditolak'];

        foreach ($withdrawals as $i => $w) {
            $user = $w->user;
            $rowBg = $i % 2 === 0 ? $C_ROW_ODD : $C_ROW_EVEN;

            $sheet->setCellValue("A{$rowNum}", $i + 1);
            $sheet->setCellValue("B{$rowNum}", $w->created_at?->format('d/m/Y') ?? '-');
            $sheet->setCellValue("C{$rowNum}", $user?->member_id ?? $user?->referral_code ?? '-');
            $sheet->setCellValue("D{$rowNum}", $user?->name ?? '-');
            $sheet->setCellValue("E{$rowNum}", $w->bank_name);
            $sheet->setCellValue("F{$rowNum}", $w->account_number);
            $sheet->setCellValue("G{$rowNum}", $w->account_name);
            $sheet->setCellValue("H{$rowNum}", $w->amount);
            $sheet->setCellValue("I{$rowNum}", $statusLabel[$w->status] ?? $w->status);
            $sheet->setCellValue("J{$rowNum}", $w->processedBy?->name ?? '-');

            $totalAmount += $w->amount;

            $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            foreach (['A', 'B', 'C', 'I'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            $sheet->getStyle("H{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("H{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');

            $rowNum++;
        }

        // Total row
        $sheet->mergeCells("A{$rowNum}:G{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'TOTAL PENARIKAN');
        $sheet->setCellValue("H{$rowNum}", $totalAmount);
        $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_HEADER]]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle("H{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("H{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getRowDimension($rowNum)->setRowHeight(22);
        $rowNum++;

        // Footer
        $sheet->mergeCells("A{$rowNum}:{$lastCol}{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'Dokumen ini digenerate secara otomatis oleh sistem GrowRich pada '.now()->format('d/m/Y H:i').' WIB');
        $sheet->getStyle("A{$rowNum}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => $C_FOOTER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        // Column widths
        foreach (['A' => 5, 'B' => 14, 'C' => 16, 'D' => 28, 'E' => 18, 'F' => 22, 'G' => 26, 'H' => 20, 'I' => 14, 'J' => 22] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $sheet->freezePane('A6');
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);

        $filename = 'data-penarikan-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }

    public function show(Withdrawal $withdrawal)
    {
        $withdrawal->load(['user.memberProfile', 'processedBy']);

        return Inertia::render('admin/withdrawals/show', [
            'withdrawal' => $withdrawal,
        ]);
    }

    public function approve(Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        DB::transaction(function () use ($withdrawal) {
            $withdrawal->update([
                'status' => 'approved',
                'processed_by' => auth()->id(),
            ]);
        });

        SendWithdrawalApprovedEmail::dispatch($withdrawal->load('user'));

        $withdrawal->user->notify(new AppNotification(
            title: 'Penarikan Disetujui',
            body: 'Penarikan dana sebesar Rp '.number_format($withdrawal->amount, 0, ',', '.').' telah disetujui dan sedang diproses.',
            type: 'withdrawal_approved',
            url: '/member/wallet',
        ));

        ActivityLogger::log(
            'withdrawal.approved',
            "Penarikan dana member '{$withdrawal->user->name}' disetujui. Jumlah: Rp ".number_format($withdrawal->amount, 0, ',', '.'),
            $withdrawal,
        );

        return back()->with('success', 'Penarikan berhasil disetujui.');
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Permintaan sudah diproses.');
        }

        DB::transaction(function () use ($withdrawal) {
            $withdrawal->update([
                'status' => 'rejected',
                'processed_by' => auth()->id(),
            ]);

            $withdrawal->user->wallet->increment('balance', $withdrawal->amount);
        });

        SendWithdrawalRejectedEmail::dispatch($withdrawal->load('user'));

        $withdrawal->user->notify(new AppNotification(
            title: 'Penarikan Ditolak',
            body: 'Permintaan penarikan sebesar Rp '.number_format($withdrawal->amount, 0, ',', '.').' ditolak. Saldo telah dikembalikan ke e-wallet.',
            type: 'withdrawal_rejected',
            url: '/member/wallet',
        ));

        ActivityLogger::log(
            'withdrawal.rejected',
            "Penarikan dana member '{$withdrawal->user->name}' ditolak. Saldo Rp ".number_format($withdrawal->amount, 0, ',', '.').' dikembalikan.',
            $withdrawal,
        );

        return back()->with('success', 'Penarikan berhasil ditolak dan saldo dikembalikan.');
    }
}
