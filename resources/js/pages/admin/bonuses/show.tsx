import { Head, Link, router } from '@inertiajs/react';
import { approve, reject } from '@/actions/App/Http/Controllers/Admin/BonusController';
import { index } from '@/routes/admin/bonuses';
import {
    ArrowLeft,
    BadgeCheck,
    Calendar,
    CircleDollarSign,
    Clock,
    CreditCard,
    FileText,
    User as UserIcon,
    Wallet,
    XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface BonusDetail {
    id: number;
    bonus_type: string;
    amount: number;
    ewallet_amount: number;
    cash_amount: number;
    status: string;
    bonus_date: string | null;
    period_month: number | null;
    period_year: number | null;
    meta: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    member_profile: {
        id: number;
        package_type: string;
        career_level: string;
        left_pp_total: number;
        right_pp_total: number;
        user: {
            id: number;
            name: string;
            email: string;
            referral_code: string;
            phone: string | null;
        };
        parent: {
            user: {
                name: string;
                referral_code: string;
            };
        } | null;
    };
    approved_by: {
        name: string;
    } | null;
    daily_bonus_run: {
        id: number;
        run_date: string;
        status: string;
    } | null;
}

interface Props {
    bonus: BonusDetail;
}

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const statusConfig: Record<string, { label: string; className: string }> = {
    Pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-300' },
    Approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border-green-300' },
    Rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-300' },
    Paid: { label: 'Dibayar', className: 'bg-blue-100 text-blue-700 border-blue-300' },
};

const bonusTypeColor: Record<string, string> = {
    Sponsor: 'bg-violet-100 text-violet-700',
    Pairing: 'bg-brand-50 text-brand',
    Matching: 'bg-sky-100 text-sky-700',
    Leveling: 'bg-orange-100 text-orange-700',
    RepeatOrder: 'bg-teal-100 text-teal-700',
    GlobalSharing: 'bg-pink-100 text-pink-700',
};

const metaLabels: Record<string, string> = {
    pairs:             'Jumlah Pasang',
    left_pp:           'PP Kiri',
    right_pp:          'PP Kanan',
    percent:           'Persentase',
    generation:        'Generasi',
    source_bonus_id:   'ID Bonus Sumber',
    source_profile_id: 'ID Profil Sumber',
    left_pkg:          'Paket Kiri',
    right_pkg:         'Paket Kanan',
    sponsor_id:        'ID Sponsor',
    order_id:          'ID Pesanan',
    order_amount:      'Nilai Pesanan',
    total_members:     'Total Member',
    total_pool:        'Total Pool',
    share_percent:     'Persentase Bagian',
};

function metaLabel(key: string): string {
    return metaLabels[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function metaValue(key: string, value: unknown): string {
    if (typeof value === 'number') {
        if (key === 'percent' || key === 'share_percent') return `${value}%`;
        if (key.includes('amount') || key.includes('pool') || key.includes('bonus') || key.includes('order_amount')) return fmt(value);
        return new Intl.NumberFormat('id-ID').format(value);
    }
    return String(value);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right">{value ?? '-'}</span>
        </div>
    );
}

export default function BonusShow({ bonus }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Bonus', href: index().url },
        { title: `Bonus #${bonus.id}`, href: '#' },
    ];

    const statusCfg = statusConfig[bonus.status] ?? { label: bonus.status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
    const bonusColor = bonusTypeColor[bonus.bonus_type] ?? 'bg-gray-100 text-gray-700';
    const isPending = bonus.status === 'Pending';

    const handleApprove = () => {
        if (confirm(`Setujui bonus ini sebesar ${fmt(bonus.amount)}?`)) {
            router.post(approve(bonus.id).url);
        }
    };

    const handleReject = () => {
        if (confirm('Tolak bonus ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.post(reject(bonus.id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Bonus #${bonus.id}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={index().url}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900">Bonus #{bonus.id}</h1>
                                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${bonusColor}`}>
                                    {bonus.bonus_type}
                                </span>
                                <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${statusCfg.className}`}>
                                    {statusCfg.label}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Dibuat {new Date(bonus.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>

                    {isPending && (
                        <div className="flex gap-2 sm:shrink-0">
                            <Button
                                variant="outline"
                                className="gap-1.5 border-green-300 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                onClick={handleApprove}
                            >
                                <BadgeCheck className="h-4 w-4" />
                                Setujui
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-1.5 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                onClick={handleReject}
                            >
                                <XCircle className="h-4 w-4" />
                                Tolak
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">

                    {/* Nominal Cards */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CircleDollarSign className="h-4 w-4" /> Total Bonus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">{fmt(bonus.amount)}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Wallet className="h-4 w-4" /> E-Wallet (20%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-brand">{fmt(bonus.ewallet_amount)}</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <CreditCard className="h-4 w-4" /> Cash (80%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">{fmt(bonus.cash_amount)}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    {/* Bonus Info */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-muted-foreground" /> Informasi Bonus
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 divide-y">
                            <InfoRow label="ID Bonus" value={<span className="font-mono text-xs">#{bonus.id}</span>} />
                            <InfoRow label="Jenis Bonus" value={
                                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${bonusColor}`}>
                                    {bonus.bonus_type}
                                </span>
                            } />
                            <InfoRow label="Status" value={
                                <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${statusCfg.className}`}>
                                    {statusCfg.label}
                                </span>
                            } />
                            <InfoRow label="Tanggal Bonus" value={
                                bonus.bonus_date
                                    ? new Date(bonus.bonus_date).toLocaleDateString('id-ID', { dateStyle: 'long' })
                                    : '-'
                            } />
                            {bonus.period_month && bonus.period_year && (
                                <InfoRow label="Periode" value={`${bonus.period_month}/${bonus.period_year}`} />
                            )}
                            {bonus.approved_by && (
                                <InfoRow label="Diproses Oleh" value={bonus.approved_by.name} />
                            )}
                            {bonus.daily_bonus_run && (
                                <InfoRow
                                    label="Bonus Run"
                                    value={
                                        <span className="font-mono text-xs">
                                            #{bonus.daily_bonus_run.id} — {new Date(bonus.daily_bonus_run.run_date).toLocaleDateString('id-ID')}
                                        </span>
                                    }
                                />
                            )}
                            <InfoRow label="Dibuat" value={
                                new Date(bonus.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                            } />
                        </CardContent>
                    </Card>

                    {/* Member Info */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <UserIcon className="h-4 w-4 text-muted-foreground" /> Informasi Member
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 divide-y">
                            <InfoRow label="Nama" value={
                                <Link
                                    href={`/admin/members/${bonus.member_profile.user.id}`}
                                    className="font-medium text-brand hover:underline"
                                >
                                    {bonus.member_profile.user.name}
                                </Link>
                            } />
                            <InfoRow label="Email" value={bonus.member_profile.user.email} />
                            <InfoRow label="No. Telepon" value={bonus.member_profile.user.phone ?? '-'} />
                            <InfoRow label="Kode Referral" value={
                                <span className="font-mono text-xs">{bonus.member_profile.user.referral_code}</span>
                            } />
                            <InfoRow label="Paket" value={
                                <Badge variant="outline" className="text-xs uppercase">
                                    {bonus.member_profile.package_type}
                                </Badge>
                            } />
                            <InfoRow label="Level Karir" value={bonus.member_profile.career_level} />
                            <InfoRow label="PP Kiri / Kanan" value={
                                <span className="font-mono text-xs">
                                    {new Intl.NumberFormat('id-ID').format(bonus.member_profile.left_pp_total)} / {new Intl.NumberFormat('id-ID').format(bonus.member_profile.right_pp_total)}
                                </span>
                            } />
                            {bonus.member_profile.parent && (
                                <InfoRow label="Upline" value={
                                    <span className="text-xs">
                                        {bonus.member_profile.parent.user.name}
                                        <span className="font-mono text-muted-foreground ml-1">
                                            ({bonus.member_profile.parent.user.referral_code})
                                        </span>
                                    </span>
                                } />
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Meta Data */}
                {bonus.meta && Object.keys(bonus.meta).length > 0 && (
                    <Card className="border-none shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-muted-foreground" /> Data Kalkulasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="divide-y rounded-lg border bg-slate-50/50">
                                {Object.entries(bonus.meta).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                        <span className="text-muted-foreground">{metaLabel(key)}</span>
                                        <span className="font-medium">{metaValue(key, value)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timeline */}
                <Card className="border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4 text-muted-foreground" /> Riwayat Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50">
                                    <Calendar className="h-3.5 w-3.5 text-brand" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Bonus dibuat oleh sistem</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(bonus.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>

                            {bonus.status !== 'Pending' && (
                                <>
                                    <Separator className="ml-3 w-px h-4 bg-slate-200 self-start" />
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${bonus.status === 'Approved' || bonus.status === 'Paid'
                                                ? 'bg-green-50'
                                                : 'bg-red-50'
                                            }`}>
                                            {bonus.status === 'Approved' || bonus.status === 'Paid'
                                                ? <BadgeCheck className="h-3.5 w-3.5 text-green-600" />
                                                : <XCircle className="h-3.5 w-3.5 text-red-600" />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {bonus.status === 'Approved' ? 'Disetujui'
                                                    : bonus.status === 'Paid' ? 'Dibayarkan'
                                                        : 'Ditolak'}
                                                {bonus.approved_by && ` oleh ${bonus.approved_by.name}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(bonus.updated_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
