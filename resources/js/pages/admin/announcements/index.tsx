import { Link, router } from '@inertiajs/react';
import { Pin, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    title: string;
    type: 'info' | 'promo' | 'warning' | 'system';
    is_pinned: boolean;
    is_active: boolean;
    published_at: string | null;
    expires_at: string | null;
    created_at: string;
}

interface Props {
    announcements: {
        data: Announcement[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengumuman', href: '/admin/announcements' },
];

const typeLabel: Record<string, string> = {
    info: 'Info',
    promo: 'Promo',
    warning: 'Peringatan',
    system: 'Sistem',
};

const typeBadge: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    promo: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    system: 'bg-slate-100 text-slate-700 border-slate-200',
};

function formatDate(str: string | null): string {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function AnnouncementsIndex({ announcements }: Props) {
    const destroy = (id: number) => {
        if (!confirm('Hapus pengumuman ini?')) return;
        router.delete(`/admin/announcements/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Pengumuman</h1>
                        <p className="text-sm text-muted-foreground">{announcements.total} total pengumuman</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/announcements/create">
                            <Plus className="size-4" />
                            Buat Pengumuman
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
                        <p className="font-medium text-muted-foreground">Belum ada pengumuman</p>
                        <p className="text-sm text-muted-foreground/70">Buat pengumuman pertama untuk member.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Judul</th>
                                    <th className="px-4 py-3 text-left font-medium">Tipe</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Dipublikasikan</th>
                                    <th className="px-4 py-3 text-left font-medium">Kedaluwarsa</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {announcements.data.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {ann.is_pinned && (
                                                    <Pin className="size-3.5 text-amber-500" />
                                                )}
                                                <span className="font-medium">{ann.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${typeBadge[ann.type]}`}>
                                                {typeLabel[ann.type]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ann.is_active ? (
                                                <span className="flex items-center gap-1 text-green-600">
                                                    <Eye className="size-3.5" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <EyeOff className="size-3.5" /> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{formatDate(ann.published_at)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{formatDate(ann.expires_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/announcements/${ann.id}/edit`}>
                                                        <Pencil className="size-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => destroy(ann.id)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {announcements.current_page > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/admin/announcements', { page: announcements.current_page - 1 })}
                            >
                                Sebelumnya
                            </Button>
                        )}
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            {announcements.current_page} / {announcements.last_page}
                        </span>
                        {announcements.current_page < announcements.last_page && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/admin/announcements', { page: announcements.current_page + 1 })}
                            >
                                Selanjutnya
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
