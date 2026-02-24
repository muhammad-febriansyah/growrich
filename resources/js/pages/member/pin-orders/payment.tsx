import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Banknote, CheckCircle, Copy, Package, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
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
    status: string;
    created_at: string;
    payment_receipt: string | null;
}

interface Bank {
    id: number;
    name: string;
    account_number: string;
    account_name: string;
    image: string | null;
}

interface Props {
    order: PinOrder;
    banks: Bank[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order PIN', href: '/member/pin-orders' },
    { title: 'Instruksi Pembayaran', href: '#' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

import { useForm } from '@inertiajs/react';
import { Camera, Loader2, UploadCloud } from 'lucide-react';

export default function PinOrderPayment({ order, banks }: Props) {
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        image: null as File | null,
    });

    const copyAmount = () => {
        navigator.clipboard.writeText(String(order.total_amount));
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
    };

    const copyAccount = (accountNumber: string, id: number) => {
        navigator.clipboard.writeText(accountNumber);
        setCopiedAccount(id);
        setTimeout(() => setCopiedAccount(null), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/member/pin-orders/${order.id}/upload-receipt`, {
            onSuccess: () => {
                setPreviewUrl(null);
                reset('image');
            },
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Instruksi Pembayaran – Order PIN" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                        <Link href="/member/pin-orders">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Instruksi Pembayaran</h1>
                        <p className="text-sm text-muted-foreground font-mono">#{order.order_number}</p>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-bold mb-0.5">⏳ Menunggu Pembayaran</p>
                    <p className="text-xs text-amber-700">Transfer sesuai nominal di bawah ke rekening bank admin. Konfirmasi akan dilakukan oleh admin setelah pembayaran diterima.</p>
                </div>

                {/* Order Summary */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-muted/30 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4" />
                            Ringkasan Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-5 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Paket</p>
                            <p className="font-bold">{order.package_type}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Jumlah PIN</p>
                            <p className="font-bold">{order.quantity}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Harga Satuan</p>
                            <p className="font-bold">{fmt(order.unit_price)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total</p>
                            <p className="text-lg font-extrabold text-primary">{fmt(order.total_amount)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Info */}
                <Card className="shadow-sm border-emerald-200">
                    <CardHeader className="border-b bg-emerald-50/70 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-emerald-800">
                            <Banknote className="h-4 w-4" />
                            Rekening Tujuan Transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-emerald-100">
                        {banks.length > 0 ? (
                            banks.map((bank) => (
                                <div key={bank.id} className="p-5 flex items-start gap-4">
                                    <div className="h-10 w-16 shrink-0 rounded border bg-white p-1 flex items-center justify-center overflow-hidden">
                                        {bank.image ? (
                                            <img src={`/storage/${bank.image}`} alt={bank.name} className="h-full w-full object-contain" />
                                        ) : (
                                            <Banknote className="h-5 w-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{bank.name}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-[10px] gap-1"
                                                onClick={() => copyAccount(bank.account_number, bank.id)}
                                            >
                                                {copiedAccount === bank.id ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                                {copiedAccount === bank.id ? 'Tersalin' : 'Salin No. Rek'}
                                            </Button>
                                        </div>
                                        <p className="text-lg font-black font-mono tracking-widest leading-none">{bank.account_number}</p>
                                        <p className="text-xs font-bold text-slate-700">a.n. {bank.account_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center">
                                <p className="text-muted-foreground italic text-sm">Informasi rekening bank belum diatur oleh admin.</p>
                            </div>
                        )}

                        {/* Total Transfer */}
                        <div className="bg-primary/5 p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Nominal Transfer (Total)</p>
                                <p className="text-xl font-extrabold text-primary">{fmt(order.total_amount)}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 h-8"
                                onClick={copyAmount}
                            >
                                {copiedAmount ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedAmount ? 'Disalin!' : 'Salin'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-muted/30 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <ShoppingCart className="h-4 w-4" />
                            Langkah Selanjutnya
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground leading-relaxed">
                            <li>Transfer sejumlah <span className="font-bold text-foreground">{fmt(order.total_amount)}</span> ke rekening di atas.</li>
                            <li>Pastikan nominal transfer tepat (termasuk angka terakhir) untuk kemudahan verifikasi.</li>
                            <li>Admin akan memverifikasi pembayaran dan mengaktifkan order Anda.</li>
                            <li>PIN akan otomatis masuk ke stok Anda setelah admin konfirmasi.</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Upload Receipt */}
                <Card className="shadow-sm border-blue-200">
                    <CardHeader className="border-b bg-blue-50/70 pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                            <UploadCloud className="h-4 w-4" />
                            Upload Bukti Transfer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                        <div className="space-y-4">
                            {previewUrl ? (
                                <div className="space-y-3">
                                    <div className="relative rounded-lg border-2 border-primary/20 bg-slate-50 p-2 overflow-hidden group">
                                        <p className="absolute top-2 left-2 z-10 rounded bg-primary/80 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                            Preview Bukti Baru
                                        </p>
                                        <img src={previewUrl} alt="Preview Bukti" className="max-h-80 rounded w-full object-contain mx-auto" />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-2">
                                            <p className="text-[10px] text-white text-center font-medium">Pastikan teks pada bukti terlihat jelas</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground italic">Klik tombol "Unggah" di bawah untuk memproses.</p>
                                </div>
                            ) : order.payment_receipt ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border bg-emerald-50/30 border-emerald-100 p-2">
                                        <p className="text-[10px] text-emerald-700 font-bold mb-2 flex items-center gap-1 px-1">
                                            <CheckCircle className="h-3 w-3" /> Bukti transfer sudah terkirim
                                        </p>
                                        <img src={`/storage/${order.payment_receipt}`} alt="Bukti Transfer" className="max-h-64 rounded w-full object-contain mx-auto" />
                                    </div>
                                    <p className="text-xs text-center text-muted-foreground">Anda dapat mengunggah ulang jika bukti salah.</p>
                                </div>
                            ) : (
                                <div className="mb-4 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100/50 text-blue-600 mb-3">
                                        <Camera className="h-7 w-7" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">Belum ada bukti</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">Upload foto/screenshot struk transfer Anda untuk verifikasi.</p>
                                </div>
                            )}

                            <form onSubmit={handleUpload} className="space-y-4 pt-2">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        id="receipt"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="receipt"
                                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                                    >
                                        <UploadCloud className="h-4 w-4 text-blue-600" />
                                        {data.image ? 'Ganti File Pilihan' : (order.payment_receipt ? 'Unggah Ulang Bukti' : 'Pilih File Bukti')}
                                    </label>
                                    {errors.image && <p className="text-xs text-destructive font-medium px-1">{errors.image}</p>}
                                </div>

                                {data.image && (
                                    <Button type="submit" className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={processing}>
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses Unggahan...
                                            </>
                                        ) : (
                                            'Konfirmasi & Unggah Bukti'
                                        )}
                                    </Button>
                                )}
                            </form>
                        </div>
                    </CardContent>
                </Card>

                <Button asChild variant="outline" className="h-11">
                    <Link href="/member/pin-orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Order
                    </Link>
                </Button>
            </div>
        </AppLayout>
    );
}
