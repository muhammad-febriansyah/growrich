import { Head, Link } from '@inertiajs/react';
import { ArrowRightLeft, Key, Package, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Stockist {
    id: number;
    name: string;
    email: string;
    member_id: string | null;
    package_type: string | null;
    pin_stok: number;
    total_transferred: number;
    total_ordered: number;
}

interface TransferLog {
    id: number;
    actor_type: 'member' | 'admin';
    created_at: string;
    pin: { id: number; pin_code: string; package_type: string; upgrade_from: string | null } | null;
    from_user: { id: number; name: string; member_id: string | null } | null;
    to_user: { id: number; name: string; member_id: string | null } | null;
    transferred_by: { id: number; name: string; member_id: string | null } | null;
}

interface Props {
    stockists: Stockist[];
    transfer_logs: {
        data: TransferLog[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: {
        total_stockists: number;
        total_pin_stok: number;
        total_transferred_all_time: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Stokis', href: '/admin/stockists' }];

const packageStyles: Record<string, string> = {
    Silver: 'bg-slate-100 text-slate-700 border-slate-300',
    Gold: 'bg-amber-100 text-amber-700 border-amber-300',
    Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
};

export default function StockistIndex({ stockists, transfer_logs, stats }: Props) {
    const pinLabel = (log: TransferLog) => {
        if (!log.pin) return '—';
        return log.pin.upgrade_from
            ? `${log.pin.upgrade_from} → ${log.pin.package_type}`
            : log.pin.package_type;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Stokis" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Dashboard Stokis</h1>
                        <p className="text-sm text-muted-foreground">Monitor performa dan riwayat transfer PIN seluruh stokis.</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/members?stockist=1">Kelola Stokis</Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                <Users className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total_stockists}</p>
                                <p className="text-xs text-muted-foreground">Total Stokis</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <Key className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total_pin_stok}</p>
                                <p className="text-xs text-muted-foreground">PIN di Stok Stokis</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.total_transferred_all_time}</p>
                                <p className="text-xs text-muted-foreground">Total Transfer PIN</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabel Stokis */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            Performa Stokis
                        </CardTitle>
                        <CardDescription>Diurutkan berdasarkan jumlah transfer PIN terbanyak.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {stockists.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <ShieldCheck className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                <p className="text-sm font-medium">Belum ada stokis</p>
                                <p className="mt-1 text-xs">Tunjuk member sebagai stokis melalui halaman Manajemen Member.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stokis</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
                                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stok PIN</th>
                                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">PIN Ditransfer</th>
                                            <th className="px-4 py-3 text-center font-medium text-muted-foreground">Total Order</th>
                                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {stockists.map((s, idx) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {idx === 0 && (
                                                            <span className="text-amber-400 text-sm">🥇</span>
                                                        )}
                                                        {idx === 1 && (
                                                            <span className="text-slate-400 text-sm">🥈</span>
                                                        )}
                                                        {idx === 2 && (
                                                            <span className="text-amber-700 text-sm">🥉</span>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{s.name}</p>
                                                            <p className="text-[11px] font-mono text-muted-foreground">{s.member_id ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {s.package_type ? (
                                                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${packageStyles[s.package_type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                                                            {s.package_type}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold text-base ${s.pin_stok === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {s.pin_stok}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-semibold text-blue-600">{s.total_transferred}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-semibold">{s.total_ordered}</span>
                                                    <span className="ml-1 text-[11px] text-muted-foreground">PIN</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                                                        <Link href={`/admin/members/${s.id}`}>Detail</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Riwayat Transfer PIN */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-4 w-4 text-blue-500" />
                            Riwayat Transfer PIN
                        </CardTitle>
                        <CardDescription>
                            Semua perpindahan PIN antar member — oleh member maupun admin.
                            Total {transfer_logs.total} transfer.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {transfer_logs.data.length === 0 ? (
                            <div className="px-4 py-12 text-center text-muted-foreground">
                                <ArrowRightLeft className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                <p className="text-sm font-medium">Belum ada riwayat transfer</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">PIN</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dari</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ke</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Oleh</th>
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transfer_logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-bold">
                                                        {log.pin?.pin_code ?? '—'}
                                                    </code>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">{pinLabel(log)}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.from_user ? (
                                                        <div>
                                                            <p className="font-medium">{log.from_user.name}</p>
                                                            <p className="text-[11px] font-mono text-muted-foreground">{log.from_user.member_id ?? '—'}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Admin (baru)</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{log.to_user?.name ?? '—'}</p>
                                                        <p className="text-[11px] font-mono text-muted-foreground">{log.to_user?.member_id ?? '—'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant="outline"
                                                        className={log.actor_type === 'admin'
                                                            ? 'border-purple-300 bg-purple-50 text-purple-700 text-[10px]'
                                                            : 'border-blue-300 bg-blue-50 text-blue-700 text-[10px]'}
                                                    >
                                                        {log.actor_type === 'admin' ? 'Admin' : 'Member'}
                                                    </Badge>
                                                    <p className="mt-0.5 text-[11px] text-muted-foreground">{log.transferred_by?.name ?? '—'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                    <p className="text-[11px]">
                                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {transfer_logs.last_page > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Halaman {transfer_logs.current_page} dari {transfer_logs.last_page}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
