import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Package, Search, ShoppingCart, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: { name: string; sku: string } | null;
}

interface RepeatOrder {
    id: number;
    order_number: string;
    total_amount: number;
    status: 'pending' | 'completed' | 'rejected';
    period_month: number;
    period_year: number;
    created_at: string;
    items: OrderItem[];
    member_profile: {
        user: { name: string; email: string };
    } | null;
}

interface Props {
    orders: {
        data: RepeatOrder[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status?: string; search?: string };
    stats: { pending: number; completed: number; rejected: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen RO', href: '/admin/repeat-orders' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') return <Badge className="bg-green-100 text-green-700 border border-green-300 hover:bg-green-100">Selesai</Badge>;
    if (status === 'pending')   return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-100">Menunggu</Badge>;
    return <Badge variant="destructive">Ditolak</Badge>;
}

export default function RepeatOrderIndex({ orders, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        const next: Record<string, string> = { ...filters };
        if (value === 'all') { delete next[key]; } else { next[key] = value; }
        router.get('/admin/repeat-orders', next, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search || 'all');
    };

    const handleApprove = (id: number) => {
        if (confirm('Setujui repeat order ini?')) {
            router.post(`/admin/repeat-orders/${id}/approve`);
        }
    };

    const handleReject = (id: number) => {
        if (confirm('Tolak repeat order ini?')) {
            router.post(`/admin/repeat-orders/${id}/reject`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Repeat Order" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Manajemen Repeat Order</h1>
                    <p className="text-sm text-muted-foreground">Review dan konfirmasi repeat order dari member.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">Menunggu</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Selesai</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                                <p className="text-xs text-muted-foreground">Ditolak</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama atau email member..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select defaultValue={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v)}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. Order</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produk</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Periode</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/30 align-top">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{order.member_profile?.user.name ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground">{order.member_profile?.user.email ?? ''}</p>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-700 font-bold">
                                                {order.order_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-0.5">
                                                    {order.items.map((item) => (
                                                        <span key={item.id} className="text-xs text-muted-foreground">
                                                            {item.product?.name ?? '—'} &times; {item.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {MONTHS[order.period_month - 1]} {order.period_year}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                                Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {order.status === 'pending' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                                                            onClick={() => handleApprove(order.id)}
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={() => handleReject(order.id)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" />
                                                            Tolak
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-sm font-medium">Belum ada repeat order</p>
                                                <p className="text-xs mt-1">Repeat order dari member akan muncul di sini.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {orders.last_page > 1 && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            Halaman {orders.current_page} dari {orders.last_page} · {orders.total} total
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={orders.current_page === 1}
                                onClick={() => {
                                    const prev = orders.links[orders.current_page - 1];
                                    if (prev?.url) router.get(prev.url);
                                }}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={orders.current_page === orders.last_page}
                                onClick={() => {
                                    const next = orders.links[orders.current_page + 1];
                                    if (next?.url) router.get(next.url);
                                }}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
