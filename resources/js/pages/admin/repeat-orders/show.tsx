import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Banknote, CheckCircle2, Clock, CreditCard, Eye, Package, ShoppingCart, User, XCircle } from 'lucide-react';
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
    status: 'pending' | 'completed' | 'rejected';
    period_month: number;
    period_year: number;
    payment_method: string | null;
    payment_receipt: string | null;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    member_profile: {
        package_type: string;
        career_level: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string | null;
            member_id: string | null;
            referral_code: string;
        };
    } | null;
}

interface Props {
    order: RepeatOrder;
}

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function StatusBadge({ status }: { status: string }) {
    if (status === 'completed') return <Badge className="bg-green-100 text-green-700 border border-green-300 hover:bg-green-100">Selesai</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-100">Menunggu</Badge>;
    return <Badge variant="destructive">Ditolak</Badge>;
}

export default function RepeatOrderShow({ order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Transaksi RO', href: '/admin/repeat-orders' },
        { title: `#${order.order_number}`, href: `/admin/repeat-orders/${order.id}` },
    ];

    const handleApprove = () => {
        if (confirm('Setujui repeat order ini?')) {
            router.post(`/admin/repeat-orders/${order.id}/approve`);
        }
    };

    const handleReject = () => {
        if (confirm('Tolak repeat order ini?')) {
            router.post(`/admin/repeat-orders/${order.id}/reject`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Repeat Order ${order.order_number}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                            <Link href="/admin/repeat-orders">
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

                    {order.status === 'pending' && (
                        <div className="flex shrink-0 gap-2">
                            <Button
                                variant="outline"
                                className="gap-1.5 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={handleApprove}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Setujui
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-1.5 border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                                onClick={handleReject}
                            >
                                <XCircle className="h-4 w-4" />
                                Tolak
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Summary Card */}
                        <Card className="shadow-premium border-none">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Detail Pesanan
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
                                            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Pembayaran</p>
                                            <p className="text-lg font-extrabold text-brand">{fmt(order.total_amount)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/30 border-b">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Produk</th>
                                                <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Harga Satuan</th>
                                                <th className="px-6 py-3 text-center font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Jumlah</th>
                                                <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase tracking-wider text-[10px]">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {order.items.map((item) => (
                                                <tr key={item.id} className="hover:bg-muted/20">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                                {item.product?.image_url ? (
                                                                    <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{item.product?.name ?? 'Produk Tidak Diketahui'}</p>
                                                                <p className="text-xs text-muted-foreground font-mono">{item.product?.sku ?? '-'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">{fmt(item.unit_price)}</td>
                                                    <td className="px-6 py-4 text-center">{item.quantity}</td>
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
                            </CardContent>
                        </Card>

                        {/* Payment Information Card */}
                        <Card className="shadow-premium border-none overflow-hidden">
                            <CardHeader className="border-b bg-blue-50/50">
                                <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                                    <Banknote className="h-4 w-4" /> Informasi Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" /> Metode
                                            </span>
                                            <span className="text-sm font-bold capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                                {order.payment_method === 'manual' ? 'Transfer Manual' : (order.payment_method || 'Belum dipilih')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4" /> Status Bayar
                                            </span>
                                            {order.paid_at ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 italic">Sudah Dibayar</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-400 border-slate-200">Menunggu Pembayaran</Badge>
                                            )}
                                        </div>
                                        {order.paid_at && (
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-slate-400" /> Waktu Bayar
                                                </span>
                                                <span className="text-sm font-medium text-slate-600">
                                                    {new Date(order.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bukti Transfer</p>
                                        {order.payment_receipt ? (
                                            <div className="relative group rounded-xl border border-blue-100 bg-slate-50 p-2 overflow-hidden shadow-sm">
                                                <a href={`/storage/${order.payment_receipt}`} target="_blank" rel="noopener noreferrer" className="block relative">
                                                    <img
                                                        src={`/storage/${order.payment_receipt}`}
                                                        alt="Bukti Transfer"
                                                        className="max-h-48 w-full object-contain rounded-lg transition-transform group-hover:scale-[1.02]"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/5 transition-opacity">
                                                        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-blue-700 shadow-sm border border-blue-100 flex items-center gap-1">
                                                            <Eye className="h-3 w-3" /> Klik untuk perbesar
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50 text-slate-400">
                                                <Package className="h-8 w-8 mb-2 opacity-20" />
                                                <p className="text-xs font-medium">Belum ada bukti</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        <Card className="shadow-premium border-none">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" /> Informasi Member
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 flex flex-col gap-4">
                                {order.member_profile ? (
                                    <>
                                        <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 border-2 border-brand-100">
                                                <User className="size-6 text-brand" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 leading-tight">{order.member_profile.user.name}</p>
                                                <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                                    ID: {order.member_profile.user.member_id ?? order.member_profile.user.referral_code}
                                                </p>
                                            </div>
                                        </div>

                                        <dl className="divide-y text-sm">
                                            <div className="flex justify-between py-3">
                                                <dt className="text-muted-foreground">Email</dt>
                                                <dd className="font-medium text-gray-900">{order.member_profile.user.email}</dd>
                                            </div>
                                            <div className="flex justify-between py-3">
                                                <dt className="text-muted-foreground">Telepon</dt>
                                                <dd className="text-gray-900">{order.member_profile.user.phone ?? '-'}</dd>
                                            </div>
                                            <div className="flex justify-between py-3">
                                                <dt className="text-muted-foreground">Paket</dt>
                                                <dd>
                                                    <span className="rounded-md border bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                                        {order.member_profile.package_type}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-3">
                                                <dt className="text-muted-foreground">Career Level</dt>
                                                <dd className="font-bold text-pink-600">{order.member_profile.career_level}</dd>
                                            </div>
                                        </dl>

                                        <Link href={`/admin/members/${order.member_profile.user.id}`}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                Lihat Profil Member
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">Data member tidak tersedia.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
