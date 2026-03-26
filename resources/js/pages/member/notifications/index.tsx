import { router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Package, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Notification = {
    id: string;
    data: {
        title: string;
        body: string;
        type: string;
        url?: string;
    };
    read_at: string | null;
    created_at: string;
};

type PaginatedNotifications = {
    data: Notification[];
    current_page: number;
    last_page: number;
    total: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifikasi', href: '/member/notifications' },
];

const typeIcon: Record<string, React.ReactNode> = {
    bonus_approved: <Wallet className="size-5 text-green-500" />,
    bonus_rejected: <Wallet className="size-5 text-red-500" />,
    withdrawal_approved: <Wallet className="size-5 text-green-500" />,
    withdrawal_rejected: <Wallet className="size-5 text-red-500" />,
    pin_order_completed: <Package className="size-5 text-green-500" />,
    pin_order_shipped: <Package className="size-5 text-blue-500" />,
    pin_order_cancelled: <Package className="size-5 text-red-500" />,
    upgrade_approved: <Check className="size-5 text-green-500" />,
    upgrade_rejected: <Check className="size-5 text-red-500" />,
};

const typeLabel: Record<string, string> = {
    bonus_approved: 'Bonus',
    bonus_rejected: 'Bonus',
    withdrawal_approved: 'Penarikan',
    withdrawal_rejected: 'Penarikan',
    pin_order_completed: 'Order PIN',
    pin_order_shipped: 'Order PIN',
    pin_order_cancelled: 'Order PIN',
    upgrade_approved: 'Upgrade Paket',
    upgrade_rejected: 'Upgrade Paket',
};

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export default function NotificationsIndex({ notifications }: { notifications: PaginatedNotifications }) {
    const { unreadNotificationCount } = usePage().props;

    const markAsRead = (id: string, url?: string) => {
        router.patch(`/member/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (url) router.visit(url);
            },
        });
    };

    const markAllAsRead = () => {
        router.post('/member/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="px-4 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Notifikasi</h1>
                        <p className="text-sm text-muted-foreground">
                            {notifications.total} total, {unreadNotificationCount as number} belum dibaca
                        </p>
                    </div>
                    {(unreadNotificationCount as number) > 0 && (
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={markAllAsRead}>
                            <CheckCheck className="size-4" />
                            Baca semua
                        </Button>
                    )}
                </div>

                {/* List */}
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
                        <Bell className="size-10 text-muted-foreground/30" />
                        <p className="font-medium text-muted-foreground">Belum ada notifikasi</p>
                        <p className="text-sm text-muted-foreground/70">Notifikasi akan muncul di sini saat ada aktivitas akun Anda.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => markAsRead(notif.id, notif.data.url)}
                                className={cn(
                                    'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm',
                                    !notif.read_at ? 'border-blue-200 bg-blue-50/50' : 'border-border bg-white',
                                )}
                            >
                                <div className={cn(
                                    'flex size-10 shrink-0 items-center justify-center rounded-full',
                                    !notif.read_at ? 'bg-blue-100' : 'bg-muted',
                                )}>
                                    {typeIcon[notif.data.type] ?? <Bell className="size-5 text-muted-foreground" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {typeLabel[notif.data.type] ?? 'Sistem'}
                                            </span>
                                            <p className={cn('text-sm', !notif.read_at ? 'font-semibold' : 'font-medium')}>
                                                {notif.data.title}
                                            </p>
                                        </div>
                                        {!notif.read_at && (
                                            <div className="mt-1 size-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{notif.data.body}</p>
                                    <p className="mt-2 text-xs text-muted-foreground/70">{timeAgo(notif.created_at)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {notifications.current_page > 1 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/member/notifications', { page: notifications.current_page - 1 })}
                            >
                                Sebelumnya
                            </Button>
                        )}
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            {notifications.current_page} / {notifications.last_page}
                        </span>
                        {notifications.current_page < notifications.last_page && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.get('/member/notifications', { page: notifications.current_page + 1 })}
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
