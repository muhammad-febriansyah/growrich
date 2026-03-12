import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRightLeft, Copy, Key, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Pin {
    id: number;
    pin_code: string;
    package_type: string;
    upgrade_from: string | null;
    price: number;
    status: string;
    created_at: string;
}

interface Props {
    pins: {
        data: Pin[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stok PIN', href: '/member/pins' },
];

export default function PinIndex({ pins }: Props) {
    const [transferPin, setTransferPin] = useState<Pin | null>(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [recipientInfo, setRecipientInfo] = useState<{ name: string; member_id: string } | null>(null);
    const [lookupError, setLookupError] = useState('');

    const form = useForm({ pin_id: 0, recipient_member_id: '' });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Kode PIN berhasil disalin!');
    };

    const openTransfer = (pin: Pin) => {
        setTransferPin(pin);
        setRecipientInfo(null);
        setLookupError('');
        form.reset();
        form.setData('pin_id', pin.id);
    };

    const closeTransfer = () => {
        setTransferPin(null);
        setRecipientInfo(null);
        setLookupError('');
        form.reset();
    };

    const handleLookup = async () => {
        if (!form.data.recipient_member_id.trim()) return;
        setLookupLoading(true);
        setRecipientInfo(null);
        setLookupError('');
        try {
            const res = await fetch(`/member/pins/lookup-member?member_id=${encodeURIComponent(form.data.recipient_member_id.trim())}`);
            const json = await res.json();
            if (json.found) {
                setRecipientInfo({ name: json.name, member_id: json.member_id });
            } else {
                setLookupError('ID Member tidak ditemukan.');
            }
        } catch {
            setLookupError('Gagal mencari member. Coba lagi.');
        } finally {
            setLookupLoading(false);
        }
    };

    const handleTransfer = () => {
        form.post('/member/pins/transfer', {
            onSuccess: () => {
                closeTransfer();
            },
        });
    };

    const packageStyles: Record<string, string> = {
        Silver: 'bg-slate-100 text-slate-700 border-slate-300',
        Gold: 'bg-amber-100 text-amber-700 border-amber-300',
        Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
    };

    const columns: ColumnDef<Pin>[] = [
        {
            accessorKey: 'pin_code',
            header: 'Kode PIN',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded font-mono font-bold text-sm">
                        {row.original.pin_code}
                    </code>
                    {row.original.status === 'available' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(row.original.pin_code)}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'package_type',
            header: 'Jenis PIN',
            cell: ({ row }) => {
                const { package_type, upgrade_from } = row.original;
                if (upgrade_from) {
                    return (
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${packageStyles[package_type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                            <span className="opacity-70">{upgrade_from}</span>
                            <span>→</span>
                            <span>{package_type}</span>
                        </span>
                    );
                }
                return (
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${packageStyles[package_type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {package_type}
                    </span>
                );
            },
        },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ row }) => (
                <div className="font-medium">
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.price)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const styles: Record<string, string> = {
                    available: 'bg-green-100 text-green-700 border-green-300',
                    used: 'bg-slate-100 text-slate-500 border-slate-300',
                    expired: 'bg-red-100 text-red-700 border-red-300',
                };
                const labels: Record<string, string> = {
                    available: 'Tersedia',
                    used: 'Terpakai',
                    expired: 'Kedaluwarsa',
                };
                const s = row.original.status;
                return (
                    <Badge variant="outline" className={`${styles[s] ?? ''}`}>
                        {labels[s] ?? s}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Diterima Pada',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                if (row.original.status !== 'available') return null;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => openTransfer(row.original)}
                    >
                        <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
                        Transfer
                    </Button>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stok PIN" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">Stok PIN Saya</h1>
                    <p className="text-muted-foreground">Daftar PIN registrasi dan PIN upgrade yang Anda miliki.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="shadow-premium border-none bg-brand/5">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-xs uppercase font-bold tracking-wider opacity-70 text-brand">Total PIN Tersedia</CardDescription>
                            <CardTitle className="text-3xl font-extrabold tracking-tight">
                                {pins.data.filter(p => p.status === 'available').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar PIN</CardTitle>
                            <CardDescription>PIN registrasi digunakan untuk mendaftar member baru. PIN upgrade digunakan di menu Upgrade Paket. Klik <strong>Transfer</strong> untuk mengirim PIN ke member lain.</CardDescription>
                        </div>
                        <div className="p-2 bg-brand/10 rounded-full text-brand">
                            <Key className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={pins.data}
                            emptyTitle="Belum ada PIN"
                            emptyDescription="Anda belum memiliki PIN yang ditugaskan oleh admin."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Transfer Dialog */}
            <Dialog open={transferPin !== null} onOpenChange={(open) => { if (!open) closeTransfer(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Transfer PIN</DialogTitle>
                        <DialogDescription>
                            Transfer PIN <code className="font-mono font-bold text-foreground">{transferPin?.pin_code}</code> ke member lain.
                            PIN akan berpindah dari stok Anda ke stok penerima.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">PIN</span>
                                <code className="font-mono font-bold">{transferPin?.pin_code}</code>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-muted-foreground">Jenis</span>
                                <span className="font-medium">
                                    {transferPin?.upgrade_from
                                        ? `Upgrade ${transferPin.upgrade_from} → ${transferPin.package_type}`
                                        : `Registrasi ${transferPin?.package_type}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="recipient_member_id">ID Member Penerima</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="recipient_member_id"
                                    placeholder="Contoh: S0000000001"
                                    value={form.data.recipient_member_id}
                                    onChange={(e) => {
                                        form.setData('recipient_member_id', e.target.value.toUpperCase());
                                        setRecipientInfo(null);
                                        setLookupError('');
                                    }}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleLookup}
                                    disabled={lookupLoading || !form.data.recipient_member_id.trim()}
                                    className="shrink-0"
                                >
                                    {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                            {form.errors.recipient_member_id && (
                                <p className="text-xs text-red-500">{form.errors.recipient_member_id}</p>
                            )}
                            {lookupError && (
                                <p className="text-xs text-red-500">{lookupError}</p>
                            )}
                            {recipientInfo && (
                                <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                                    <span className="font-semibold">{recipientInfo.name}</span>
                                    <span className="text-green-500">·</span>
                                    <span className="font-mono text-xs">{recipientInfo.member_id}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={closeTransfer}>Batal</Button>
                        <Button
                            onClick={handleTransfer}
                            disabled={form.processing || !recipientInfo}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Transfer PIN
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
