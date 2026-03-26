import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { index as simulationRoute } from '@/actions/App/Http/Controllers/Member/BonusSimulationController';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface PairingSimulation {
    pairs: number;
    amount: number;
    cash: number;
    ewallet: number;
    hangus: boolean;
    left_pp: number;
    right_pp: number;
    cap_reached: boolean;
}

interface MatchingDetail {
    generation: number;
    percent: number;
    estimated_amount: number;
    sources: number;
}

interface MatchingSimulation {
    total: number;
    details: MatchingDetail[];
}

interface LevelingDetail {
    level: number;
    amount: number;
    cash: number;
    ewallet: number;
    left_pkg: string;
    right_pkg: string;
}

interface LevelingSimulation {
    total: number;
    pending_levels: number[];
    already_rewarded: number[];
    details: LevelingDetail[];
}

interface RepeatOrderBonus {
    amount: number;
    percent: number;
    own_ro: number;
    downline_ro: number;
}

interface GlobalSharingBonus {
    amount: number | null;
    pool: number;
    percent: number;
    qualified: boolean;
    level: string;
    members_at_level: number;
    national_ro: number;
}

interface MonthlySimulation {
    repeat_order: RepeatOrderBonus;
    global_sharing: GlobalSharingBonus;
}

interface CareerProgress {
    current_level: string;
    next_level: string | null;
    smaller_leg_cumulative: number;
    left_cumulative: number;
    right_cumulative: number;
    current_required: number;
    next_required: number;
    progress_percent: number;
}

interface Simulation {
    pairing: PairingSimulation;
    matching: MatchingSimulation;
    leveling: LevelingSimulation;
    monthly: MonthlySimulation;
    career: CareerProgress;
    package_type: string;
    left_pp: number;
    right_pp: number;
    pairing_unit: number;
    max_pairs_per_day: number;
}

interface Props {
    simulation: Simulation | null;
    message: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Riwayat Bonus', href: '/member/bonuses' },
    { title: 'Simulasi Bonus', href: simulationRoute.definition.url },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const PKG_COLORS: Record<string, string> = {
    Silver: 'bg-slate-100 text-slate-700',
    Gold: 'bg-amber-100 text-amber-700',
    Platinum: 'bg-purple-100 text-purple-700',
};

export default function BonusSimulation({ simulation, message }: Props) {
    if (!simulation) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Simulasi Bonus" />
                <div className="p-4 md:p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {message ?? 'Simulasi tidak tersedia.'}
                        </AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    const { pairing, matching, leveling, monthly, career } = simulation;

    const totalEstimatedDaily =
        pairing.amount + matching.total + leveling.total;
    const totalEstimatedMonthly =
        monthly.repeat_order.amount + (monthly.global_sharing.amount ?? 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Simulasi Bonus" />

            <div className="space-y-5 p-4 md:p-6">
                {/* Disclaimer */}
                <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-sm">
                        <strong>Estimasi saja.</strong> Angka di bawah merupakan
                        perkiraan berdasarkan kondisi saat ini dan bisa berubah
                        saat proses bonus dijalankan.
                    </AlertDescription>
                </Alert>

                {/* ── Summary Row ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700">
                                Estimasi Bonus Harian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-800">
                                {fmt(totalEstimatedDaily)}
                            </p>
                            <p className="mt-1 text-xs text-green-600">
                                Pairing + Matching + Leveling
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700">
                                Estimasi Bonus Bulanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-800">
                                {fmt(totalEstimatedMonthly)}
                            </p>
                            <p className="mt-1 text-xs text-blue-600">
                                Repeat Order + Global Sharing
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Career Progress ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            Progres Karier
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Level Saat Ini:{' '}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="bg-purple-100 text-purple-800"
                                >
                                    {career.current_level}
                                </Badge>
                            </div>
                            {career.next_level && (
                                <div>
                                    <span className="text-muted-foreground">
                                        Target Berikutnya:{' '}
                                    </span>
                                    <Badge variant="outline">
                                        {career.next_level}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        {career.next_level && (
                            <>
                                <Progress
                                    value={career.progress_percent}
                                    className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                    PP Kaki Terkecil:{' '}
                                    <strong>
                                        {career.smaller_leg_cumulative.toLocaleString(
                                            'id-ID',
                                        )}
                                    </strong>{' '}
                                    /{' '}
                                    {career.next_required.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    ({career.progress_percent}%)
                                </p>
                            </>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <span>
                                PP Kiri (kumulatif):{' '}
                                <strong>
                                    {career.left_cumulative.toLocaleString(
                                        'id-ID',
                                    )}
                                </strong>
                            </span>
                            <span>
                                PP Kanan (kumulatif):{' '}
                                <strong>
                                    {career.right_cumulative.toLocaleString(
                                        'id-ID',
                                    )}
                                </strong>
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Pairing ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Bonus Pairing (Hari Ini)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                            <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    PP Kiri
                                </p>
                                <p className="text-lg font-bold">
                                    {pairing.left_pp}
                                </p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    PP Kanan
                                </p>
                                <p className="text-lg font-bold">
                                    {pairing.right_pp}
                                </p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Pasangan
                                </p>
                                <p className="text-lg font-bold">
                                    {pairing.pairs}
                                </p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3 text-center">
                                <p className="text-xs text-green-700">
                                    Estimasi
                                </p>
                                <p className="text-lg font-bold text-green-800">
                                    {fmt(pairing.amount)}
                                </p>
                            </div>
                        </div>

                        {pairing.cap_reached && (
                            <Alert className="border-orange-200 bg-orange-50">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-sm text-orange-700">
                                    Batas pairing harian sudah tercapai untuk
                                    hari ini.
                                </AlertDescription>
                            </Alert>
                        )}

                        {pairing.pairs > 0 && (
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <span>
                                    Kas (80%):{' '}
                                    <strong className="text-foreground">
                                        {fmt(pairing.cash)}
                                    </strong>
                                </span>
                                <span>
                                    E-Wallet (20%):{' '}
                                    <strong className="text-foreground">
                                        {fmt(pairing.ewallet)}
                                    </strong>
                                </span>
                            </div>
                        )}

                        {pairing.hangus && (
                            <p className="text-xs text-amber-600">
                                ⚠ Kedua kaki melebihi batas harian. PP yang
                                melewati cap tidak terbawa ke hari berikutnya.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ── Matching ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Bonus Matching (Dari Downline Hari Ini)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {matching.details.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Tidak ada estimasi matching. Downline Anda belum
                                melakukan pairing hari ini.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {matching.details.map((d) => (
                                    <div
                                        key={d.generation}
                                        className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                Generasi {d.generation}
                                            </span>
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                ({d.percent}% dari {d.sources}{' '}
                                                downline)
                                            </span>
                                        </div>
                                        <span className="font-semibold text-green-700">
                                            {fmt(d.estimated_amount)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 text-sm font-bold">
                                    <span>Total Estimasi</span>
                                    <span className="text-green-700">
                                        {fmt(matching.total)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── Leveling ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Bonus Leveling
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {leveling.already_rewarded.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">
                                    Sudah diterima:
                                </span>
                                {leveling.already_rewarded.map((lvl) => (
                                    <Badge
                                        key={lvl}
                                        variant="secondary"
                                        className="gap-1 text-xs"
                                    >
                                        <CheckCircle className="h-3 w-3" />{' '}
                                        Level {lvl}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {leveling.details.length === 0 &&
                        leveling.pending_levels.length === 0 ? (
                            <p className="py-2 text-center text-sm text-muted-foreground">
                                Semua level sudah diterima.
                            </p>
                        ) : (
                            <>
                                {leveling.details.map((d) => (
                                    <div
                                        key={d.level}
                                        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">
                                                    Level {d.level}
                                                </span>
                                                <span className="ml-2 gap-1">
                                                    <Badge
                                                        className={`${PKG_COLORS[d.left_pkg]} mr-1 text-xs`}
                                                    >
                                                        {d.left_pkg}
                                                    </Badge>
                                                    <Badge
                                                        className={`${PKG_COLORS[d.right_pkg]} text-xs`}
                                                    >
                                                        {d.right_pkg}
                                                    </Badge>
                                                </span>
                                            </div>
                                            <span className="font-bold text-green-700">
                                                {fmt(d.amount)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Kas: {fmt(d.cash)} · E-Wallet:{' '}
                                            {fmt(d.ewallet)}
                                        </p>
                                    </div>
                                ))}

                                {leveling.pending_levels.map((lvl) => (
                                    <div
                                        key={lvl}
                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                                    >
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-muted-foreground">
                                            Level {lvl} — menunggu member di
                                            kedua sisi
                                        </span>
                                    </div>
                                ))}

                                {leveling.total > 0 && (
                                    <div className="flex justify-between border-t pt-2 text-sm font-bold">
                                        <span>Total Estimasi</span>
                                        <span className="text-green-700">
                                            {fmt(leveling.total)}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Monthly ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Repeat Order */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Bonus Repeat Order (Bulan Ini)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Total RO Sendiri
                                </span>
                                <span>{fmt(monthly.repeat_order.own_ro)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Total RO Downline (7 gen)
                                </span>
                                <span>
                                    {fmt(monthly.repeat_order.downline_ro)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold">
                                <span>Estimasi Bonus (5%)</span>
                                <span className="text-blue-700">
                                    {fmt(monthly.repeat_order.amount)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Global Sharing */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Bonus Global Sharing (Bulan Ini)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Level Karier
                                </span>
                                <Badge variant="secondary">
                                    {monthly.global_sharing.level}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Kualifikasi RO Sendiri ≥ 1jt
                                </span>
                                {monthly.global_sharing.qualified ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                            </div>
                            {monthly.global_sharing.percent > 0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Pool (
                                            {monthly.global_sharing.percent}%
                                            Omset Nasional)
                                        </span>
                                        <span>
                                            {fmt(monthly.global_sharing.pool)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Member di Level Sama
                                        </span>
                                        <span>
                                            {
                                                monthly.global_sharing
                                                    .members_at_level
                                            }
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between border-t pt-2 font-bold">
                                <span>Estimasi per Member</span>
                                <span className="text-blue-700">
                                    {monthly.global_sharing.amount != null
                                        ? fmt(monthly.global_sharing.amount)
                                        : '—'}
                                </span>
                            </div>
                            {!monthly.global_sharing.qualified &&
                                monthly.global_sharing.percent > 0 && (
                                    <p className="text-xs text-red-500">
                                        RO Anda bulan ini{' '}
                                        {fmt(monthly.repeat_order.own_ro)} —
                                        kurang dari Rp 1.000.000
                                    </p>
                                )}
                            {monthly.global_sharing.percent === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Level karier Anda belum berhak atas bonus
                                    global sharing.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
