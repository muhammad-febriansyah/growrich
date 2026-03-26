<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Mlm\LegPosition;
use App\Enums\Mlm\UserRole;
use App\Http\Controllers\Controller;
use App\Models\MemberProfile;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->where('role', UserRole::Member);

        if ($request->filled('package')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('package_type', $request->package);
            });
        }

        if ($request->filled('career_level')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('career_level', $request->career_level);
            });
        }

        if ($request->filled('status')) {
            $query->whereHas('memberProfile', function ($q) use ($request) {
                $q->where('package_status', $request->status);
            });
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('member_id', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $members = $query->with('memberProfile')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/members/index', [
            'members' => $members,
            'filters' => $request->only(['package', 'career_level', 'status', 'search']),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = User::query()->where('role', UserRole::Member)->with('memberProfile.parent.user');

        if ($request->filled('package')) {
            $query->whereHas('memberProfile', fn ($q) => $q->where('package_type', $request->package));
        }

        if ($request->filled('career_level')) {
            $query->whereHas('memberProfile', fn ($q) => $q->where('career_level', $request->career_level));
        }

        if ($request->filled('status')) {
            $query->whereHas('memberProfile', fn ($q) => $q->where('package_status', $request->status));
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('member_id', 'like', "%{$request->search}%")
                    ->orWhere('referral_code', 'like', "%{$request->search}%");
            });
        }

        $members = $query->latest()->get();

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
        $sheet->setTitle('Data Member');
        $sheet->getDefaultRowDimension()->setRowHeight(18);

        $cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
        $lastCol = end($cols);

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
        $sheet->setCellValue('A2', 'LAPORAN DATA MEMBER');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => $C_COL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_SUBHEADER]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(2)->setRowHeight(28);

        // Row 3: Info
        $sheet->mergeCells("A3:{$lastCol}3");
        $sheet->setCellValue('A3', 'Dicetak: '.now()->translatedFormat('d F Y, H:i').' WIB   |   Total Member: '.$members->count());
        $sheet->getStyle('A3')->applyFromArray([
            'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => $C_HEADER]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(20);

        // Row 4: Spacer
        $sheet->getRowDimension(4)->setRowHeight(6);

        // Row 5: Headers
        $headers = [
            'A' => 'No.', 'B' => 'ID Member', 'C' => 'Nama Lengkap', 'D' => 'Email',
            'E' => 'No. HP', 'F' => 'Paket', 'G' => 'Status', 'H' => 'Level Karir',
            'I' => 'Kode Referral', 'J' => 'Posisi', 'K' => 'Tanggal Daftar',
            'L' => 'Tanggal Aktif', 'M' => 'Bank', 'N' => 'No. Rekening',
            'O' => 'Nama Rekening', 'P' => 'PP Kiri', 'Q' => 'PP Kanan',
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
        foreach ($members as $i => $member) {
            $mp = $member->memberProfile;
            $rowBg = $i % 2 === 0 ? $C_ROW_ODD : $C_ROW_EVEN;

            $sheet->setCellValue("A{$rowNum}", $i + 1);
            $sheet->setCellValue("B{$rowNum}", $member->member_id ?? $member->referral_code);
            $sheet->setCellValue("C{$rowNum}", $member->name);
            $sheet->setCellValue("D{$rowNum}", $member->email);
            $sheet->setCellValue("E{$rowNum}", $member->phone ?? '-');
            $sheet->setCellValue("F{$rowNum}", $mp?->package_type instanceof \BackedEnum ? $mp->package_type->value : ($mp?->package_type ?? '-'));
            $sheet->setCellValue("G{$rowNum}", $mp?->package_status ?? '-');
            $sheet->setCellValue("H{$rowNum}", $mp?->career_level instanceof \BackedEnum ? $mp->career_level->value : ($mp?->career_level ?? '-'));
            $sheet->setCellValue("I{$rowNum}", $member->referral_code ?? '-');
            $sheet->setCellValue("J{$rowNum}", $mp?->leg_position instanceof \BackedEnum ? $mp->leg_position->value : ($mp?->leg_position ?? '-'));
            $sheet->setCellValue("K{$rowNum}", $member->created_at?->format('d/m/Y') ?? '-');
            $sheet->setCellValue("L{$rowNum}", $mp?->activated_at?->format('d/m/Y') ?? '-');
            $sheet->setCellValue("M{$rowNum}", $mp?->bank_name ?? '-');
            $sheet->setCellValue("N{$rowNum}", $mp?->bank_account_number ?? '-');
            $sheet->setCellValue("O{$rowNum}", $mp?->bank_account_name ?? '-');
            $sheet->setCellValue("P{$rowNum}", $mp?->left_pp_total ?? 0);
            $sheet->setCellValue("Q{$rowNum}", $mp?->right_pp_total ?? 0);

            $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $rowBg]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);
            $sheet->getStyle("A{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("B{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("I{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("J{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("K{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("L{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("P{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("Q{$rowNum}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("P{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');
            $sheet->getStyle("Q{$rowNum}")->getNumberFormat()->setFormatCode('#,##0');

            $rowNum++;
        }

        // Total row
        $sheet->mergeCells("A{$rowNum}:{$lastCol}{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", "TOTAL: {$members->count()} MEMBER");
        $sheet->getStyle("A{$rowNum}:{$lastCol}{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_TOTAL_FG]],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $C_TOTAL_BG]],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_HEADER]]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
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
        $widths = ['A' => 5, 'B' => 16, 'C' => 28, 'D' => 28, 'E' => 15, 'F' => 10, 'G' => 12,
            'H' => 20, 'I' => 16, 'J' => 8, 'K' => 14, 'L' => 14, 'M' => 16, 'N' => 20, 'O' => 24,
            'P' => 12, 'Q' => 12];
        foreach ($widths as $col => $width) {
            $sheet->getColumnDimension($col)->setWidth($width);
        }

        $sheet->freezePane('A6');
        $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setFitToWidth(1);

        $filename = 'data-member-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
            'Content-Disposition' => 'attachment',
        ]);
    }

    public function show(User $user)
    {
        $user->load('memberProfile', 'wallet');

        return Inertia::render('admin/members/show', [
            'member' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('memberProfile');

        return Inertia::render('admin/members/edit', [
            'member' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required',
            'role' => 'required',
            'package_type' => 'required',
            'career_level' => 'required',
        ]);

        $user->update([
            'status' => $request->status,
            'role' => $request->role,
        ]);

        $user->memberProfile->update([
            'package_type' => $request->package_type,
            'career_level' => $request->career_level,
        ]);

        ActivityLogger::log(
            'member.updated',
            "Data member '{$user->name}' diperbarui. Paket: {$request->package_type}, Level: {$request->career_level}.",
            $user,
        );

        return redirect()->route('admin.members.show', $user->id)->with('success', 'Data member berhasil diperbarui.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('password123'),
        ]);

        ActivityLogger::log(
            'member.password_reset',
            "Password member '{$user->name}' direset ke default oleh admin.",
            $user,
        );

        return back()->with('success', 'Password member berhasil direset ke "password123".');
    }

    public function setStockistLevel(Request $request, User $user): \Illuminate\Http\RedirectResponse
    {
        $profile = $user->memberProfile;

        if (! $profile) {
            return back()->with('error', 'Profil member tidak ditemukan.');
        }

        $validated = $request->validate([
            'stockist_level' => 'nullable|in:center,point,sub',
            'stockist_parent_id' => 'nullable|exists:member_profiles,id',
        ]);

        $level = $validated['stockist_level'] ?? null;
        $parentId = $validated['stockist_parent_id'] ?? null;

        $profile->update([
            'is_stockist' => $level !== null,
            'stockist_level' => $level,
            'stockist_parent_id' => $level !== null ? $parentId : null,
        ]);

        $label = $level
            ? \App\Enums\Mlm\StockistLevel::from($level)->label()
            : 'bukan stokis';

        ActivityLogger::log(
            'member.stockist_toggled',
            "Level stokis member '{$user->name}' diubah menjadi: {$label}.",
            $user,
        );

        return back()->with('success', "Level stokis {$user->name} berhasil diperbarui.");
    }

    public function destroy(User $user): \Illuminate\Http\RedirectResponse
    {
        $profile = $user->memberProfile;

        if (! $profile || is_null($profile->parent_id)) {
            return back()->with('error', 'Member root tidak dapat dihapus.');
        }

        $parentProfile = MemberProfile::find($profile->parent_id);
        $legPosition = $profile->leg_position;
        $memberName = $user->name;

        ActivityLogger::log(
            'member.deleted',
            "Member '{$memberName}' dihapus dari sistem.",
        );

        $user->delete();

        if ($parentProfile && $legPosition) {
            if ($legPosition === LegPosition::Left) {
                $parentProfile->update([
                    'left_pp_total' => 0,
                    'left_rp_total' => 0,
                ]);
            } else {
                $parentProfile->update([
                    'right_pp_total' => 0,
                    'right_rp_total' => 0,
                ]);
            }
        }

        return redirect()->route('admin.members.index')
            ->with('success', "Member {$memberName} berhasil dihapus beserta seluruh data terkait.");
    }
}
