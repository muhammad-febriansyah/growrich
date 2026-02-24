<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DatabaseBackupController extends Controller
{
    private string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
    }

    public function index(): Response
    {
        if (! is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }

        $files = collect(glob($this->backupDir.'/*.sql') ?: [])
            ->map(fn ($path) => [
                'filename' => basename($path),
                'size' => filesize($path),
                'created_at' => date('Y-m-d H:i:s', filemtime($path)),
            ])
            ->sortByDesc('created_at')
            ->values();

        return Inertia::render('admin/database-backups/index', [
            'backups' => $files,
        ]);
    }

    public function store(): RedirectResponse
    {
        if (! is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }

        $db = config('database.connections.mysql');
        $filename = 'backup_'.now()->format('Y-m-d_H-i-s').'.sql';
        $filepath = $this->backupDir.'/'.$filename;

        $command = sprintf(
            'MYSQL_PWD=%s mysqldump -h %s -P %s -u %s --single-transaction --routines --triggers %s > %s 2>&1',
            escapeshellarg($db['password']),
            escapeshellarg($db['host']),
            escapeshellarg((string) $db['port']),
            escapeshellarg($db['username']),
            escapeshellarg($db['database']),
            escapeshellarg($filepath),
        );

        exec($command, $output, $exitCode);

        if ($exitCode !== 0 || ! file_exists($filepath) || filesize($filepath) === 0) {
            return back()->with('error', 'Gagal membuat backup database. Pastikan mysqldump tersedia di server.');
        }

        return back()->with('success', "Backup {$filename} berhasil dibuat.");
    }

    public function download(string $filename): BinaryFileResponse
    {
        $filename = basename($filename);
        $filepath = $this->backupDir.'/'.$filename;

        abort_unless(file_exists($filepath) && str_ends_with($filename, '.sql'), 404);

        return response()->download($filepath);
    }

    public function destroy(string $filename): RedirectResponse
    {
        $filename = basename($filename);
        $filepath = $this->backupDir.'/'.$filename;

        abort_unless(file_exists($filepath) && str_ends_with($filename, '.sql'), 404);

        unlink($filepath);

        return back()->with('success', "Backup {$filename} berhasil dihapus.");
    }
}
