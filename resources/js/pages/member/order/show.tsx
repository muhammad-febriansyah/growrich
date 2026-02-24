import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Package, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: { name: string; sku: string; image_url: string | null } | null;
}

interface RepeatOrder {
    id: number;
    order_number: string;
    total_amount: number;
    status: 'pending' | 'completed' | 'rejected' | 'paid';
    period_month: number;
    period_year: number;
    payment_method: string | null;
    payment_receipt: string | null;
    paid_at: string | null;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: RepeatOrder;
}

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') return <Badge className="bg-green-100 text-green-700 border border-green-300 hover:bg-green-100">Selesai</Badge>;
    if (status === 'paid') return <Badge className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-100">Sudah Dibayar</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-100">Menunggu Konfirmasi</Badge>;
    return <Badge variant="destructive">Dibatalkan</Badge>;
}

export default function RepeatOrderShow({ order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Repeat Order', href: '/member/ro' },
        { title: `#${order.order_number}`, href: `/member/ro/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pesanan ${order.order_number}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                            <Link href="/member/ro">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
                                <ShoppingCart className="size-5 text-brand" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Detail Repeat Order</h1>
                                <p className="text-sm font-mono text-muted-foreground">#{order.order_number}</p>
                            </div>
                        </div>
                    </div>

                    {order.status === 'pending' && !order.payment_receipt && (
                        <Button asChild className="gap-2">
                            <Link href={`/member/ro/${order.id}/payment`}>
                                Lanjutkan Pembayaran
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Summary Card */}
                        <Card className="shadow-premium border-none">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Detail Belanja
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Status</p>
                                            <StatusBadge status={order.status} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Periode</p>
                                            <p className="text-sm font-bold text-gray-900">{MONTHS[order.period_month - 1]} {order.period_year}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Tanggal Pesan</p>
                                            <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Bayar</p>
                                            <p className="text-lg font-extrabold text-brand">{fmt(order.total_amount)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 border-b">
                                                <tr>
                                                    <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Produk</th>
                                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Harga Satuan</th>
                                                    <th className="px-6 py-3 text-center font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Jumlah</th>
                                                    <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y text-slate-700">
                                                {order.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-muted/20">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                    {item.product?.image_url ? (
                                                                        <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <Package className="h-5 w-5 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 leading-tight">{item.product?.name ?? 'Produk Tidak Diketahui'}</p>
                                                                    <p className="text-xs text-muted-foreground font-mono">{item.product?.sku ?? '-'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">{fmt(item.unit_price)}</td>
                                                        <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{fmt(item.subtotal)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-muted/30">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-700">Total Keseluruhan</td>
                                                    <td className="px-6 py-4 text-right font-extrabold text-brand text-lg">{fmt(order.total_amount)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Info Pembayaran */}
                    <div className="flex flex-col gap-6">
                        <Card className="shadow-premium border-none overflow-hidden">
                            <CardHeader className="border-b bg-brand-50/50">
                                <CardTitle className="text-base flex items-center gap-2 text-brand">
                                    <Clock className="h-4 w-4" /> Info Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <dl className="space-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-slate-50">
                                        <dt className="text-muted-foreground">Metode</dt>
                                        <dd className="font-bold capitalize">{order.payment_method === 'manual_transfer' ? 'Transfer Manual' : (order.payment_method || 'Belum dipilih')}</dd>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-slate-50">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd>
                                            {order.paid_at ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">Sudah Dibayar</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400">Menunggu</Badge>
                                            )}
                                        </dd>
                                    </div>
                                    {order.paid_at && (
                                        <div className="flex justify-between py-2 border-b border-slate-50">
                                            <dt className="text-muted-foreground">Waktu Bayar</dt>
                                            <dd className="font-medium text-slate-700">{new Date(order.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                                        </div>
                                    )}
                                </dl>

                                {order.payment_method === 'manual_transfer' && (
                                    <div className="mt-6 flex flex-col gap-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bukti Transfer</p>
                                        {order.payment_receipt ? (
                                            <div className="rounded-xl border bg-slate-50 p-2">
                                                <img
                                                    src={`/storage/${order.payment_receipt}`}
                                                    alt="Bukti Transfer"
                                                    className="max-h-60 w-full object-contain rounded-lg shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
                                                <Package className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-xs text-muted-foreground font-medium">Belum diunggah</p>
                                                <Button variant="link" size="sm" asChild className="text-brand h-auto p-0 mt-1">
                                                    <Link href={`/member/ro/${order.id}/payment`}>
                                                        Unggah Sekarang
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
