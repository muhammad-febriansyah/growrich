import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Database, Download, HardDrive, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Backup {
    filename: string;
    size: number;
    created_at: string;
}

interface Props {
    backups: Backup[];
}

interface FlashProps {
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Backup Database', href: '/admin/database-backups' }];

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function DatabaseBackupIndex({ backups }: Props) {
    const { flash } = usePage<{ flash: FlashProps }>().props;

    const handleCreate = () => {
        if (confirm('Buat backup database sekarang? Proses ini mungkin memerlukan beberapa saat.')) {
            router.post('/admin/database-backups');
        }
    };

    const handleDelete = (filename: string) => {
        if (confirm(`Hapus backup "${filename}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/admin/database-backups/${encodeURIComponent(filename)}`);
        }
    };

    const columns: ColumnDef<Backup>[] = [
        {
            accessorKey: 'filename',
            header: 'Nama File',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <code className="font-mono text-xs font-semibold text-slate-700">
                        {row.original.filename}
                    </code>
                </div>
            ),
        },
        {
            accessorKey: 'size',
            header: () => <div className="text-right">Ukuran</div>,
            cell: ({ row }) => (
                <div className="text-right text-muted-foreground font-mono text-xs">
                    {formatBytes(row.original.size)}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Dibuat',
            cell: ({ row }) => (
                <div className="text-muted-foreground text-xs">
                    {new Date(row.original.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const backup = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <a href={`/admin/database-backups/${encodeURIComponent(backup.filename)}/download`}>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                                <Download className="h-3.5 w-3.5" />
                                Unduh
                            </Button>
                        </a>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                            onClick={() => handleDelete(backup.filename)}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Backup Database" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Backup Database</h1>
                        <p className="text-sm text-muted-foreground">Buat dan kelola backup database aplikasi.</p>
                    </div>
                    <Button onClick={handleCreate} className="gap-1.5 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Buat Backup Sekarang
                    </Button>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                        {flash.error}
                    </div>
                )}

                {/* Info Card */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 text-sm text-blue-700">
                    <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <div>
                        <p className="font-bold">Informasi Backup</p>
                        <p className="mt-0.5 text-xs text-blue-600/80 leading-relaxed">
                            Backup disimpan di server dalam format <code className="font-mono font-bold">.sql</code>. Unduh dan simpan salinan secara berkala di tempat yang aman. Backup lama dapat dihapus untuk menghemat ruang penyimpanan.
                        </p>
                    </div>
                </div>

                {/* Backup List using DataTable */}
                <DataTable
                    columns={columns}
                    data={backups}
                    searchKey="filename"
                    searchPlaceholder="Cari nama file..."
                    showPagination={true}
                    pageSize={10}
                    emptyTitle="Belum ada backup"
                    emptyDescription="Klik 'Buat Backup Sekarang' untuk membuat backup pertama database Anda."
                />

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    Total {backups.length} backup · Disimpan di{' '}
                    <code className="lowercase font-mono text-slate-500">storage/app/backups/</code>
                </p>
            </div>
        </AppLayout>
    );
}
