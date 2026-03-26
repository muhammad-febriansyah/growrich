<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\BonusStatus;
use App\Http\Controllers\Controller;
use App\Jobs\SendBonusApprovedEmail;
use App\Jobs\SendBonusRejectedEmail;
use App\Models\Bonus;
use App\Notifications\AppNotification;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BonusController extends Controller
{
    public function index(Request $request)
    {
        $query = Bonus::query()->with('memberProfile.user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('bonus_type', $request->type);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $bonuses = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'pending' => Bonus::where('status', BonusStatus::Pending)->count(),
            'approved' => Bonus::where('status', BonusStatus::Approved)->count(),
            'rejected' => Bonus::where('status', BonusStatus::Rejected)->count(),
            'paid' => Bonus::where('status', BonusStatus::Paid)->count(),
            'total_amount' => Bonus::where('status', BonusStatus::Paid)->sum('cash_amount'),
        ];

        return Inertia::render('admin/bonuses/index', [
            'bonuses' => $bonuses,
            'filters' => $request->only(['status', 'type', 'search']),
            'stats' => $stats,
        ]);
    }

    public function show(Bonus $bonus): Response
    {
        $bonus->load([
            'memberProfile.user',
            'memberProfile.parent.user',
            'approvedBy',
            'dailyBonusRun',
        ]);

        return Inertia::render('admin/bonuses/show', [
            'bonus' => $bonus,
        ]);
    }

    public function approve(Bonus $bonus)
    {
        if ($bonus->status !== BonusStatus::Pending) {
            return back()->with('error', 'Hanya bonus berstatus Pending yang dapat disetujui.');
        }

        DB::transaction(function () use ($bonus) {
            $bonus->update([
                'status' => BonusStatus::Approved,
                'approved_by' => auth()->id(),
            ]);

            $wallet = $bonus->memberProfile->user->wallet;
            $wallet->credit(
                $bonus->ewallet_amount,
                'Bonus '.$bonus->bonus_type->value.' disetujui',
                Bonus::class,
                $bonus->id,
            );
        });

        SendBonusApprovedEmail::dispatch($bonus->load('memberProfile.user'));

        $bonus->memberProfile->user->notify(new AppNotification(
            title: 'Bonus Disetujui',
            body: 'Bonus '.ucfirst($bonus->bonus_type->value).' sebesar Rp '.number_format($bonus->ewallet_amount, 0, ',', '.').' telah disetujui dan masuk ke e-wallet Anda.',
            type: 'bonus_approved',
            url: '/member/bonuses',
        ));

        ActivityLogger::log(
            'bonus.approved',
            "Bonus {$bonus->bonus_type->value} member '{$bonus->memberProfile->user->name}' disetujui. Jumlah: Rp ".number_format($bonus->ewallet_amount, 0, ',', '.'),
            $bonus,
        );

        return back()->with('success', 'Bonus berhasil disetujui dan saldo member telah diperbarui.');
    }

    public function pay(Bonus $bonus)
    {
        if ($bonus->status !== BonusStatus::Approved) {
            return back()->with('error', 'Hanya bonus berstatus Disetujui yang dapat ditandai Dibayar.');
        }

        $bonus->update(['status' => BonusStatus::Paid]);

        return back()->with('success', 'Bonus berhasil ditandai sebagai Sudah Dibayar.');
    }

    public function dailyPayment(Request $request): Response
    {
        $date = $request->get('tanggal', today()->toDateString());

        $rows = Bonus::query()
            ->with('memberProfile.user')
            ->whereIn('status', [BonusStatus::Pending, BonusStatus::Approved, BonusStatus::Paid])
            ->where('bonus_date', $date)
            ->get()
            ->groupBy('member_profile_id')
            ->map(function ($bonuses) {
                $profile = $bonuses->first()->memberProfile;
                $user = $profile->user;

                return [
                    'member_profile_id' => $profile->id,
                    'name' => $user->name,
                    'referral_code' => $user->referral_code,
                    'bank_name' => $profile->bank_name,
                    'bank_account_number' => $profile->bank_account_number,
                    'bank_account_name' => $profile->bank_account_name,
                    'bonuses' => $bonuses->map(fn (Bonus $b) => [
                        'id' => $b->id,
                        'bonus_type' => $b->bonus_type->value,
                        'cash_amount' => $b->cash_amount,
                        'status' => $b->status->value,
                    ])->values(),
                    'total_cash' => $bonuses->sum('cash_amount'),
                    'all_paid' => $bonuses->every(fn (Bonus $b) => $b->status === BonusStatus::Paid),
                ];
            })
            ->values();

        $stats = [
            'total_members' => $rows->count(),
            'total_unpaid' => $rows->where('all_paid', false)->count(),
            'total_cash' => $rows->sum('total_cash'),
            'total_unpaid_cash' => $rows->where('all_paid', false)->sum('total_cash'),
        ];

        return Inertia::render('admin/bonuses/daily-payment', [
            'members' => $rows,
            'date' => $date,
            'stats' => $stats,
        ]);
    }

    public function payMember(Request $request)
    {
        $request->validate([
            'member_profile_id' => 'required|integer|exists:member_profiles,id',
            'date' => 'required|date',
        ]);

        $bonuses = Bonus::with('memberProfile.user')
            ->where('member_profile_id', $request->member_profile_id)
            ->where('bonus_date', $request->date)
            ->whereIn('status', [BonusStatus::Pending, BonusStatus::Approved])
            ->get();

        DB::transaction(function () use ($bonuses) {
            foreach ($bonuses as $bonus) {
                if ($bonus->status === BonusStatus::Pending) {
                    $bonus->memberProfile->user->wallet->credit(
                        $bonus->ewallet_amount,
                        'Bonus '.$bonus->bonus_type->value.' disetujui',
                        Bonus::class,
                        $bonus->id,
                    );
                }

                $bonus->update([
                    'status' => BonusStatus::Paid,
                    'approved_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Member berhasil ditandai sudah ditransfer.');
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Bonus::query()->with('memberProfile.user');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('bonus_type', $request->type);
        }

        if ($request->filled('search')) {
            $query->whereHas('memberProfile.user', function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('member_id', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $bonuses = $query->orderByDesc('bonus_date')->get();

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
        $sheet->setTitle('Data Bonus');
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
        $sheet->setCellValue('A2', 'LAPORAN DATA BONUS');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Info
        $sheet->mergeCells("A3:{$lastCol}3");
        $sheet->setCellValue('A3', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total Bonus: '.$bonuses->count().'   |   Total Jumlah: Rp '.number_format($bonuses->sum('amount'), 0, ',', '.'));
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
            'E' => 'Jenis Bonus', 'F' => 'Jumlah (Rp)', 'G' => 'Cash 80% (Rp)', 'H' => 'E-Wallet 20% (Rp)', 'I' => 'Status'];
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
        $totalCash = 0;
        $totalEwallet = 0;

        foreach ($bonuses as $i => $bonus) {
            $user = $bonus->memberProfile?->user;
            $rowBg = $i % 2 === 0 ? $C_ROW_ODD : $C_ROW_EVEN;

            $sheet->setCellValue("A{$rowNum}", $i + 1);
            $sheet->setCellValue("B{$rowNum}", $bonus->bonus_date?->format('d/m/Y') ?? '-');
            $sheet->setCellValue("C{$rowNum}", $user?->member_id ?? $user?->referral_code ?? '-');
            $sheet->setCellValue("D{$rowNum}", $user?->name ?? '-');
            $sheet->setCellValue("E{$rowNum}", $bonus->bonus_type instanceof \BackedEnum ? $bonus->bonus_type->value : $bonus->bonus_type);
            $sheet->setCellValue("F{$rowNum}", $bonus->amount);
            $sheet->setCellValue("G{$rowNum}", $bonus->cash_amount);
            $sheet->setCellValue("H{$rowNum}", $bonus->ewallet_amount);
            $sheet->setCellValue("I{$rowNum}", $bonus->status instanceof \BackedEnum ? $bonus->status->value : $bonus->status);

            $totalAmount += $bonus->amount;
            $totalCash += $bonus->cash_amount;
            $totalEwallet += $bonus->ewallet_amount;

            $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            foreach (['A', 'B', 'C', 'E', 'I'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
            foreach (['F', 'G', 'H'] as $c) {
                $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("{$c}{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
            }

            $rowNum++;
        }

        // Total row
        $sheet->mergeCells("A{$rowNum}:E{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'TOTAL');
        $sheet->setCellValue("F{$rowNum}", $totalAmount);
        $sheet->setCellValue("G{$rowNum}", $totalCash);
        $sheet->setCellValue("H{$rowNum}", $totalEwallet);
        $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_HEADER]]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        foreach (['F', 'G', 'H'] as $c) {
            $sheet->getStyle("{$c}{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("{$c}{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
        }
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
        foreach (['A' => 5, 'B' => 14, 'C' => 16, 'D' => 28, 'E' => 18, 'F' => 20, 'G' => 20, 'H' => 20, 'I' => 14] as $col => $w) {
            $sheet->getColumnDimension($col)->setWidth($w);
        }

        $sheet->freezePane('A6');
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);

        $filename = 'data-bonus-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }

    public function exportDailyPayment(Request $request): StreamedResponse
    {
        $date = $request->get('tanggal', today()->toDateString());

        $rows = Bonus::query()
            ->with('memberProfile.user')
            ->whereIn('status', [BonusStatus::Pending, BonusStatus::Approved, BonusStatus::Paid])
            ->where('bonus_date', $date)
            ->orderBy('member_profile_id')
            ->get()
            ->groupBy('member_profile_id');

        $months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        $d = now()->parse($date);
        $dateId = $d->day.' '.$months[$d->month - 1].' '.$d->year;

        // ── Palette ──────────────────────────────────────────────────────────
        $C_HEADER = '257A15';
        $C_SUBHEADER = '32A620';
        $C_DATE_BG = 'E5F7E0';
        $C_DATE_FG = '257A15';
        $C_COL_FG = 'FFFFFF';
        $C_ROW_ODD = 'FFFFFF';
        $C_ROW_EVEN = 'EDFBEA';
        $C_TOTAL_BG = 'D5F0CE';
        $C_TOTAL_FG = '1A5C0E';
        $C_BORDER = 'A8D8A0';
        $C_FOOTER = '888888';

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Pembayaran Bonus');
        $sheet->getDefaultRowDimension()->setRowHeight(18);

        // Row 1: Company name
        $sheet->mergeCells('A1:I1');
        $sheet->setCellValue('A1', 'PT GROWRICH INTERNATIONAL');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => $C_COL_FG], 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_HEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(42);

        // Row 2: Report title
        $sheet->mergeCells('A2:I2');
        $sheet->setCellValue('A2', 'LAPORAN PEMBAYARAN BONUS HARIAN');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG], 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Date
        $sheet->mergeCells('A3:I3');
        $sheet->setCellValue('A3', 'Tanggal Pembayaran: '.$dateId);
        $sheet->getStyle('A3')->applyFromArray([
            'font' => ['size' => 11, 'italic' => true, 'color' => ['rgb' => $C_DATE_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_DATE_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(22);

        // Row 4: Spacer
        $sheet->getRowDimension(4)->setRowHeight(6);

        // Row 5: Column headers
        $headers = [
            'A' => 'No.',
            'B' => 'Nama Member',
            'C' => 'Kode Referral',
            'D' => 'Nama Bank',
            'E' => 'No. Rekening',
            'F' => 'Atas Nama Rekening',
            'G' => 'Jenis Bonus',
            'H' => 'Jumlah Cash (Rp)',
            'I' => 'Status Transfer',
        ];
        foreach ($headers as $col => $header) {
            $sheet->setCellValue($col.'5', $header);
        }
        $sheet->getStyle('A5:I5')->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_COL_FG], 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_HEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
        ]);
        $sheet->getRowDimension(5)->setRowHeight(28);

        // Data rows
        $rowNum = 6;
        $no = 1;
        $totalCash = 0;
        $memberToggle = false;

        foreach ($rows as $bonuses) {
            $profile = $bonuses->first()->memberProfile;
            $user = $profile->user;
            $memberToggle = ! $memberToggle;
            $rowBg = $memberToggle ? $C_ROW_ODD : $C_ROW_EVEN;
            $first = true;

            foreach ($bonuses as $bonus) {
                $sheet->setCellValue('A'.$rowNum, $first ? $no : '');
                $sheet->setCellValue('B'.$rowNum, $first ? $user->name : '');
                $sheet->setCellValue('C'.$rowNum, $first ? $user->referral_code : '');
                $sheet->setCellValue('D'.$rowNum, $first ? ($profile->bank_name ?? '-') : '');
                $sheet->setCellValue('E'.$rowNum, $first ? ($profile->bank_account_number ?? '-') : '');
                $sheet->setCellValue('F'.$rowNum, $first ? ($profile->bank_account_name ?? '-') : '');
                $sheet->setCellValue('G'.$rowNum, $bonus->bonus_type->value);
                $sheet->setCellValue('H'.$rowNum, $bonus->cash_amount);
                $sheet->setCellValue('I'.$rowNum, $bonus->status === BonusStatus::Paid ? 'Sudah Ditransfer' : 'Belum Ditransfer');

                $totalCash += $bonus->cash_amount;

                $sheet->getStyle("A{$rowNum}:I{$rowNum}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getStyle("H{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
                $sheet->getStyle("A{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("C{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("G{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("H{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle("I{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                $first = false;
                $rowNum++;
            }

            $no++;
        }

        // Total row
        $sheet->mergeCells("A{$rowNum}:G{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'TOTAL PEMBAYARAN');
        $sheet->setCellValue("H{$rowNum}", $totalCash);
        $sheet->getStyle("A{$rowNum}:I{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_HEADER]]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getStyle("H{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
        $sheet->getStyle("H{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getRowDimension($rowNum)->setRowHeight(26);
        $rowNum++;

        // Footer
        $sheet->mergeCells("A{$rowNum}:I{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", 'Dokumen ini digenerate secara otomatis oleh sistem GrowRich pada '.now()->format('d/m/Y H:i').' WIB');
        $sheet->getStyle("A{$rowNum}")->applyFromArray([
            'font' => ['italic' => true, 'size' => 9, 'color' => ['rgb' => $C_FOOTER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT],
        ]);
        $sheet->getRowDimension($rowNum)->setRowHeight(16);

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(28);
        $sheet->getColumnDimension('C')->setWidth(16);
        $sheet->getColumnDimension('D')->setWidth(16);
        $sheet->getColumnDimension('E')->setWidth(22);
        $sheet->getColumnDimension('F')->setWidth(26);
        $sheet->getColumnDimension('G')->setWidth(18);
        $sheet->getColumnDimension('H')->setWidth(22);
        $sheet->getColumnDimension('I')->setWidth(20);

        $sheet->freezePane('A6');

        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);
        $margins = $sheet->getPageMargins();
        $margins->setTop(0.5);
        $margins->setBottom(0.5);
        $margins->setLeft(0.5);
        $margins->setRight(0.5);

        $filename = 'pembayaran-bonus-'.$date.'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }

    public function reject(Bonus $bonus)
    {
        if ($bonus->status !== BonusStatus::Pending) {
            return back()->with('error', 'Hanya bonus berstatus Pending yang dapat ditolak.');
        }

        $bonus->update([
            'status' => BonusStatus::Rejected,
            'approved_by' => auth()->id(),
        ]);

        SendBonusRejectedEmail::dispatch($bonus->load('memberProfile.user'));

        $bonus->memberProfile->user->notify(new AppNotification(
            title: 'Bonus Ditolak',
            body: 'Bonus '.ucfirst($bonus->bonus_type->value).' sebesar Rp '.number_format($bonus->amount, 0, ',', '.').' tidak dapat disetujui.',
            type: 'bonus_rejected',
            url: '/member/bonuses',
        ));

        ActivityLogger::log(
            'bonus.rejected',
            "Bonus {$bonus->bonus_type->value} member '{$bonus->memberProfile->user->name}' ditolak.",
            $bonus,
        );

        return back()->with('success', 'Bonus berhasil ditolak.');
    }
}
