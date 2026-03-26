import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, CheckCheck, ChevronRight, Package, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type NotificationItem = {
    id: string;
    type: string;
    notifiable_id: number;
    notifiable_type: string;
    data: {
        title: string;
        body: string;
        type: string;
        url?: string;
    };
    read_at: string | null;
    created_at: string;
};

type Props = {
    notifications?: NotificationItem[];
};

const typeIcon: Record<string, React.ReactNode> = {
    bonus_approved: <Wallet className="size-4 text-green-500" />,
    bonus_rejected: <Wallet className="size-4 text-red-500" />,
    withdrawal_approved: <Wallet className="size-4 text-green-500" />,
    withdrawal_rejected: <Wallet className="size-4 text-red-500" />,
    pin_order_completed: <Package className="size-4 text-green-500" />,
    pin_order_shipped: <Package className="size-4 text-blue-500" />,
    pin_order_cancelled: <Package className="size-4 text-red-500" />,
    upgrade_approved: <Check className="size-4 text-green-500" />,
    upgrade_rejected: <Check className="size-4 text-red-500" />,
};

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}

export function NotificationBell({ notifications = [] }: Props) {
    const { unreadNotificationCount } = usePage().props;
    const [open, setOpen] = useState(false);

    const handleMarkRead = (id: string, url?: string) => {
        router.patch(`/member/notifications/${id}/read`, {}, { preserveScroll: true });
        setOpen(false);
        if (url) router.visit(url);
    };

    const handleMarkAllRead = () => {
        router.post('/member/notifications/read-all', {}, { preserveScroll: true });
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0">
                    <Bell className="size-5 opacity-80" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 rounded-xl p-0 shadow-lg" sideOffset={8}>
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold">Notifikasi</p>
                        {unreadNotificationCount > 0 && (
                            <p className="text-xs text-muted-foreground">{unreadNotificationCount} belum dibaca</p>
                        )}
                    </div>
                    {unreadNotificationCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 text-xs text-primary"
                            onClick={handleMarkAllRead}
                        >
                            <CheckCheck className="size-3.5" />
                            Baca semua
                        </Button>
                    )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <Bell className="size-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => handleMarkRead(notif.id, notif.data.url)}
                                className={cn(
                                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                                    !notif.read_at && 'bg-blue-50/60',
                                )}
                            >
                                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                                    {typeIcon[notif.data.type] ?? <Bell className="size-4 text-muted-foreground" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className={cn('text-xs leading-snug', !notif.read_at ? 'font-semibold' : 'font-medium')}>
                                        {notif.data.title}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                                        {notif.data.body}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                                        {timeAgo(notif.created_at)}
                                    </p>
                                </div>
                                {!notif.read_at && (
                                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Link
                        href="/member/notifications"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                        Lihat semua notifikasi
                        <ChevronRight className="size-3.5" />
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
