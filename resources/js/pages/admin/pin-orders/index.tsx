import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, Download, Key, Search, ShoppingCart, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface PinOrder {
    id: number;
    order_number: string;
    package_type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    phone: string;
    shipping_name: string;
    shipping_address: string;
    shipping_province: string;
    shipping_city: string;
    shipping_district: string;
    shipping_village: string;
    shipping_postal_code: string;
    notes: string | null;
    created_at: string;
    completed_at: string | null;
    payment_receipt: string | null;
    user: { id: number; name: string; email: string; member_id: string | null } | null;
}

interface Props {
    orders: {
        data: PinOrder[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    stats: { pending: number; completed: number; cancelled: number };
    filters: { status?: string; package?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Order PIN', href: '/admin/pin-orders' }];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') {
        return <Badge className="border-green-300 bg-green-100 text-green-700 hover:bg-green-100">Selesai</Badge>;
    }
    if (status === 'cancelled') {
        return <Badge className="border-red-300 bg-red-100 text-red-700 hover:bg-red-100">Dibatalkan</Badge>;
    }
    return <Badge className="border-yellow-300 bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Menunggu</Badge>;
}

export default function PinOrderIndex({ orders, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (key: string, value: string) => {
        const next: Record<string, string> = { ...filters };
        if (value === 'all') {
            delete next[key];
        } else {
            next[key] = value;
        }
        router.get('/admin/pin-orders', next, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter('search', search || 'all');
    };

    const handleComplete = (order: PinOrder) => {
        if (confirm(`Selesaikan order ${order.order_number}? ${order.quantity} PIN ${order.package_type} akan ditambahkan ke stok ${order.user?.name}.`)) {
            router.post(`/admin/pin-orders/${order.id}/complete`);
        }
    };

    const handleCancel = (order: PinOrder) => {
        if (confirm(`Batalkan order ${order.order_number}?`)) {
            router.post(`/admin/pin-orders/${order.id}/cancel`);
        }
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (filters.status) params.set('status', filters.status);
        if (filters.package) params.set('package', filters.package);
        const qs = params.toString();
        return '/admin/pin-orders/export' + (qs ? '?' + qs : '');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order PIN" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Order PIN</h1>
                        <p className="text-sm text-muted-foreground">Kelola pesanan PIN dari member.</p>
                    </div>
                    <a href={buildExportUrl()}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </a>
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
                                <p className="text-2xl font-bold">{stats.cancelled}</p>
                                <p className="text-xs text-muted-foreground">Dibatalkan</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama, email, atau no. order..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select defaultValue={filters.package ?? 'all'} onValueChange={(v) => applyFilter('package', v)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Semua Paket" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Paket</SelectItem>
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="Gold">Gold</SelectItem>
                            <SelectItem value="Platinum">Platinum</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue={filters.status ?? 'all'} onValueChange={(v) => applyFilter('status', v)}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
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
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. Order</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Member</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qty</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pengiriman</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {orders.data.map((order) => (
                                        <tr key={order.id} className="align-top hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-mono text-xs font-bold text-slate-700">{order.order_number}</p>
                                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{order.user?.name ?? '—'}</p>
                                                <p className="text-[11px] text-muted-foreground">{order.user?.member_id ?? order.user?.email ?? ''}</p>
                                                <p className="text-[11px] text-muted-foreground">{order.phone}</p>
                                            </td>
                                            <td className="px-4 py-3 font-semibold">{order.package_type}</td>
                                            <td className="px-4 py-3 text-center font-bold">{order.quantity}</td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                {fmt(order.total_amount)}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                <p className="font-medium text-gray-700">{order.shipping_name}</p>
                                                <p>{order.shipping_address}</p>
                                                <p>{order.shipping_district}, {order.shipping_village}</p>
                                                <p>{order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}</p>
                                                {order.notes && (
                                                    <p className="mt-1 italic">"{order.notes}"</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={order.status} />
                                                {order.payment_receipt && (
                                                    <div className="mt-1.5">
                                                        <a
                                                            href={`/storage/${order.payment_receipt}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            <Key className="h-3 w-3" />
                                                            Lihat Bukti
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {order.status === 'pending' && (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                                                            onClick={() => handleComplete(order)}
                                                        >
                                                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                            Selesaikan
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs text-red-600 border-red-300 hover:bg-red-50"
                                                            onClick={() => handleCancel(order)}
                                                        >
                                                            <XCircle className="mr-1 h-3.5 w-3.5" />
                                                            Batalkan
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-20" />
                                                <p className="text-sm font-medium">Belum ada order PIN</p>
                                                <p className="mt-1 text-xs">Order dari member akan muncul di sini.</p>
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
                        <p className="text-sm text-muted-foreground">
                            Halaman {orders.current_page} dari {orders.last_page} · {orders.total} total
                        </p>
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
