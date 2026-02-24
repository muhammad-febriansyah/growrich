import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Banknote, CheckCircle2, Clock, CreditCard, Key, MapPin, Package, Phone, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    shipping_name: string;
    phone: string;
    shipping_address: string;
    shipping_province: string;
    shipping_city: string;
    shipping_district: string;
    shipping_village: string;
    shipping_postal_code: string;
    notes: string | null;
    payment_method: string | null;
    payment_receipt: string | null;
    paid_at: string | null;
    created_at: string;
    completed_at: string | null;
}

interface Props {
    order: PinOrder;
}

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

export default function PinOrderShow({ order }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Order PIN', href: '/member/pin-orders' },
        { title: `#${order.order_number}`, href: `/member/pin-orders/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Order PIN ${order.order_number}`} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 text-foreground md:p-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                            <Link href="/member/pin-orders">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <ShoppingCart className="size-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Detail Order PIN</h1>
                                <p className="text-xs font-mono text-muted-foreground">#{order.order_number}</p>
                            </div>
                        </div>
                    </div>

                    {order.status === 'pending' && !order.payment_receipt && (
                        <Button asChild className="gap-2">
                            <Link href={`/member/pin-orders/${order.id}/payment`}>
                                Lanjutkan Pembayaran
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-premium border-none">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Informasi Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Waktu Pemesanan</p>
                                        <p className="text-sm font-semibold">{new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Paket PIN</p>
                                        <p className="text-sm font-bold text-slate-800">{order.package_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah</p>
                                        <p className="text-sm font-bold">{order.quantity} PIN</p>
                                    </div>
                                    <div className="space-y-1 sm:col-span-2 pt-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Pembayaran</p>
                                        <p className="text-2xl font-black text-primary">{fmt(order.total_amount)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Info */}
                        <Card className="shadow-premium border-none">
                            <CardHeader className="border-b bg-muted/30">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Alamat Pengiriman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                                        <User className="size-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{order.shipping_name}</p>
                                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                                    </div>
                                </div>

                                <div className="ml-14 space-y-1">
                                    <p className="text-sm leading-relaxed text-slate-700">{order.shipping_address}</p>
                                    <p className="text-sm text-slate-700">
                                        {order.shipping_village}, {order.shipping_district},<br />
                                        {order.shipping_city}, {order.shipping_province} - {order.shipping_postal_code}
                                    </p>
                                </div>

                                {order.notes && (
                                    <div className="mt-4 border-t pt-4">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Catatan</p>
                                        <p className="text-sm italic text-slate-600 bg-slate-50 p-3 rounded-lg border">"{order.notes}"</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payment Status Side */}
                    <div className="space-y-6">
                        <Card className="shadow-premium border-none overflow-hidden">
                            <CardHeader className="border-b bg-emerald-50/50">
                                <CardTitle className="text-base flex items-center gap-2 text-emerald-800">
                                    <Banknote className="h-4 w-4" /> Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" /> Metode
                                        </span>
                                        <span className="text-xs font-bold capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                            {order.payment_method === 'manual_transfer' ? 'Transfer Manual' : (order.payment_method || 'Belum dipilih')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Status Bayar
                                        </span>
                                        {order.paid_at ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Sudah Dibayar</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200">Menunggu</Badge>
                                        )}
                                    </div>

                                    {order.paid_at && (
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> Waktu Bayar
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-600">
                                                {new Date(order.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {order.payment_method === 'manual_transfer' && (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bukti Transfer</p>
                                        {order.payment_receipt ? (
                                            <div className="rounded-xl border bg-slate-50 p-2 overflow-hidden shadow-sm">
                                                <img
                                                    src={`/storage/${order.payment_receipt}`}
                                                    alt="Bukti Transfer"
                                                    className="max-h-48 w-full object-contain rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border border-dashed bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
                                                <Package className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-xs text-muted-foreground font-medium">Belum diunggah</p>
                                                <Button variant="link" size="sm" asChild className="text-primary h-auto p-0 mt-1">
                                                    <Link href={`/member/pin-orders/${order.id}/payment`}>
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
