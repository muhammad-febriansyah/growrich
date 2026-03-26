<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WalletController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $query = WalletTransaction::query()->with('wallet.user');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->whereHas('wallet.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('member_id', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->orderByDesc('created_at')->get();

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
        $sheet->setTitle('Transaksi Wallet');
        $sheet->getDefaultRowDimension()->setRowHeight(18);

        $lastCol = 'I';

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
        $sheet->setCellValue('A2', 'LAPORAN TRANSAKSI E-WALLET MEMBER');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Info
        $totalCredit = $transactions->where('type', 'credit')->sum('amount');
        $totalDebit = $transactions->where('type', 'debit')->sum('amount');

        $sheet->mergeCells("A3:{$lastCol}3");
        $sheet->setCellValue('A3', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total: '.$transactions->count().'   |   Masuk: Rp '.number_format($totalCredit, 0, ',', '.').'   |   Keluar: Rp '.number_format($totalDebit, 0, ',', '.'));
        $sheet->getStyle('A3')->applyFromArray([
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(20);

        // Row 4: Spacer
        $sheet->getRowDimension(4)->setRowHeight(6);

        // Row 5: Headers
        $headers = [
            'A' => 'No.', 'B' => 'Tanggal', 'C' => 'ID Member', 'D' => 'Nama Member',
            'E' => 'Tipe', 'F' => 'Jumlah (Rp)', 'G' => 'Keterangan',
            'H' => 'Saldo Sebelum (Rp)', 'I' => 'Saldo Sesudah (Rp)',
        ];
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
        foreach ($transactions as $i => $trx) {
            $user = $trx->wallet?->user;
            $rowBg = $i % 2 === 0 ? $C_ROW_ODD : $C_ROW_EVEN;

            $sheet->setCellValue("A{$rowNum}", $i + 1);
            $sheet->setCellValue("B{$rowNum}", $trx->created_at?->format('d/m/Y H:i') ?? '-');
            $sheet->setCellValue("C{$rowNum}", $user?->member_id ?? $user?->referral_code ?? '-');
            $sheet->setCellValue("D{$rowNum}", $user?->name ?? '-');
            $sheet->setCellValue("E{$rowNum}", $trx->type === 'credit' ? 'Masuk' : 'Keluar');
            $sheet->setCellValue("F{$rowNum}", $trx->amount);
            $sheet->setCellValue("G{$rowNum}", $trx->description ?? '-');
            $sheet->setCellValue("H{$rowNum}", $trx->balance_before);
            $sheet->setCellValue("I{$rowNum}", $trx->balance_after);

            $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            foreach (['A', 'B', 'C', 'E'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            foreach (['F', 'H', 'I'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("{$c}{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
            }

            $rowNum++;
        }

        // Total row
        $sheet->mergeCells("A{$rowNum}:E{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'TOTAL TRANSAKSI: '.$transactions->count());
        $sheet->setCellValue("F{$rowNum}", $totalCredit + $totalDebit);
        $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_HEADER]]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle("F{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("F{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
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
        foreach (['A' => 5, 'B' => 18, 'C' => 16, 'D' => 28, 'E' => 10, 'F' => 20, 'G' => 32, 'H' => 22, 'I' => 22] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $sheet->freezePane('A6');
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);

        $filename = 'transaksi-wallet-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }
}
