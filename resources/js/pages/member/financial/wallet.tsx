import { router, useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownToLine, Building2, History, Info, Plus, Send, Star, Trash2, Wallet } from 'lucide-react';
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

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    is_primary: boolean;
}

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
    wallet: { balance: number };
    withdrawals: {
        data: Withdrawal[];
        current_page: number;
        last_page: number;
        total: number;
    };
    bankAccounts: BankAccount[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Wallet & Withdraw', href: '/member/wallet' }];

function formatRupiah(value: number): string {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
}

const MIN_HOLD = 1_000_000;
const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function WalletIndex({ wallet, withdrawals, bankAccounts }: Props) {
    const withdrawable = Math.max(0, wallet.balance - MIN_HOLD);
    const [amountDisplay, setAmountDisplay] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
        bankAccounts.find((a) => a.is_primary)?.id ?? bankAccounts[0]?.id ?? null,
    );
    const [useManual, setUseManual] = useState(bankAccounts.length === 0);
    const [showAddForm, setShowAddForm] = useState(false);

    const wdForm = useForm({
        amount: 0,
        bank_account_id: null as number | null,
        bank_name: '',
        account_number: '',
        account_name: '',
    });

    const addBankForm = useForm({
        bank_name: '',
        account_number: '',
        account_name: '',
        is_primary: false,
    });

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        const numeric = raw ? parseInt(raw, 10) : 0;
        setAmountDisplay(numeric ? formatRupiah(numeric) : '');
        wdForm.setData('amount', numeric);
    };

    const submitWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = useManual
            ? {
                  amount: wdForm.data.amount,
                  bank_account_id: null,
                  bank_name: wdForm.data.bank_name,
                  account_number: wdForm.data.account_number,
                  account_name: wdForm.data.account_name,
              }
            : {
                  amount: wdForm.data.amount,
                  bank_account_id: selectedAccountId,
                  bank_name: null,
                  account_number: null,
                  account_name: null,
              };
        wdForm.transform(() => payload);
        wdForm.post('/member/withdraw', {
            onSuccess: () => {
                wdForm.reset();
                setAmountDisplay('');
            },
        });
    };

    const submitAddBank = (e: React.FormEvent) => {
        e.preventDefault();
        addBankForm.post('/member/bank-accounts', {
            onSuccess: () => {
                addBankForm.reset();
                setShowAddForm(false);
            },
        });
    };

    const columns: ColumnDef<Withdrawal>[] = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => (
                <div className="text-xs font-medium">{new Date(row.original.created_at).toLocaleDateString()}</div>
            ),
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
                <div className="font-bold text-slate-900">Rp {new Intl.NumberFormat('id-ID').format(row.original.amount)}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === 'approved') return <Badge variant="default">Berhasil</Badge>;
                if (status === 'pending')
                    return (
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100">
                            Diproses
                        </Badge>
                    );
                return <Badge variant="destructive">Ditolak</Badge>;
            },
        },
    ];

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
                        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
                        <div className="pointer-events-none absolute -bottom-14 -right-6 h-56 w-56 rounded-full bg-white/5" />
                        <div className="pointer-events-none absolute top-1/2 -left-8 h-32 w-32 rounded-full bg-white/5" />

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

                        <div className="relative mt-4">
                            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Saldo</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">{fmt(wallet.balance)}</h3>
                        </div>

                        <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                            <div>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Bisa Ditarik</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ArrowDownToLine className="h-3.5 w-3.5 text-white/70" />
                                    <span className="text-base font-bold text-white">{fmt(withdrawable)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Min. Hold (Auto RO)</p>
                                <p className="mt-0.5 text-sm font-semibold text-white/70">{fmt(MIN_HOLD)}</p>
                            </div>
                        </div>
                    </div>

                    {/* WD Form Card */}
                    <Card className="shadow-premium border-none">
                        <CardHeader>
                            <CardTitle>Form Penarikan Dana</CardTitle>
                            <CardDescription>
                                Saldo minimum Rp 1.000.000 dipertahankan untuk Auto RO bulanan. Minimal tarik Rp 50.000.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {withdrawable === 0 ? (
                                <Alert className="border-amber-200 bg-amber-50">
                                    <Info className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-800">Penarikan Tidak Tersedia</AlertTitle>
                                    <AlertDescription className="text-amber-700">
                                        Saldo e-wallet belum melebihi Rp 1.000.000. Terus kumpulkan bonus agar bisa menarik dana.
                                    </AlertDescription>
                                </Alert>
                            ) : (
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
                                        <p className="text-xs text-muted-foreground">
                                            Maks dapat ditarik:{' '}
                                            <span className="font-semibold text-foreground">{fmt(withdrawable)}</span>
                                        </p>
                                        {wdForm.data.amount > 0 && wdForm.data.amount > withdrawable && (
                                            <p className="text-xs text-destructive">
                                                Melebihi batas penarikan. Maks: {fmt(withdrawable)}
                                            </p>
                                        )}
                                        {wdForm.errors.amount && (
                                            <p className="text-xs text-destructive">{wdForm.errors.amount}</p>
                                        )}
                                    </div>

                                    {/* Bank account selection */}
                                    {bankAccounts.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Rekening Tujuan</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseManual(!useManual)}
                                                    className="text-xs text-primary underline"
                                                >
                                                    {useManual ? 'Pilih rekening tersimpan' : 'Input manual'}
                                                </button>
                                            </div>

                                            {!useManual ? (
                                                <div className="space-y-2">
                                                    {bankAccounts.map((acc) => (
                                                        <label
                                                            key={acc.id}
                                                            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedAccountId === acc.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="bank_account"
                                                                value={acc.id}
                                                                checked={selectedAccountId === acc.id}
                                                                onChange={() => setSelectedAccountId(acc.id)}
                                                                className="text-primary"
                                                            />
                                                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{acc.bank_name}</span>
                                                                    {acc.is_primary && (
                                                                        <Badge className="text-[10px] h-4 px-1 bg-amber-100 text-amber-700 border border-amber-300">
                                                                            Utama
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-muted-foreground font-mono">
                                                                    {acc.account_number}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{acc.account_name}</p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Nama Bank</Label>
                                                            <Input
                                                                placeholder="BCA/Mandiri/dll"
                                                                value={wdForm.data.bank_name}
                                                                onChange={(e) => wdForm.setData('bank_name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">No. Rekening</Label>
                                                            <Input
                                                                placeholder="12345678"
                                                                value={wdForm.data.account_number}
                                                                onChange={(e) => wdForm.setData('account_number', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Atas Nama</Label>
                                                        <Input
                                                            placeholder="Nama sesuai buku tabungan"
                                                            value={wdForm.data.account_name}
                                                            onChange={(e) => wdForm.setData('account_name', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* No saved accounts: show manual fields */}
                                    {bankAccounts.length === 0 && (
                                        <div className="space-y-3">
                                            <Label>Rekening Tujuan</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Nama Bank</Label>
                                                    <Input
                                                        placeholder="BCA/Mandiri/dll"
                                                        value={wdForm.data.bank_name}
                                                        onChange={(e) => wdForm.setData('bank_name', e.target.value)}
                                                    />
                                                    {wdForm.errors.bank_name && (
                                                        <p className="text-xs text-destructive">{wdForm.errors.bank_name}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">No. Rekening</Label>
                                                    <Input
                                                        placeholder="12345678"
                                                        value={wdForm.data.account_number}
                                                        onChange={(e) => wdForm.setData('account_number', e.target.value)}
                                                    />
                                                    {wdForm.errors.account_number && (
                                                        <p className="text-xs text-destructive">{wdForm.errors.account_number}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Atas Nama</Label>
                                                <Input
                                                    placeholder="Nama sesuai buku tabungan"
                                                    value={wdForm.data.account_name}
                                                    onChange={(e) => wdForm.setData('account_name', e.target.value)}
                                                />
                                                {wdForm.errors.account_name && (
                                                    <p className="text-xs text-destructive">{wdForm.errors.account_name}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-semibold"
                                        disabled={
                                            wdForm.processing ||
                                            wdForm.data.amount < 50000 ||
                                            wdForm.data.amount > withdrawable
                                        }
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Tarik Dana Sekarang
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Saved Bank Accounts */}
                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-lg">Rekening Bank Tersimpan</CardTitle>
                            <CardDescription>Simpan rekening bank untuk mempercepat proses penarikan.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Tambah Rekening
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showAddForm && (
                            <form
                                onSubmit={submitAddBank}
                                className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3"
                            >
                                <p className="text-sm font-medium">Tambah Rekening Baru</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Nama Bank</Label>
                                        <Input
                                            placeholder="BCA, Mandiri, BRI..."
                                            value={addBankForm.data.bank_name}
                                            onChange={(e) => addBankForm.setData('bank_name', e.target.value)}
                                        />
                                        {addBankForm.errors.bank_name && (
                                            <p className="text-xs text-destructive">{addBankForm.errors.bank_name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">No. Rekening</Label>
                                        <Input
                                            placeholder="12345678"
                                            value={addBankForm.data.account_number}
                                            onChange={(e) => addBankForm.setData('account_number', e.target.value)}
                                        />
                                        {addBankForm.errors.account_number && (
                                            <p className="text-xs text-destructive">{addBankForm.errors.account_number}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Atas Nama</Label>
                                    <Input
                                        placeholder="Nama sesuai buku tabungan"
                                        value={addBankForm.data.account_name}
                                        onChange={(e) => addBankForm.setData('account_name', e.target.value)}
                                    />
                                    {addBankForm.errors.account_name && (
                                        <p className="text-xs text-destructive">{addBankForm.errors.account_name}</p>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={addBankForm.data.is_primary}
                                        onChange={(e) => addBankForm.setData('is_primary', e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-xs text-muted-foreground">Jadikan rekening utama</span>
                                </label>
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" disabled={addBankForm.processing}>
                                        Simpan
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            addBankForm.reset();
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        )}

                        {bankAccounts.length === 0 && !showAddForm ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                Belum ada rekening tersimpan. Tambahkan rekening untuk mempermudah penarikan.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {bankAccounts.map((acc) => (
                                    <div
                                        key={acc.id}
                                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                                    >
                                        <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{acc.bank_name}</span>
                                                {acc.is_primary && (
                                                    <Badge className="text-[10px] h-4 px-1 bg-amber-100 text-amber-700 border border-amber-300">
                                                        Utama
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-mono">{acc.account_number}</p>
                                            <p className="text-xs text-muted-foreground">{acc.account_name}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {!acc.is_primary && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7"
                                                    title="Jadikan utama"
                                                    onClick={() =>
                                                        router.post(`/member/bank-accounts/${acc.id}/primary`)
                                                    }
                                                >
                                                    <Star className="h-3.5 w-3.5 text-amber-500" />
                                                </Button>
                                            )}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                title="Hapus rekening"
                                                onClick={() =>
                                                    router.delete(`/member/bank-accounts/${acc.id}`, {
                                                        onBefore: () =>
                                                            confirm(
                                                                `Hapus rekening ${acc.bank_name} - ${acc.account_number}?`,
                                                            ),
                                                    })
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

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
