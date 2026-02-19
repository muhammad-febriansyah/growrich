import { Head } from '@inertiajs/react';
import { Gift, CheckCircle, Star, Plane, Banknote, Car, Home, Lock, Trophy, ArrowLeftRight, ArrowRightLeft, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface RewardProgress {
    id: number;
    name: string;
    rewardType: string;
    cashValue: number;
    requiredLeftRp: number;
    requiredRightRp: number;
    currentLeftRp: number;
    currentRightRp: number;
    leftProgress: number;
    rightProgress: number;
    qualified: boolean;
    status: string | null;
    qualifiedAt: string | null;
    fulfilledAt: string | null;
}

interface Props {
    rewardProgress: RewardProgress[];
    leftRp: number;
    rightRp: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Progress Reward', href: '/member/rewards' },
];

const rewardConfig: Record<string, { icon: React.ElementType; gradient: string; iconBg: string; label: string }> = {
    holy_trip: {
        icon: Plane,
        gradient: 'from-sky-500 to-blue-600',
        iconBg: 'bg-sky-100 text-sky-600',
        label: 'Perjalanan Ibadah',
    },
    cash: {
        icon: Banknote,
        gradient: 'from-emerald-500 to-green-600',
        iconBg: 'bg-emerald-100 text-emerald-600',
        label: 'Uang Tunai',
    },
    car: {
        icon: Car,
        gradient: 'from-amber-500 to-orange-600',
        iconBg: 'bg-amber-100 text-amber-600',
        label: 'Kendaraan',
    },
    property: {
        icon: Home,
        gradient: 'from-violet-500 to-purple-600',
        iconBg: 'bg-violet-100 text-violet-600',
        label: 'Properti',
    },
};

const defaultConfig = {
    icon: Gift,
    gradient: 'from-primary to-primary/80',
    iconBg: 'bg-primary/10 text-primary',
    label: 'Reward',
};

function getConfig(type: string) {
    return rewardConfig[type] ?? defaultConfig;
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return null;
    const map: Record<string, { className: string; label: string }> = {
        pending: { className: 'bg-amber-100 text-amber-700 border-amber-300', label: 'Menunggu Pemenuhan' },
        fulfilled: { className: 'bg-green-100 text-green-700 border-green-300', label: 'Terpenuhi' },
        rejected: { className: 'bg-red-100 text-red-700 border-red-300', label: 'Ditolak' },
    };
    const cfg = map[status];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

function ProgressRing({ value, size = 56, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-100" />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={value >= 100 ? 'text-emerald-500' : 'text-primary'}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
        </svg>
    );
}

export default function RewardsPage({ rewardProgress, leftRp, rightRp }: Props) {
    const qualifiedCount = rewardProgress.filter((r) => r.qualified).length;
    const fulfilledCount = rewardProgress.filter((r) => r.status === 'fulfilled').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Progress Reward" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Progress Reward</h1>
                    <p className="text-sm text-muted-foreground">Pantau Reward Point dan capai milestone reward eksklusif Anda.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* RP Kiri */}
                    <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-primary to-brand-700 text-primary-foreground">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <ArrowLeftRight className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">RP Kiri</p>
                                <p className="text-2xl font-extrabold tabular-nums leading-tight">{leftRp.toLocaleString('id-ID')}</p>
                                <p className="text-[11px] opacity-60 mt-0.5">Reward Point</p>
                            </div>
                        </CardContent>
                        <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-10">
                            <ArrowLeftRight className="h-20 w-20" />
                        </div>
                    </Card>

                    {/* RP Kanan */}
                    <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-brand-600 to-brand-700 text-primary-foreground">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <ArrowRightLeft className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">RP Kanan</p>
                                <p className="text-2xl font-extrabold tabular-nums leading-tight">{rightRp.toLocaleString('id-ID')}</p>
                                <p className="text-[11px] opacity-60 mt-0.5">Reward Point</p>
                            </div>
                        </CardContent>
                        <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-10">
                            <ArrowRightLeft className="h-20 w-20" />
                        </div>
                    </Card>

                    {/* Qualified */}
                    <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-pink to-pink-700 text-pink-foreground">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <Star className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Qualified</p>
                                <p className="text-2xl font-extrabold tabular-nums leading-tight">
                                    {qualifiedCount}
                                    <span className="text-sm font-normal opacity-70"> / {rewardProgress.length}</span>
                                </p>
                                <p className="text-[11px] opacity-60 mt-0.5">Reward tercapai</p>
                            </div>
                        </CardContent>
                        <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-10">
                            <Star className="h-20 w-20" />
                        </div>
                    </Card>

                    {/* Terpenuhi */}
                    <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-pink-600 to-pink-700 text-pink-foreground">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <Medal className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Terpenuhi</p>
                                <p className="text-2xl font-extrabold tabular-nums leading-tight">
                                    {fulfilledCount}
                                    <span className="text-sm font-normal opacity-70"> / {rewardProgress.length}</span>
                                </p>
                                <p className="text-[11px] opacity-60 mt-0.5">Reward diterima</p>
                            </div>
                        </CardContent>
                        <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-10">
                            <Medal className="h-20 w-20" />
                        </div>
                    </Card>
                </div>

                {/* Reward Cards */}
                {rewardProgress.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Gift className="h-14 w-14 mb-4 opacity-25" />
                        <p className="text-base font-medium">Belum ada reward milestone</p>
                        <p className="text-sm opacity-70 mt-1">Hubungi admin untuk informasi lebih lanjut.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rewardProgress.map((reward) => {
                            const cfg = getConfig(reward.rewardType);
                            const Icon = cfg.icon;
                            const isFulfilled = reward.status === 'fulfilled';
                            const isQualified = reward.qualified;
                            const overallProgress = Math.min(100, Math.round((reward.leftProgress + reward.rightProgress) / 2));
                            const needsLeftRp = Math.max(0, reward.requiredLeftRp - reward.currentLeftRp);
                            const needsRightRp = Math.max(0, reward.requiredRightRp - reward.currentRightRp);

                            return (
                                <Card
                                    key={reward.id}
                                    className={`relative overflow-hidden shadow-sm transition-all border ${
                                        isFulfilled
                                            ? 'border-green-200 bg-green-50/50'
                                            : isQualified
                                                ? 'border-amber-200 bg-amber-50/50'
                                                : 'border-border'
                                    }`}
                                >
                                    {/* Top accent bar */}
                                    <div className={`h-1 w-full bg-gradient-to-r ${cfg.gradient}`} />

                                    <CardHeader className="pb-3 pt-4">
                                        <div className="flex items-start gap-3">
                                            {/* Ring + Icon */}
                                            <div className="relative shrink-0">
                                                <ProgressRing value={overallProgress} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className={`flex h-7 w-7 items-center justify-center rounded-full ${cfg.iconBg}`}>
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Name & value */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <CardTitle className="text-sm font-bold leading-snug">{reward.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{cfg.label}</p>
                                                        {reward.cashValue > 0 && (
                                                            <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                                                                Rp {new Intl.NumberFormat('id-ID').format(reward.cashValue)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        {isFulfilled && (
                                                            <Badge className="bg-green-500 text-white text-[10px] gap-1">
                                                                <CheckCircle className="h-3 w-3" /> Terpenuhi
                                                            </Badge>
                                                        )}
                                                        {isQualified && !isFulfilled && (
                                                            <Badge className="bg-amber-500 text-white text-[10px] gap-1">
                                                                <Star className="h-3 w-3" /> Qualified!
                                                            </Badge>
                                                        )}
                                                        {!isQualified && (
                                                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                                                <Lock className="h-3 w-3" /> {overallProgress}%
                                                            </span>
                                                        )}
                                                        <StatusBadge status={reward.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3 pt-0">
                                        {/* Left RP */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-medium">RP Kiri</span>
                                                <span className={`font-semibold tabular-nums ${reward.leftProgress >= 100 ? 'text-emerald-600' : 'text-foreground'}`}>
                                                    {reward.currentLeftRp.toLocaleString('id-ID')} / {reward.requiredLeftRp.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <Progress value={reward.leftProgress} className="h-1.5" />
                                            {needsLeftRp > 0 && (
                                                <p className="text-[11px] text-muted-foreground">
                                                    Kurang <span className="font-semibold text-foreground">{needsLeftRp.toLocaleString('id-ID')} RP</span> lagi
                                                </p>
                                            )}
                                        </div>

                                        {/* Right RP */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-medium">RP Kanan</span>
                                                <span className={`font-semibold tabular-nums ${reward.rightProgress >= 100 ? 'text-emerald-600' : 'text-foreground'}`}>
                                                    {reward.currentRightRp.toLocaleString('id-ID')} / {reward.requiredRightRp.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <Progress value={reward.rightProgress} className="h-1.5" />
                                            {needsRightRp > 0 && (
                                                <p className="text-[11px] text-muted-foreground">
                                                    Kurang <span className="font-semibold text-foreground">{needsRightRp.toLocaleString('id-ID')} RP</span> lagi
                                                </p>
                                            )}
                                        </div>

                                        {/* Dates */}
                                        {reward.qualifiedAt && (
                                            <div className="flex items-center gap-1.5 pt-1 border-t text-[11px] text-muted-foreground">
                                                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                                <span>
                                                    Qualified: <span className="font-medium text-foreground">{reward.qualifiedAt}</span>
                                                    {reward.fulfilledAt && (
                                                        <> · Terpenuhi: <span className="font-medium text-foreground">{reward.fulfilledAt}</span></>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Legend */}
                {rewardProgress.length > 0 && (
                    <Card className="bg-muted/50 border-dashed shadow-none">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Trophy className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kategori Reward</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(rewardConfig).map(([key, val]) => {
                                    const Icon = val.icon;
                                    return (
                                        <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <div className={`flex h-5 w-5 items-center justify-center rounded-md ${val.iconBg}`}>
                                                <Icon className="h-3 w-3" />
                                            </div>
                                            {val.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
