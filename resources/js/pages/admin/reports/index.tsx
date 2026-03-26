import { Head, router } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeDollarSign,
    BarChart3,
    Download,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
    month: number;
    ro_amount: number;
    pin_amount: number;
    total: number;
}

interface MonthlyCount {
    month: number;
    count: number;
}

interface MonthlyBonus {
    month: number;
    total: number;
    count: number;
}

interface MonthlyWithdrawal {
    month: number;
    total: number;
}

interface BonusType {
    type: string;
    total: number;
    count: number;
}

interface NetworkPackage {
    package_type: string;
    count: number;
}

interface NetworkStatus {
    status: string;
    count: number;
}

interface Summary {
    total_revenue: number;
    total_bonus_paid: number;
    total_new_members: number;
    total_withdrawn: number;
}

interface Props {
    selectedYear: number;
    yearOptions: number[];
    revenueByMonth: MonthlyRevenue[];
    memberGrowthByMonth: MonthlyCount[];
    bonusByMonth: MonthlyBonus[];
    bonusByType: BonusType[];
    withdrawalByMonth: MonthlyWithdrawal[];
    networkByPackage: NetworkPackage[];
    networkByStatus: NetworkStatus[];
    summary: Summary;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
];

const BONUS_TYPE_COLOR: Record<string, string> = {
    Sponsor: 'bg-violet-500',
    PassUpSponsor: 'bg-indigo-400',
    Pairing: 'bg-brand',
    Matching: 'bg-sky-500',
    Leveling: 'bg-orange-500',
    RepeatOrder: 'bg-teal-500',
    GlobalSharing: 'bg-pink-500',
};

const BONUS_TYPE_DOT: Record<string, string> = {
    Sponsor: 'bg-violet-500',
    PassUpSponsor: 'bg-indigo-400',
    Pairing: 'bg-blue-500',
    Matching: 'bg-sky-500',
    Leveling: 'bg-orange-500',
    RepeatOrder: 'bg-teal-500',
    GlobalSharing: 'bg-pink-500',
};

const PACKAGE_COLOR: Record<string, string> = {
    Silver: 'bg-slate-400',
    Gold: 'bg-amber-400',
    Platinum: 'bg-violet-500',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Laporan & Reporting', href: '/admin/reports' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);
const fmtShort = (v: number) => {
    if (v >= 1_000_000_000) return 'Rp ' + (v / 1_000_000_000).toFixed(1) + 'M';
    if (v >= 1_000_000) return 'Rp ' + (v / 1_000_000).toFixed(1) + 'jt';
    if (v >= 1_000) return 'Rp ' + (v / 1_000).toFixed(0) + 'rb';
    return 'Rp ' + v;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function VerticalBarChart({
    data,
    valueKey,
    color = 'bg-primary',
    height = 120,
}: {
    data: { label: string; value: number }[];
    valueKey?: string;
    color?: string;
    height?: number;
}) {
    const maxVal = Math.max(...data.map((d) => d.value), 1);

    return (
        <div
            className="flex items-end justify-between gap-1"
            style={{ height }}
        >
            {data.map((d, i) => (
                <div
                    key={i}
                    className="group relative flex flex-1 flex-col items-center gap-1"
                >
                    <div
                        className="absolute bottom-6 hidden rounded bg-gray-900 px-1.5 py-1 text-[10px] font-medium text-white shadow group-hover:block"
                        style={{ whiteSpace: 'nowrap', zIndex: 10 }}
                    >
                        {fmtShort(d.value)}
                    </div>
                    <div className="flex w-full flex-1 items-end">
                        <div
                            className={`w-full rounded-t ${color} opacity-80 transition-all group-hover:opacity-100`}
                            style={{
                                height: `${Math.ceil((d.value / maxVal) * (height - 24))}px`,
                                minHeight: d.value > 0 ? 3 : 0,
                            }}
                        />
                    </div>
                    <span className="text-[9px] leading-none text-muted-foreground">
                        {d.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function VerticalBarChartStacked({
    data,
    height = 120,
}: {
    data: { label: string; ro: number; pin: number }[];
    height?: number;
}) {
    const maxVal = Math.max(...data.map((d) => d.ro + d.pin), 1);
    const innerHeight = height - 24;

    return (
        <div
            className="flex items-end justify-between gap-1"
            style={{ height }}
        >
            {data.map((d, i) => {
                const totalH = Math.ceil(
                    ((d.ro + d.pin) / maxVal) * innerHeight,
                );
                const roH =
                    totalH > 0
                        ? Math.round((d.ro / (d.ro + d.pin || 1)) * totalH)
                        : 0;
                const pinH = totalH - roH;
                return (
                    <div
                        key={i}
                        className="group relative flex flex-1 flex-col items-center gap-1"
                    >
                        <div
                            className="absolute bottom-6 hidden rounded bg-gray-900 px-1.5 py-1 text-[10px] font-medium text-white shadow group-hover:block"
                            style={{ whiteSpace: 'nowrap', zIndex: 10 }}
                        >
                            {fmtShort(d.ro + d.pin)}
                        </div>
                        <div className="flex w-full flex-1 flex-col items-end justify-end">
                            {pinH > 0 && (
                                <div
                                    className="w-full rounded-t bg-violet-400 opacity-80 transition-all group-hover:opacity-100"
                                    style={{ height: pinH }}
                                />
                            )}
                            {roH > 0 && (
                                <div
                                    className={`w-full bg-teal-500 opacity-80 transition-all group-hover:opacity-100 ${pinH === 0 ? 'rounded-t' : ''}`}
                                    style={{ height: roH }}
                                />
                            )}
                            {totalH === 0 && (
                                <div className="w-full" style={{ height: 0 }} />
                            )}
                        </div>
                        <span className="text-[9px] leading-none text-muted-foreground">
                            {d.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportIndex({
    selectedYear,
    yearOptions,
    revenueByMonth,
    memberGrowthByMonth,
    bonusByMonth,
    bonusByType,
    withdrawalByMonth,
    networkByPackage,
    networkByStatus,
    summary,
}: Props) {
    const handleYearChange = (year: string) => {
        router.get('/admin/reports', { year }, { preserveState: false });
    };

    const totalBonus = bonusByType.reduce((s, b) => s + b.total, 0);
    const totalNetwork = networkByPackage.reduce((s, n) => s + n.count, 0);

    const revenueChartData = revenueByMonth.map((r) => ({
        label: MONTH_LABELS[r.month - 1],
        ro: r.ro_amount,
        pin: r.pin_amount,
    }));

    const memberChartData = memberGrowthByMonth.map((m) => ({
        label: MONTH_LABELS[m.month - 1],
        value: m.count,
    }));

    const bonusChartData = bonusByMonth.map((b) => ({
        label: MONTH_LABELS[b.month - 1],
        value: b.total,
    }));

    const withdrawalChartData = withdrawalByMonth.map((w) => ({
        label: MONTH_LABELS[w.month - 1],
        value: w.total,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan & Reporting" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Laporan & Reporting
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan performa bisnis tahun {selectedYear}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="/admin/wallet-transactions/export">
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Download className="h-4 w-4" />
                                Export Transaksi Wallet
                            </Button>
                        </a>
                        <span className="text-sm text-muted-foreground">
                            Tahun:
                        </span>
                        <Select
                            value={String(selectedYear)}
                            onValueChange={handleYearChange}
                        >
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Omzet {selectedYear}
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {fmtShort(summary.total_revenue)}
                                    </p>
                                    <p
                                        className="mt-0.5 text-xs text-muted-foreground"
                                        title={fmt(summary.total_revenue)}
                                    >
                                        {fmt(summary.total_revenue).replace(
                                            'Rp ',
                                            'Rp\u00a0',
                                        )}
                                    </p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50">
                                    <BadgeDollarSign className="size-4 text-teal-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Bonus Dibayar
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {fmtShort(summary.total_bonus_paid)}
                                    </p>
                                    <p
                                        className="mt-0.5 text-xs text-muted-foreground"
                                        title={fmt(summary.total_bonus_paid)}
                                    >
                                        {bonusByType.length} jenis bonus
                                    </p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
                                    <TrendingUp className="size-4 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Member Baru
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {summary.total_new_members}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        sepanjang {selectedYear}
                                    </p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
                                    <Users className="size-4 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Penarikan
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-gray-900">
                                        {fmtShort(summary.total_withdrawn)}
                                    </p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        disetujui {selectedYear}
                                    </p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-red-50">
                                    <TrendingDown className="size-4 text-red-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Chart */}
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">
                                    Trend Omzet Bulanan
                                </CardTitle>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Repeat Order & PIN Order yang sudah dibayar
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />{' '}
                                    Repeat Order
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />{' '}
                                    PIN Order
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">
                            <VerticalBarChartStacked
                                data={revenueChartData}
                                height={140}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4 md:grid-cols-6">
                            {revenueByMonth
                                .filter((_, i) =>
                                    [1, 3, 5, 7, 9, 11].includes(i),
                                )
                                .map((r) => (
                                    <div key={r.month} className="text-center">
                                        <p className="text-xs font-medium text-gray-700">
                                            {MONTH_LABELS[r.month - 1]}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {fmtShort(r.total)}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Member Growth + Bonus Month */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Pertumbuhan Member Baru per Bulan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VerticalBarChart
                                data={memberChartData}
                                color="bg-blue-500"
                                height={130}
                            />
                            <div className="mt-3 flex items-center justify-between border-t pt-3">
                                <span className="text-xs text-muted-foreground">
                                    Total:{' '}
                                    <strong>{summary.total_new_members}</strong>{' '}
                                    member baru
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Rata-rata:{' '}
                                    <strong>
                                        {(
                                            summary.total_new_members / 12
                                        ).toFixed(1)}
                                    </strong>
                                    /bulan
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Total Bonus per Bulan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VerticalBarChart
                                data={bonusChartData}
                                color="bg-amber-400"
                                height={130}
                            />
                            <div className="mt-3 flex items-center justify-between border-t pt-3">
                                <span className="text-xs text-muted-foreground">
                                    Total:{' '}
                                    <strong>
                                        {fmtShort(summary.total_bonus_paid)}
                                    </strong>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {bonusByMonth.reduce(
                                        (s, b) => s + b.count,
                                        0,
                                    )}{' '}
                                    transaksi bonus
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bonus by Type + Network + Withdrawal */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Bonus Distribution */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Distribusi Bonus per Tipe
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Tahun {selectedYear}
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {bonusByType.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    Belum ada data bonus.
                                </p>
                            ) : (
                                bonusByType.map((b) => {
                                    const pct =
                                        totalBonus > 0
                                            ? Math.round(
                                                  (b.total / totalBonus) * 100,
                                              )
                                            : 0;
                                    const barColor =
                                        BONUS_TYPE_DOT[b.type] ?? 'bg-gray-400';
                                    return (
                                        <div key={b.type}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${barColor}`}
                                                    />
                                                    <span className="font-medium text-gray-700">
                                                        {b.type}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        ({b.count}x)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {fmtShort(b.total)}
                                                    </span>
                                                    <span className="w-7 text-right text-muted-foreground">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className={`h-full rounded-full ${barColor} transition-all`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {bonusByType.length > 0 && (
                                <div className="mt-1 flex justify-between border-t pt-2 text-xs">
                                    <span className="text-muted-foreground">
                                        Total
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {fmt(totalBonus)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Network Distribution */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Distribusi Jaringan
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Semua member aktif saat ini
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    Per Paket
                                </p>
                                {networkByPackage.map((n) => {
                                    const pct =
                                        totalNetwork > 0
                                            ? Math.round(
                                                  (n.count / totalNetwork) *
                                                      100,
                                              )
                                            : 0;
                                    const barColor =
                                        PACKAGE_COLOR[n.package_type] ??
                                        'bg-gray-400';
                                    return (
                                        <div key={n.package_type}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${barColor}`}
                                                    />
                                                    <span className="font-medium">
                                                        {n.package_type ?? '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {n.count}
                                                    </span>
                                                    <span className="w-7 text-right text-muted-foreground">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className={`h-full rounded-full ${barColor}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-col gap-2 border-t pt-3">
                                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                    Per Status
                                </p>
                                {networkByStatus.map((n) => {
                                    const pct =
                                        totalNetwork > 0
                                            ? Math.round(
                                                  (n.count / totalNetwork) *
                                                      100,
                                              )
                                            : 0;
                                    const color =
                                        n.status === 'active'
                                            ? 'bg-green-500'
                                            : n.status === 'pending'
                                              ? 'bg-yellow-400'
                                              : 'bg-gray-400';
                                    return (
                                        <div
                                            key={n.status}
                                            className="flex items-center justify-between text-xs"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`h-2 w-2 rounded-full ${color}`}
                                                />
                                                <span className="font-medium capitalize">
                                                    {n.status ?? '-'}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-gray-900">
                                                {n.count}{' '}
                                                <span className="font-normal text-muted-foreground">
                                                    ({pct}%)
                                                </span>
                                            </span>
                                        </div>
                                    );
                                })}
                                <div className="mt-1 flex justify-between border-t pt-1 text-xs">
                                    <span className="text-muted-foreground">
                                        Total member
                                    </span>
                                    <span className="font-bold">
                                        {totalNetwork}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Withdrawal Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Penarikan Disetujui per Bulan
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                Tahun {selectedYear}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <VerticalBarChart
                                data={withdrawalChartData}
                                color="bg-red-400"
                                height={130}
                            />
                            <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                                <span>
                                    Total:{' '}
                                    <strong>
                                        {fmtShort(summary.total_withdrawn)}
                                    </strong>
                                </span>
                                <span>
                                    Rata-rata:{' '}
                                    <strong>
                                        {fmtShort(
                                            Math.round(
                                                summary.total_withdrawn / 12,
                                            ),
                                        )}
                                    </strong>
                                    /bln
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bonus Recap Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Rekap Bonus Bulanan {selectedYear}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Total bonus yang sudah disetujui/dibayarkan per
                            bulan
                        </p>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground">
                                        Bulan
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        Jumlah Transaksi
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        Total Bonus
                                    </th>
                                    <th className="py-2 pl-3 text-left text-xs font-semibold text-muted-foreground">
                                        Proporsi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {bonusByMonth.map((b) => {
                                    const pct =
                                        summary.total_bonus_paid > 0
                                            ? Math.round(
                                                  (b.total /
                                                      summary.total_bonus_paid) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <tr
                                            key={b.month}
                                            className="border-b last:border-0 hover:bg-gray-50/60"
                                        >
                                            <td className="py-2 pr-4 font-medium text-gray-900">
                                                {MONTH_LABELS[b.month - 1]}{' '}
                                                {selectedYear}
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground">
                                                {b.count > 0 ? b.count : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                                {b.total > 0 ? (
                                                    fmt(b.total)
                                                ) : (
                                                    <span className="font-normal text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 pl-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className="h-full rounded-full bg-amber-400"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td className="py-2 pr-4 font-bold text-gray-900">
                                        Total
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                                        {bonusByMonth.reduce(
                                            (s, b) => s + b.count,
                                            0,
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                                        {fmt(summary.total_bonus_paid)}
                                    </td>
                                    <td className="py-2 pl-3" />
                                </tr>
                            </tfoot>
                        </table>
                    </CardContent>
                </Card>

                {/* Revenue Recap Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                            Rekap Omzet Bulanan {selectedYear}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Repeat Order + PIN Order yang sudah dibayar
                        </p>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground">
                                        Bulan
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        Repeat Order
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        PIN Order
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">
                                        Total
                                    </th>
                                    <th className="py-2 pl-3 text-left text-xs font-semibold text-muted-foreground">
                                        Proporsi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueByMonth.map((r) => {
                                    const pct =
                                        summary.total_revenue > 0
                                            ? Math.round(
                                                  (r.total /
                                                      summary.total_revenue) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <tr
                                            key={r.month}
                                            className="border-b last:border-0 hover:bg-gray-50/60"
                                        >
                                            <td className="py-2 pr-4 font-medium text-gray-900">
                                                {MONTH_LABELS[r.month - 1]}{' '}
                                                {selectedYear}
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground">
                                                {r.ro_amount > 0
                                                    ? fmtShort(r.ro_amount)
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right text-muted-foreground">
                                                {r.pin_amount > 0
                                                    ? fmtShort(r.pin_amount)
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                                {r.total > 0 ? (
                                                    fmt(r.total)
                                                ) : (
                                                    <span className="font-normal text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2 pl-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                                        <div
                                                            className="h-full rounded-full bg-teal-500"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td className="py-2 pr-4 font-bold text-gray-900">
                                        Total
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-700">
                                        {fmtShort(
                                            revenueByMonth.reduce(
                                                (s, r) => s + r.ro_amount,
                                                0,
                                            ),
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-700">
                                        {fmtShort(
                                            revenueByMonth.reduce(
                                                (s, r) => s + r.pin_amount,
                                                0,
                                            ),
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-900">
                                        {fmt(summary.total_revenue)}
                                    </td>
                                    <td className="py-2 pl-3" />
                                </tr>
                            </tfoot>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
