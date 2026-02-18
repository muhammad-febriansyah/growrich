import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    BadgeCheck,
    Banknote,
    Key,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Stats {
    total_members: number;
    active_members: number;
    new_members_30d: number;
    pending_bonuses: number;
    total_bonus_approved: number;
    pending_withdrawals: number;
    pending_withdrawal_amount: number;
    available_pins: number;
    total_ro: number;
}

interface BonusType {
    type: string;
    total: number;
    count: number;
}

interface MemberGrowth {
    month: string;
    count: number;
}

interface RecentMember {
    id: number;
    name: string;
    referral_code: string;
    package_type: string | null;
    joined_at: string;
}

interface RecentWithdrawal {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    user_name: string | null;
}

interface Props {
    stats: Stats;
    bonusByType: BonusType[];
    memberGrowth: MemberGrowth[];
    recentMembers: RecentMember[];
    recentWithdrawals: RecentWithdrawal[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const PackageBadge = ({ type }: { type: string | null }) => {
    const map: Record<string, string> = {
        Silver:   'bg-slate-100 text-slate-700 border-slate-300',
        Gold:     'bg-amber-100 text-amber-700 border-amber-300',
        Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
    };
    const cls = map[type ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-300';
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
            {type ?? '-'}
        </span>
    );
};

const bonusTypeColor: Record<string, string> = {
    Sponsor:       'bg-violet-500',
    Pairing:       'bg-brand',
    Matching:      'bg-sky-500',
    Leveling:      'bg-orange-500',
    RepeatOrder:   'bg-teal-500',
    GlobalSharing: 'bg-pink-500',
};

export default function AdminDashboard({ stats, bonusByType, memberGrowth, recentMembers, recentWithdrawals }: Props) {
    const totalBonus = bonusByType.reduce((s, b) => s + b.total, 0);
    const maxGrowth = Math.max(...memberGrowth.map((m) => m.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Ringkasan performa sistem GrowRich.</p>
                </div>

                {/* Alert: items needing attention */}
                {(stats.pending_bonuses > 0 || stats.pending_withdrawals > 0) && (
                    <div className="flex flex-wrap gap-3">
                        {stats.pending_bonuses > 0 && (
                            <Link href="/admin/bonuses?status=Pending">
                                <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100">
                                    <AlertCircle className="h-4 w-4" />
                                    {stats.pending_bonuses} bonus menunggu persetujuan
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                            </Link>
                        )}
                        {stats.pending_withdrawals > 0 && (
                            <Link href="/admin/withdrawals?status=pending">
                                <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100">
                                    <AlertCircle className="h-4 w-4" />
                                    {stats.pending_withdrawals} penarikan menunggu ({fmt(stats.pending_withdrawal_amount)})
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </div>
                            </Link>
                        )}
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Member</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total_members}</p>
                                    <p className="mt-0.5 text-xs text-green-600">+{stats.new_members_30d} bulan ini</p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50">
                                    <Users className="size-4 text-brand" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Member Aktif</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.active_members}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">dari {stats.total_members} total</p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-green-50">
                                    <BadgeCheck className="size-4 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Bonus Dibayar</p>
                                    <p className="mt-1 text-lg font-bold text-gray-900">{fmt(stats.total_bonus_approved)}</p>
                                    <p className="mt-0.5 text-xs text-amber-600">{stats.pending_bonuses} pending</p>
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
                                    <p className="text-xs text-muted-foreground">PIN Tersedia</p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.available_pins}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{stats.total_ro} repeat order</p>
                                </div>
                                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50">
                                    <Key className="size-4 text-violet-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Bonus by type */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Distribusi Bonus</CardTitle>
                            <Link href="/admin/bonuses">
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                                    Lihat semua <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {bonusByType.map((b) => {
                                const pct = totalBonus > 0 ? Math.round((b.total / totalBonus) * 100) : 0;
                                const barColor = bonusTypeColor[b.type] ?? 'bg-gray-400';
                                return (
                                    <div key={b.type}>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${barColor}`} />
                                                <span className="font-medium text-gray-700">{b.type}</span>
                                                <span className="text-xs text-muted-foreground">({b.count}x)</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900">{fmt(b.total)}</span>
                                                <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
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
                            })}
                            {bonusByType.length === 0 && (
                                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data bonus.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Penarikan pending */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Penarikan Pending</CardTitle>
                            <Link href="/admin/withdrawals?status=pending">
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                                    Lihat semua <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {recentWithdrawals.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <Banknote className="size-8 text-gray-200" />
                                    <p className="text-sm text-muted-foreground">Tidak ada penarikan pending.</p>
                                </div>
                            ) : (
                                recentWithdrawals.map((w) => (
                                    <Link key={w.id} href={`/admin/withdrawals/${w.id}`}>
                                        <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{w.user_name}</p>
                                                <p className="text-xs text-muted-foreground">{w.bank_name} · {w.account_number}</p>
                                            </div>
                                            <span className="text-sm font-bold text-red-600">{fmt(w.amount)}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Grafik pertumbuhan member */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Pertumbuhan Member</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {memberGrowth.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data.</p>
                            ) : (
                                <div className="flex items-end gap-1.5" style={{ height: '120px' }}>
                                    {memberGrowth.map((m) => {
                                        const heightPct = Math.round((m.count / maxGrowth) * 100);
                                        const label = m.month.slice(5); // MM
                                        return (
                                            <div key={m.month} className="group relative flex flex-1 flex-col items-center gap-1">
                                                {/* Tooltip */}
                                                <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-gray-800 px-2 py-1 text-[10px] text-white group-hover:block">
                                                    {m.month}: {m.count} member
                                                </div>
                                                <div
                                                    className="w-full rounded-t-md bg-brand transition-all"
                                                    style={{ height: `${heightPct}%`, minHeight: '4px' }}
                                                />
                                                <span className="text-[10px] text-muted-foreground">{label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Member terbaru */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base">Member Terbaru</CardTitle>
                            <Link href="/admin/members">
                                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                                    Lihat semua <ArrowRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {recentMembers.map((m) => (
                                <Link key={m.id} href={`/admin/members/${m.id}`}>
                                    <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{m.name}</p>
                                            <p className="font-mono text-xs text-muted-foreground">{m.referral_code}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <PackageBadge type={m.package_type} />
                                            <span className="text-[10px] text-muted-foreground">{m.joined_at}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentMembers.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <Users className="size-8 text-gray-200" />
                                    <p className="text-sm text-muted-foreground">Belum ada member.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                        { href: '/admin/members', icon: Users, label: 'Kelola Member', color: 'bg-brand-50 text-brand' },
                        { href: '/admin/bonuses?status=Pending', icon: TrendingUp, label: 'Bonus Pending', color: 'bg-amber-50 text-amber-600' },
                        { href: '/admin/pins', icon: Key, label: 'Registration PIN', color: 'bg-violet-50 text-violet-600' },
                        { href: '/admin/products', icon: ShoppingBag, label: 'Produk', color: 'bg-teal-50 text-teal-600' },
                    ].map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className="flex items-center gap-3 rounded-xl border bg-white p-4 transition-colors hover:bg-gray-50">
                                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                                    <item.icon className="size-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
