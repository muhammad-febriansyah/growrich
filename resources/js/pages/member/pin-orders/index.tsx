import { Head, Link, useForm } from '@inertiajs/react';
import { Banknote, CreditCard, Eye, Key, MapPin, Package, Phone, ShoppingCart } from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface PackageOption {
    value: string;
    label: string;
    price: number;
    upgrade_from: string | null;
}

interface PinOrder {
    id: number;
    order_number: string;
    package_type: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    shipping_name: string;
    shipping_city: string;
    shipping_province: string;
    payment_method: string | null;
    payment_receipt: string | null;
    created_at: string;
    completed_at: string | null;
}

interface Props {
    orders: {
        data: PinOrder[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    packages: PackageOption[];
    prefill: { phone: string; shipping_name: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Order PIN', href: '/member/pin-orders' }];

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

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function PinOrderIndex({ orders, packages, prefill }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        package_type: '',
        quantity: '1',
        payment_method: 'manual_transfer',
        phone: prefill.phone,
        shipping_name: prefill.shipping_name,
        shipping_address: '',
        shipping_province: '',
        shipping_city: '',
        shipping_district: '',
        shipping_village: '',
        shipping_postal_code: '',
        notes: '',
    });

    const selectedPkg = packages.find((p) => p.value === data.package_type);
    const totalAmount = selectedPkg ? selectedPkg.price * Number(data.quantity || 0) : 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/pin-orders', { onSuccess: () => reset('package_type', 'quantity', 'notes') });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order PIN" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 text-foreground md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Order PIN</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pesan Registration PIN untuk mendaftarkan member baru di jaringan Anda.
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* ── Jenis & Jumlah PIN ────────────────────────────── */}
                    <Card className="border-primary/20 bg-primary/5 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Package className="h-4 w-4 text-primary" />
                                Pilih Paket PIN
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Jenis Paket PIN <span className="text-destructive">*</span></Label>
                                <Select value={data.package_type} onValueChange={(v) => setData('package_type', v)}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Pilih paket..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.filter((p) => p.upgrade_from === null).length > 0 && (
                                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                PIN Registrasi
                                            </div>
                                        )}
                                        {packages.filter((p) => p.upgrade_from === null).map((pkg) => (
                                            <SelectItem key={pkg.value} value={pkg.value}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{pkg.label}</span>
                                                    <span className="text-xs text-muted-foreground">{fmt(pkg.price)}/PIN</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                        {packages.filter((p) => p.upgrade_from !== null).length > 0 && (
                                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t mt-1 pt-2">
                                                PIN Upgrade
                                            </div>
                                        )}
                                        {packages.filter((p) => p.upgrade_from !== null).map((pkg) => (
                                            <SelectItem key={pkg.value} value={pkg.value}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{pkg.label}</span>
                                                    <span className="text-xs text-muted-foreground">{fmt(pkg.price)}/PIN</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.package_type} />
                            </div>

                            <div className="space-y-2">
                                <Label>Jumlah PIN <span className="text-destructive">*</span></Label>
                                <Select value={data.quantity} onValueChange={(v) => setData('quantity', v)}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Pilih jumlah..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                                            <SelectItem key={n} value={String(n)}>
                                                {n} PIN
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.quantity} />
                            </div>

                            {totalAmount > 0 && (
                                <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-white px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                                        <span className="text-lg font-bold text-primary">{fmt(totalAmount)}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {data.quantity} PIN × {selectedPkg ? fmt(selectedPkg.price) : '-'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* ── Kontak ────────────────────────────────────────── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4" />
                                Kontak
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="shipping_name">Nama Penerima <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_name"
                                    placeholder="Nama lengkap penerima"
                                    value={data.shipping_name}
                                    onChange={(e) => setData('shipping_name', e.target.value)}
                                />
                                <FieldError message={errors.shipping_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">No. Telp / HP <span className="text-destructive">*</span></Label>
                                <Input
                                    id="phone"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                />
                                <FieldError message={errors.phone} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Alamat Pengiriman ─────────────────────────────── */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4" />
                                Alamat Pengiriman
                            </CardTitle>
                            <CardDescription>Alamat fisik pengiriman dokumen PIN.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="shipping_address">Alamat Lengkap <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="shipping_address"
                                    placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                                    value={data.shipping_address}
                                    onChange={(e) => setData('shipping_address', e.target.value)}
                                    rows={2}
                                />
                                <FieldError message={errors.shipping_address} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_province">Provinsi <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_province"
                                    placeholder="DKI Jakarta"
                                    value={data.shipping_province}
                                    onChange={(e) => setData('shipping_province', e.target.value)}
                                />
                                <FieldError message={errors.shipping_province} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_city">Kota / Kabupaten <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_city"
                                    placeholder="Jakarta Selatan"
                                    value={data.shipping_city}
                                    onChange={(e) => setData('shipping_city', e.target.value)}
                                />
                                <FieldError message={errors.shipping_city} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_district">Kecamatan <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_district"
                                    placeholder="Kebayoran Baru"
                                    value={data.shipping_district}
                                    onChange={(e) => setData('shipping_district', e.target.value)}
                                />
                                <FieldError message={errors.shipping_district} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_village">Kelurahan / Desa <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_village"
                                    placeholder="Senayan"
                                    value={data.shipping_village}
                                    onChange={(e) => setData('shipping_village', e.target.value)}
                                />
                                <FieldError message={errors.shipping_village} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="shipping_postal_code">Kode Pos <span className="text-destructive">*</span></Label>
                                <Input
                                    id="shipping_postal_code"
                                    placeholder="12190"
                                    value={data.shipping_postal_code}
                                    onChange={(e) => setData('shipping_postal_code', e.target.value)}
                                />
                                <FieldError message={errors.shipping_postal_code} />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="notes">Catatan (opsional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Catatan tambahan untuk admin..."
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Metode Pembayaran ─────────────────────────────── */}
                    <Card className="border-emerald-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                                Metode Pembayaran
                            </CardTitle>
                            <CardDescription>Pilih cara pembayaran untuk order ini.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setData('payment_method', 'manual_transfer')}
                                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${data.payment_method === 'manual_transfer'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                                    }`}
                            >
                                <Banknote className="h-6 w-6 shrink-0 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-bold">Transfer Manual</p>
                                    <p className="text-xs text-muted-foreground">Transfer ke rekening bank admin, admin konfirmasi manual.</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('payment_method', 'duitku')}
                                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${data.payment_method === 'duitku'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-primary/30 hover:bg-muted/30'
                                    }`}
                            >
                                <CreditCard className="h-6 w-6 shrink-0 text-blue-500" />
                                <div>
                                    <p className="text-sm font-bold">Duitku</p>
                                    <p className="text-xs text-muted-foreground">Bayar otomatis via payment gateway (VA, QRIS, e-Wallet, dll).</p>
                                </div>
                            </button>
                            {errors.payment_method && <p className="sm:col-span-2 text-xs text-destructive">{errors.payment_method}</p>}
                        </CardContent>
                    </Card>

                    <Button type="submit" className="h-12 w-full text-base" disabled={processing}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {data.payment_method === 'duitku' ? 'Bayar via Duitku >>' : 'Buat Order & Lihat Instruksi Transfer'}
                    </Button>
                </form>

                {/* ── Riwayat Order ─────────────────────────────────────── */}
                <div>
                    <h2 className="mb-3 text-lg font-bold">Riwayat Order PIN</h2>

                    {orders.data.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Key className="mb-3 h-8 w-8 opacity-30" />
                                <p className="font-medium">Belum ada order PIN.</p>
                                <p className="mt-1 text-sm">Order yang Anda buat akan muncul di sini.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="border-b bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">No. Order</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Paket</th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Jumlah</th>
                                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tanggal</th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {orders.data.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/30">
                                                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                                                        {order.order_number}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">{order.package_type}</td>
                                                    <td className="px-4 py-3 text-center">{order.quantity}</td>
                                                    <td className="px-4 py-3 text-right font-bold">{fmt(order.total_amount)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <StatusBadge status={order.status} />
                                                            {order.payment_method === 'manual_transfer' && order.payment_receipt && (
                                                                <div className="mt-1">
                                                                    <a
                                                                        href={`/storage/${order.payment_receipt}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                                    >
                                                                        <Package className="h-3 w-3" />
                                                                        Lihat Bukti
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button variant="outline" size="sm" asChild className="h-8">
                                                            <Link href={`/member/pin-orders/${order.id}`}>
                                                                <Eye className="h-3.5 w-3.5 mr-1" />
                                                                Detail
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {orders.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-4 py-3">
                                        <p className="text-sm text-muted-foreground">
                                            Halaman {orders.current_page} dari {orders.last_page} · {orders.total} order
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
