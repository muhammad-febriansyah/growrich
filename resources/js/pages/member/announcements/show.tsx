import { Link } from '@inertiajs/react';
import { ArrowLeft, Pin } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'info' | 'promo' | 'warning' | 'system';
    is_pinned: boolean;
    published_at: string;
    expires_at: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengumuman', href: '/member/announcements' },
    { title: 'Detail', href: '#' },
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

const typeBorder: Record<string, string> = {
    info: 'border-t-blue-400',
    promo: 'border-t-green-400',
    warning: 'border-t-amber-400',
    system: 'border-t-slate-400',
};

function formatDate(str: string): string {
    return new Date(str).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function AnnouncementShow({ announcement }: { announcement: Announcement }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="px-4 py-6">
                <Link
                    href="/member/announcements"
                    className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke pengumuman
                </Link>

                <div className={`overflow-hidden rounded-xl border border-t-4 bg-white ${typeBorder[announcement.type]}`}>
                    <div className="p-6">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeBadge[announcement.type]}`}>
                                {typeLabel[announcement.type]}
                            </span>
                            {announcement.is_pinned && (
                                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                                    <Pin className="size-3" /> Disematkan
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold leading-tight">{announcement.title}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">{formatDate(announcement.published_at)}</p>

                        <hr className="my-5" />

                        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                            {announcement.content}
                        </div>

                        {announcement.expires_at && (
                            <p className="mt-6 text-xs text-muted-foreground">
                                Berlaku hingga: {formatDate(announcement.expires_at)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
