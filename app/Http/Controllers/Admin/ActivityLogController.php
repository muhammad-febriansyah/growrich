<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ActivityLog::query()->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('role')) {
            $query->where('user_role', $request->role);
        }

        if ($request->filled('search')) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('user_name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('ip_address', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->paginate(50)->withQueryString();

        $actionOptions = ActivityLog::query()
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('admin/activity-logs/index', [
            'logs' => $logs,
            'actionOptions' => $actionOptions,
            'filters' => $request->only(['action', 'role', 'search', 'date_from', 'date_to']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = ActivityLog::query()->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('role')) {
            $query->where('user_role', $request->role);
        }

        if ($request->filled('search')) {
            $keyword = $request->search;
            $query->where(function ($q) use ($keyword) {
                $q->where('user_name', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%")
                    ->orWhere('ip_address', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->get();

        // ── Palette ──────────────────────────────────────────────────────────
        $C_HEADER = '0F172A';
        $C_SUBHEADER = '334155';
        $C_COL_FG = 'FFFFFF';
        $C_ROW_ODD = 'FFFFFF';
        $C_ROW_EVEN = 'F8FAFC';
        $C_TOTAL_BG = 'E2E8F0';
        $C_TOTAL_FG = '0F172A';
        $C_BORDER = 'CBD5E1';
        $C_FOOTER = '888888';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Activity Log');
        $sheet->getDefaultRowDimension()->setRowHeight(18);

        $lastCol = 'G';

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
        $sheet->setCellValue('A2', 'LAPORAN ACTIVITY LOG / AUDIT TRAIL');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Info
        $sheet->mergeCells("A3:{$lastCol}3");
        $sheet->setCellValue('A3', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total Log: '.$logs->count());
        $sheet->getStyle('A3')->applyFromArray([
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(20);
        $sheet->getRowDimension(4)->setRowHeight(6);

        // Row 5: Headers
        $headers = ['A' => 'No.', 'B' => 'Waktu', 'C' => 'User', 'D' => 'Role', 'E' => 'Aksi', 'F' => 'Keterangan', 'G' => 'IP Address'];
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
        foreach ($logs as $i => $log) {
            $rowBg = $i % 2 === 0 ? $C_ROW_ODD : $C_ROW_EVEN;

            $sheet->setCellValue("A{$rowNum}", $i + 1);
            $sheet->setCellValue("B{$rowNum}", $log->created_at?->format('d/m/Y H:i:s') ?? '-');
            $sheet->setCellValue("C{$rowNum}", $log->user_name ?? 'System');
            $sheet->setCellValue("D{$rowNum}", $log->user_role ?? '-');
            $sheet->setCellValue("E{$rowNum}", $log->action);
            $sheet->setCellValue("F{$rowNum}", $log->description);
            $sheet->setCellValue("G{$rowNum}", $log->ip_address ?? '-');

            $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            ]);
            foreach (['A', 'B', 'D', 'E', 'G'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            $sheet->getStyle("F{$rowNum}")->getAlignment()->setWrapText(true);

            $rowNum++;
        }

        // Footer
        $sheet->mergeCells("A{$rowNum}:{$lastCol}{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'Dokumen ini digenerate secara otomatis oleh sistem GrowRich pada '.now()->format('d/m/Y H:i').' WIB');
        $sheet->getStyle("A{$rowNum}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => $C_FOOTER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);

        foreach (['A' => 5, 'B' => 18, 'C' => 24, 'D' => 12, 'E' => 22, 'F' => 50, 'G' => 16] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $sheet->freezePane('A6');
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);

        $filename = 'activity-log-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }
}
