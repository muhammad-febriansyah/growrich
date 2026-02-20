import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownToLine, CreditCard, History, Info, Send, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Withdrawal {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    created_at: string;
}

interface Props {
    wallet: {
        balance: number;
    };
    withdrawals: {
        data: Withdrawal[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Wallet & Withdraw', href: '/member/wallet' },
];

// Format number to Rupiah display string (e.g. 50000 → "50.000")
function formatRupiah(value: number): string {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
}

// Parse display string back to number (e.g. "50.000" → 50000)
function parseRupiah(display: string): number {
    const cleaned = display.replace(/\./g, '').replace(/,/g, '').replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
}

export default function WalletIndex({ wallet, withdrawals }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: 0,
        bank_name: '',
        account_number: '',
        account_name: '',
    });

    // Display value for the amount input (formatted string)
    const [amountDisplay, setAmountDisplay] = useState('');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        const numeric = raw ? parseInt(raw, 10) : 0;
        setAmountDisplay(numeric ? formatRupiah(numeric) : '');
        setData('amount', numeric);
    };

    const columns: ColumnDef<Withdrawal>[] = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => <div className="text-xs font-medium">{new Date(row.original.created_at).toLocaleDateString()}</div>,
        },
        {
            accessorKey: 'bank_name',
            header: 'Bank',
            cell: ({ row }) => <div className="text-xs font-mono">{row.original.bank_name}</div>,
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => (
                <div className="font-bold text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.amount)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === 'approved') return <Badge variant="default">Berhasil</Badge>;
                if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100">Diproses</Badge>;
                return <Badge variant="destructive">Ditolak</Badge>;
            },
        },
    ];

    const submitWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/withdraw', {
            onSuccess: () => {
                reset();
                setAmountDisplay('');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet & Penarikan Dana" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">Dompet & Penarikan</h1>
                    <p className="text-muted-foreground">Kelola saldo bonus dan tarik dana ke rekening bank Anda.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Balance Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a5c0e] via-[#237A13] to-[#2d9e1a] p-6 text-white shadow-xl min-h-[200px] flex flex-col justify-between">
                        {/* Decorative circles */}
                        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
                        <div className="pointer-events-none absolute -bottom-14 -right-6 h-56 w-56 rounded-full bg-white/5" />
                        <div className="pointer-events-none absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-white/5" />

                        {/* Top row */}
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-white/70" />
                                <span className="text-sm font-medium text-white/70 tracking-wide">Saldo Utama</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="h-2 w-2 rounded-full bg-white/30" />
                                <div className="h-2 w-2 rounded-full bg-white/30" />
                                <div className="h-2 w-2 rounded-full bg-white/60" />
                            </div>
                        </div>

                        {/* Balance */}
                        <div className="relative mt-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Saldo Tersedia</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">
                                Rp {new Intl.NumberFormat('id-ID').format(wallet.balance)}
                            </h3>
                        </div>

                        {/* Bottom row */}
                        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 text-white/60 text-xs">
                                <ArrowDownToLine className="h-3.5 w-3.5" />
                                <span>Siap ditarik ke rekening bank</span>
                            </div>
                            <CreditCard className="h-6 w-6 text-white/30" />
                        </div>
                    </div>

                    {/* WD Form Card */}
                    <Card className="shadow-premium border-none">
                        <CardHeader>
                            <CardTitle>Form Penarikan Dana</CardTitle>
                            <CardDescription>Minimal penarikan adalah Rp 50.000</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitWithdraw} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Jumlah Penarikan</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">
                                            Rp
                                        </span>
                                        <Input
                                            id="amount"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="50.000"
                                            value={amountDisplay}
                                            onChange={handleAmountChange}
                                            className="font-bold text-lg h-12 pl-10"
                                        />
                                    </div>
                                    {data.amount > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Nominal: <span className="font-semibold text-foreground">Rp {new Intl.NumberFormat('id-ID').format(data.amount)}</span>
                                        </p>
                                    )}
                                    {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bank_name">Nama Bank</Label>
                                        <Input
                                            id="bank_name"
                                            placeholder="BCA/Mandiri/dll"
                                            value={data.bank_name}
                                            onChange={(e) => setData('bank_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="account_number">No. Rekening</Label>
                                        <Input
                                            id="account_number"
                                            placeholder="12345678"
                                            value={data.account_number}
                                            onChange={(e) => setData('account_number', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_name">Atas Nama</Label>
                                    <Input
                                        id="account_name"
                                        placeholder="Nama sesuai buku tabungan"
                                        value={data.account_name}
                                        onChange={(e) => setData('account_name', e.target.value)}
                                    />
                                </div>
                                <Button type="submit" className="w-full h-11 font-semibold" disabled={processing || data.amount < 50000}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Tarik Dana Sekarang
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* History */}
                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">Riwayat Penarikan</CardTitle>
                            <CardDescription>Status permintaan dana ke rekening.</CardDescription>
                        </div>
                        <div className="p-2 bg-muted rounded-full">
                            <History className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={withdrawals.data}
                            emptyTitle="Belum ada riwayat"
                            emptyDescription="Anda belum pernah melakukan penarikan dana."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
