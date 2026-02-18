import { Head, Link, router } from '@inertiajs/react';
import { approve, reject } from '@/actions/App/Http/Controllers/Admin/WithdrawalController';
import { ArrowLeft, BadgeCheck, Banknote, Building2, CreditCard, User, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        referral_code: string;
        member_profile?: {
            package_type: string;
            career_level: string;
        };
    };
    processed_by_user?: { name: string };
}

interface Props {
    withdrawal: Withdrawal;
}

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; className: string }> = {
        pending:  { label: 'Menunggu',  className: 'bg-amber-100 text-amber-700 border-amber-300' },
        approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border-green-300' },
        rejected: { label: 'Ditolak',   className: 'bg-red-100 text-red-700 border-red-300' },
    };
    const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
        <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
};

export default function WithdrawalShow({ withdrawal }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Penarikan Dana', href: '/admin/withdrawals' },
        { title: `#${withdrawal.id}`, href: `/admin/withdrawals/${withdrawal.id}` },
    ];

    const handleApprove = () => {
        if (confirm(`Setujui penarikan ${fmt(withdrawal.amount)} untuk ${withdrawal.user.name}?`)) {
            router.post(approve(withdrawal.id).url);
        }
    };

    const handleReject = () => {
        if (confirm('Tolak penarikan ini? Saldo akan dikembalikan ke wallet member.')) {
            router.post(reject(withdrawal.id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Penarikan #${withdrawal.id}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
                            <Link href="/admin/withdrawals">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50">
                                <Banknote className="size-5 text-amber-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Detail Penarikan #{withdrawal.id}</h1>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(withdrawal.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {withdrawal.status === 'pending' && (
                        <div className="flex shrink-0 gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                onClick={handleApprove}
                            >
                                <BadgeCheck className="h-4 w-4" />
                                Setujui
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
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
                    {/* Left: detail */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Status & jumlah */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Penarikan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="divide-y">
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Jumlah</dt>
                                        <dd className="text-xl font-bold text-gray-900">{fmt(withdrawal.amount)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd><StatusBadge status={withdrawal.status} /></dd>
                                    </div>
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Tanggal Pengajuan</dt>
                                        <dd className="text-gray-700">
                                            {new Date(withdrawal.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                        </dd>
                                    </div>
                                    {withdrawal.status !== 'pending' && (
                                        <div className="flex items-center justify-between py-3 text-sm">
                                            <dt className="text-muted-foreground">Diproses Pada</dt>
                                            <dd className="text-gray-700">
                                                {new Date(withdrawal.updated_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                            </dd>
                                        </div>
                                    )}
                                    {withdrawal.processed_by_user && (
                                        <div className="flex items-center justify-between py-3 text-sm">
                                            <dt className="text-muted-foreground">Diproses Oleh</dt>
                                            <dd className="font-medium text-gray-900">{withdrawal.processed_by_user.name}</dd>
                                        </div>
                                    )}
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Rekening tujuan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Rekening Tujuan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl border bg-gray-50 p-5">
                                    <div className="grid gap-5 md:grid-cols-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bank</p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-bold uppercase text-gray-900">{withdrawal.bank_name}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">No. Rekening</p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-mono text-lg font-bold text-brand">{withdrawal.account_number}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Atas Nama</p>
                                            <div className="mt-1 flex items-center gap-1.5">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-bold uppercase text-gray-900">{withdrawal.account_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: member info */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Informasi Member</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 rounded-xl border bg-gray-50 p-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                                        <User className="size-5 text-brand" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{withdrawal.user.name}</p>
                                        <p className="font-mono text-xs text-muted-foreground">{withdrawal.user.referral_code}</p>
                                    </div>
                                </div>

                                <dl className="divide-y text-sm">
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-muted-foreground">Email</dt>
                                        <dd className="font-medium text-gray-900">{withdrawal.user.email}</dd>
                                    </div>
                                    {withdrawal.user.phone && (
                                        <div className="flex justify-between py-2.5">
                                            <dt className="text-muted-foreground">Telepon</dt>
                                            <dd className="text-gray-900">{withdrawal.user.phone}</dd>
                                        </div>
                                    )}
                                    {withdrawal.user.member_profile && (
                                        <>
                                            <div className="flex justify-between py-2.5">
                                                <dt className="text-muted-foreground">Paket</dt>
                                                <dd>
                                                    <span className="rounded-md border bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                        {withdrawal.user.member_profile.package_type}
                                                    </span>
                                                </dd>
                                            </div>
                                            <div className="flex justify-between py-2.5">
                                                <dt className="text-muted-foreground">Career Level</dt>
                                                <dd className="font-medium text-gray-900">{withdrawal.user.member_profile.career_level}</dd>
                                            </div>
                                        </>
                                    )}
                                </dl>

                                <Link href={`/admin/members/${withdrawal.user.id}`}>
                                    <Button variant="outline" size="sm" className="w-full">
                                        Lihat Profil Member
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
