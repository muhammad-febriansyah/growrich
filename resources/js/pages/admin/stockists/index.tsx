import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRightLeft, Key, Package, Search, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Stockist {
    id: number;
    name: string;
    email: string;
    member_id: string | null;
    package_type: string | null;
    stockist_level: string | null;
    stockist_level_label: string | null;
    stockist_parent_id: number | null;
    stockist_parent_name: string | null;
    stockist_parent_member_id: string | null;
    children_count: number;
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
        total_center: number;
        total_point: number;
        total_sub: number;
        total_pin_stok: number;
        total_transferred_all_time: number;
    };
    filters: { level?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Stokis', href: '/admin/stockists' }];

const packageStyles: Record<string, string> = {
    Silver: 'bg-slate-100 text-slate-700 border-slate-300',
    Gold: 'bg-amber-100 text-amber-700 border-amber-300',
    Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
};

const levelBadge: Record<string, string> = {
    center: 'bg-violet-100 text-violet-700 border-violet-300',
    point: 'bg-blue-100 text-blue-700 border-blue-300',
    sub: 'bg-orange-100 text-orange-700 border-orange-300',
};

const levelLabel: Record<string, string> = {
    center: 'Center',
    point: 'Point',
    sub: 'Sub',
};

export default function StockistIndex({ stockists, transfer_logs, stats, filters }: Props) {
    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        level: filters.level ?? '',
    });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/stockists', { preserveState: true });
    };

    const pinLabel = (log: TransferLog) => {
        if (!log.pin) return '—';
        return log.pin.upgrade_from
            ? `${log.pin.upgrade_from} → ${log.pin.package_type}`
            : log.pin.package_type;
    };

    // Group stockists by level for hierarchy view
    const centers = stockists.filter((s) => s.stockist_level === 'center');
    const points = stockists.filter((s) => s.stockist_level === 'point');
    const subs = stockists.filter((s) => s.stockist_level === 'sub');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Stokis" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Dashboard Stokis</h1>
                        <p className="text-sm text-muted-foreground">Monitor hierarki dan performa seluruh stokis.</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/members">Kelola Member</Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                        { label: 'Total Stokis', value: stats.total_stockists, color: 'bg-slate-100', icon: Users },
                        { label: 'Center', value: stats.total_center, color: 'bg-violet-100', icon: ShieldCheck },
                        { label: 'Point', value: stats.total_point, color: 'bg-blue-100', icon: ShieldCheck },
                        { label: 'Sub', value: stats.total_sub, color: 'bg-orange-100', icon: ShieldCheck },
                        { label: 'Stok PIN', value: stats.total_pin_stok, color: 'bg-green-100', icon: Key },
                        { label: 'Total Transfer', value: stats.total_transferred_all_time, color: 'bg-blue-100', icon: ArrowRightLeft },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="flex items-center gap-2 p-4">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${s.color}`}>
                                    <s.icon className="h-4 w-4 opacity-60" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{s.value}</p>
                                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Hierarchy Cards */}
                {!filters.level && !filters.search && (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        {[
                            { level: 'center', title: 'Stockist Center', items: centers, border: 'border-violet-200 bg-violet-50/30' },
                            { level: 'point', title: 'Stockist Point', items: points, border: 'border-blue-200 bg-blue-50/30' },
                            { level: 'sub', title: 'Sub Stockist', items: subs, border: 'border-orange-200 bg-orange-50/30' },
                        ].map((group) => (
                            <Card key={group.level} className={`border ${group.border}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between text-sm">
                                        <span>{group.title}</span>
                                        <span className="text-lg font-bold">{group.items.length}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {group.items.length === 0 ? (
                                        <p className="px-4 pb-4 text-xs text-muted-foreground">Belum ada stokis di level ini.</p>
                                    ) : (
                                        <ul className="divide-y">
                                            {group.items.slice(0, 5).map((s) => (
                                                <li key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
                                                    <div>
                                                        <p className="font-medium">{s.name}</p>
                                                        <p className="text-[11px] font-mono text-muted-foreground">{s.member_id}</p>
                                                        {s.stockist_parent_name && (
                                                            <p className="text-[11px] text-muted-foreground">
                                                                ↳ {s.stockist_parent_name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${s.pin_stok === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {s.pin_stok} PIN
                                                        </p>
                                                        <Link href={`/admin/members/${s.id}`} className="text-[11px] text-blue-600 hover:underline">
                                                            Detail →
                                                        </Link>
                                                    </div>
                                                </li>
                                            ))}
                                            {group.items.length > 5 && (
                                                <li className="px-4 py-2 text-center text-xs text-muted-foreground">
                                                    +{group.items.length - 5} lainnya
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Filter & Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            Semua Stokis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={search} className="flex flex-wrap gap-2">
                            <Input
                                placeholder="Cari nama / ID..."
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                className="max-w-xs"
                            />
                            <select
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                            >
                                <option value="">Semua Level</option>
                                <option value="center">Stockist Center</option>
                                <option value="point">Stockist Point</option>
                                <option value="sub">Sub Stockist</option>
                            </select>
                            <Button type="submit" variant="outline" size="sm">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>

                        {stockists.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <ShieldCheck className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                <p className="text-sm font-medium">Belum ada stokis</p>
                                <p className="mt-1 text-xs">Ubah level stokis member melalui halaman detail member.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Stokis</th>
                                            <th className="px-4 py-3 text-left font-medium">Level</th>
                                            <th className="px-4 py-3 text-left font-medium">Parent / Atasan</th>
                                            <th className="px-4 py-3 text-left font-medium">Paket</th>
                                            <th className="px-4 py-3 text-center font-medium">Stok PIN</th>
                                            <th className="px-4 py-3 text-center font-medium">Transfer</th>
                                            <th className="px-4 py-3 text-center font-medium">Order</th>
                                            <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {stockists.map((s) => (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{s.name}</p>
                                                    <p className="text-[11px] font-mono text-muted-foreground">{s.member_id ?? '—'}</p>
                                                    {s.children_count > 0 && (
                                                        <p className="text-[11px] text-muted-foreground">{s.children_count} anak stokis</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {s.stockist_level ? (
                                                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${levelBadge[s.stockist_level]}`}>
                                                            {s.stockist_level_label ?? levelLabel[s.stockist_level]}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {s.stockist_parent_name ? (
                                                        <div>
                                                            <p className="font-medium text-foreground">{s.stockist_parent_name}</p>
                                                            <p className="font-mono">{s.stockist_parent_member_id}</p>
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {s.package_type ? (
                                                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${packageStyles[s.package_type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                                                            {s.package_type}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold ${s.pin_stok === 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {s.pin_stok}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-semibold text-blue-600">
                                                    {s.total_transferred}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {s.total_ordered} PIN
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
                            Semua perpindahan PIN antar member. Total {transfer_logs.total} transfer.
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
                                            <th className="px-4 py-3 text-left font-medium">PIN</th>
                                            <th className="px-4 py-3 text-left font-medium">Dari</th>
                                            <th className="px-4 py-3 text-left font-medium">Ke</th>
                                            <th className="px-4 py-3 text-left font-medium">Oleh</th>
                                            <th className="px-4 py-3 text-left font-medium">Waktu</th>
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
                                                        <span className="text-xs italic text-muted-foreground">Admin</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{log.to_user?.name ?? '—'}</p>
                                                    <p className="text-[11px] font-mono text-muted-foreground">{log.to_user?.member_id ?? '—'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.transferred_by ? (
                                                        <div>
                                                            <p className="font-medium">{log.transferred_by.name}</p>
                                                            <Badge variant="outline" className="mt-0.5 text-[10px]">
                                                                {log.actor_type === 'admin' ? 'Admin' : 'Member'}
                                                            </Badge>
                                                        </div>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit',
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination transfer */}
                {transfer_logs.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {transfer_logs.current_page > 1 && (
                            <Button variant="outline" size="sm" onClick={() => router.get('/admin/stockists', { page: transfer_logs.current_page - 1 })}>
                                Sebelumnya
                            </Button>
                        )}
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            {transfer_logs.current_page} / {transfer_logs.last_page}
                        </span>
                        {transfer_logs.current_page < transfer_logs.last_page && (
                            <Button variant="outline" size="sm" onClick={() => router.get('/admin/stockists', { page: transfer_logs.current_page + 1 })}>
                                Selanjutnya
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
