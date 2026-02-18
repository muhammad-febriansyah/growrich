import { Head, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Award,
    CheckCircle2,
    ChevronRight,
    Clock,
    GitFork,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Trophy,
    Wallet,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard().url }];

// ── Types ────────────────────────────────────────────────────────────────────
type BonusItem = {
    id: number;
    type: string;
    amount: number;
    status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
    date: string;
};

type DashboardProps = {
    stats: {
        walletBalance: number;
        totalBonusThisMonth: number;
        totalDownline: number;
        leftPp: number;
        rightPp: number;
        leftRp: number;
        rightRp: number;
        careerLevel: string;
        packageType: string;
        nextLevelLabel: string | null;
        nextLevelPp: number;
    };
    recentBonuses: BonusItem[];
    rewardProgress: {
        name: string;
        requiredLeftRp: number;
        requiredRightRp: number;
        currentLeftRp: number;
        currentRightRp: number;
    } | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function formatNumber(n: number): string {
    return new Intl.NumberFormat('id-ID').format(n);
}

const statusConfig: Record<BonusItem['status'], { label: string; color: string; icon: React.ElementType }> = {
    Pending: { label: 'Menunggu', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
    Approved: { label: 'Disetujui', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: CheckCircle2 },
    Paid: { label: 'Dibayar', color: 'text-brand bg-brand-50 border-brand-200', icon: CheckCircle2 },
    Rejected: { label: 'Ditolak', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

const bonusTypeLabel: Record<string, string> = {
    Sponsor: 'Sponsor',
    Pairing: 'Pairing',
    Matching: 'Matching',
    Leveling: 'Leveling',
    RepeatOrder: 'Repeat Order',
    GlobalSharing: 'Global Sharing',
};


// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
    label,
    value,
    sub,
    icon: Icon,
    trend,
    gradient,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    gradient: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10 ${gradient}`} />
            <div className="flex items-start justify-between">
                <div className={`rounded-xl p-2.5 ${gradient}`}>
                    <Icon className="size-5 text-white" />
                </div>
                {trend && (
                    <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${trend === 'up' ? 'text-brand' : 'text-red-500'}`}
                    >
                        {trend === 'up' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
                {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

function PpBar({ label, current, max }: { label: string; current: number; max: number }) {
    const pct = Math.min((current / max) * 100, 100);
    return (
        <div>
            <div className="mb-1.5 flex justify-between text-xs font-medium text-gray-600">
                <span>Kaki {label}</span>
                <span>{formatNumber(current)} PP</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard({ stats, recentBonuses, rewardProgress }: DashboardProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return 'Selamat Pagi';
        if (h < 17) return 'Selamat Siang';
        return 'Selamat Malam';
    })();

    const smallerLegPp = Math.min(stats.leftPp, stats.rightPp);
    const levelPct = stats.nextLevelPp > 0
        ? Math.min((smallerLegPp / stats.nextLevelPp) * 100, 100)
        : 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* ── Welcome Banner ───────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand to-brand-600 px-6 py-6 text-white shadow-lg md:px-8 md:py-7">
                    {/* decorative circles */}
                    <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 right-20 size-32 rounded-full bg-white/5" />
                    <div className="absolute bottom-4 right-6 size-4 rounded-full bg-pink/70" />
                    <div className="absolute right-10 top-4 size-2 rounded-full bg-pink" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-white/70">{greeting},</p>
                            <h1 className="mt-0.5 text-2xl font-bold md:text-3xl">{user.name}</h1>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                    {stats.packageType} Member
                                </span>
                                <span className="rounded-full bg-pink/80 px-3 py-1 text-xs font-semibold">
                                    {stats.careerLevel}
                                </span>
                                {user.referral_code && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs">
                                        Ref: {user.referral_code}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                            <p className="text-xs text-white/60">Total Downline</p>
                            <p className="text-4xl font-extrabold sm:text-5xl">{stats.totalDownline}</p>
                            <p className="text-xs text-white/60">member aktif</p>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <StatCard
                        label="Saldo Wallet"
                        value={formatRupiah(stats.walletBalance)}
                        sub="E-Wallet aktif"
                        icon={Wallet}
                        trend="up"
                        gradient="bg-brand"
                    />
                    <StatCard
                        label="Bonus Bulan Ini"
                        value={formatRupiah(stats.totalBonusThisMonth)}
                        sub="Semua tipe bonus"
                        icon={TrendingUp}
                        trend="up"
                        gradient="bg-pink"
                    />
                    <StatCard
                        label="PP Kaki Kiri"
                        value={formatNumber(stats.leftPp)}
                        sub={`${formatNumber(stats.leftRp)} RP`}
                        icon={GitFork}
                        gradient="bg-brand-600"
                    />
                    <StatCard
                        label="PP Kaki Kanan"
                        value={formatNumber(stats.rightPp)}
                        sub={`${formatNumber(stats.rightRp)} RP`}
                        icon={GitFork}
                        gradient="bg-pink-600"
                    />
                </div>

                {/* ── Main Grid ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">

                    {/* ── Recent Bonuses (2/3 width) ───────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <Award className="size-4 text-brand" />
                                    <h2 className="font-semibold text-gray-800">Bonus Terbaru</h2>
                                </div>
                                <a
                                    href="/member/bonuses"
                                    className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-600"
                                >
                                    Lihat semua <ArrowRight className="size-3" />
                                </a>
                            </div>

                            <div className="divide-y">
                                {recentBonuses.map((bonus) => {
                                    const cfg = statusConfig[bonus.status];
                                    const StatusIcon = cfg.icon;
                                    return (
                                        <div key={bonus.id} className="flex items-center gap-3 px-5 py-3.5">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                                                <Sparkles className="size-4 text-brand" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-800">
                                                    {bonusTypeLabel[bonus.type] ?? bonus.type}
                                                </p>
                                                <p className="text-xs text-gray-400">{bonus.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatRupiah(bonus.amount)}
                                                </p>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                                                >
                                                    <StatusIcon className="size-3" />
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column ─────────────────────────────────────── */}
                    <div className="flex flex-col gap-4">

                        {/* Career Level Progress */}
                        <div className="rounded-2xl border bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Trophy className="size-4 text-pink" />
                                <h2 className="font-semibold text-gray-800">Career Level</h2>
                            </div>

                            <div className="mb-3 flex items-center justify-between">
                                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand">
                                    {stats.careerLevel}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatNumber(smallerLegPp)} / {formatNumber(stats.nextLevelPp)} PP
                                </span>
                            </div>

                            <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-brand to-pink transition-all duration-700"
                                    style={{ width: `${levelPct}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-right text-xs text-gray-400">
                                {stats.nextLevelLabel ? `Menuju ${stats.nextLevelLabel}` : 'Level Tertinggi'}
                            </p>

                            <div className="mt-4 space-y-3 border-t pt-4">
                                <PpBar label="Kiri" current={stats.leftPp} max={stats.nextLevelPp} />
                                <PpBar label="Kanan" current={stats.rightPp} max={stats.nextLevelPp} />
                            </div>
                        </div>

                        {/* Next Reward Progress */}
                        {rewardProgress && (
                            <div className="rounded-2xl border bg-gradient-to-br from-pink-50 to-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-2">
                                    <Award className="size-4 text-pink" />
                                    <h2 className="text-sm font-semibold text-gray-800">Reward Berikutnya</h2>
                                </div>
                                <p className="mb-3 text-xs font-medium text-gray-700">{rewardProgress.name}</p>

                                {(['left', 'right'] as const).map((leg) => {
                                    const current =
                                        leg === 'left' ? rewardProgress.currentLeftRp : rewardProgress.currentRightRp;
                                    const required =
                                        leg === 'left'
                                            ? rewardProgress.requiredLeftRp
                                            : rewardProgress.requiredRightRp;
                                    const pct = Math.min((current / required) * 100, 100);
                                    return (
                                        <div key={leg} className="mb-2.5">
                                            <div className="mb-1 flex justify-between text-xs text-gray-500">
                                                <span>Kaki {leg === 'left' ? 'Kiri' : 'Kanan'}</span>
                                                <span>
                                                    {formatNumber(current)} / {formatNumber(required)} RP
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-pink-100">
                                                <div
                                                    className="h-full rounded-full bg-pink transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                <a
                                    href="/member/rewards"
                                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-pink-200 py-2 text-xs font-semibold text-pink transition-colors hover:bg-pink-50"
                                >
                                    Lihat semua reward <ChevronRight className="size-3.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Quick Actions ────────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'Repeat Order', sub: 'Min Rp 1 Juta', icon: ShoppingCart, href: '/member/ro', color: 'bg-brand-50 text-brand border-brand-200' },
                        { label: 'Tarik Dana', sub: 'Saldo e-wallet', icon: Wallet, href: '/member/wallet', color: 'bg-pink-50 text-pink border-pink-200' },
                        { label: 'Jaringan Saya', sub: 'Lihat binary tree', icon: GitFork, href: '/member/network', color: 'bg-brand-50 text-brand border-brand-200' },
                        { label: 'Riwayat Bonus', sub: 'Semua tipe', icon: Award, href: '/member/bonuses', color: 'bg-pink-50 text-pink border-pink-200' },
                    ].map((action) => (
                        <a
                            key={action.label}
                            href={action.href}
                            className={`flex items-center gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${action.color}`}
                        >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/60">
                                <action.icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold leading-tight">{action.label}</p>
                                <p className="mt-0.5 truncate text-xs opacity-70">{action.sub}</p>
                            </div>
                        </a>
                    ))}
                </div>

            </div>
        </AppLayout>
    );
}
