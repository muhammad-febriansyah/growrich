import { Link, router } from '@inertiajs/react';
import { Megaphone, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    title: string;
    type: 'info' | 'promo' | 'warning' | 'system';
    is_pinned: boolean;
    published_at: string;
    expires_at: string | null;
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
    { title: 'Pengumuman', href: '/member/announcements' },
];

const typeLabel: Record<string, string> = {
    info: 'Info',
    promo: 'Promo',
    warning: 'Peringatan',
    system: 'Sistem',
};

const typeBadge: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700',
    promo: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    system: 'bg-slate-100 text-slate-700',
};

const typeAccent: Record<string, string> = {
    info: 'border-l-blue-400',
    promo: 'border-l-green-400',
    warning: 'border-l-amber-400',
    system: 'border-l-slate-400',
};

function formatDate(str: string): string {
    return new Date(str).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function AnnouncementsIndex({ announcements }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold">Pengumuman</h1>
                    <p className="text-sm text-muted-foreground">Informasi terbaru dari manajemen.</p>
                </div>

                {/* List */}
                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
                        <Megaphone className="size-10 text-muted-foreground/30" />
                        <p className="font-medium text-muted-foreground">Belum ada pengumuman</p>
                        <p className="text-sm text-muted-foreground/70">Pengumuman terbaru akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.data.map((ann) => (
                            <Link
                                key={ann.id}
                                href={`/member/announcements/${ann.id}`}
                                className={`block rounded-xl border border-l-4 bg-white p-4 transition-all hover:shadow-sm ${typeAccent[ann.type]}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${typeBadge[ann.type]}`}>
                                                {typeLabel[ann.type]}
                                            </span>
                                            {ann.is_pinned && (
                                                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                                    <Pin className="size-3" /> Disematkan
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold">{ann.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(ann.published_at)}</p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground/70">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {announcements.current_page > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/member/announcements', { page: announcements.current_page - 1 })}
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
                                onClick={() => router.get('/member/announcements', { page: announcements.current_page + 1 })}
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
