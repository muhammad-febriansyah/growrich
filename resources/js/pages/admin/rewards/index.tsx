import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Gift, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Reward {
    id: number;
    status: string;
    qualified_at: string | null;
    fulfilled_at: string | null;
    member_profile: {
        user: { name: string; email: string };
        left_rp_total: number;
        right_rp_total: number;
    } | null;
    milestone: {
        name: string;
        reward_type: string;
        required_left_rp: number;
        required_right_rp: number;
        cash_value: number;
    } | null;
}

interface Props {
    rewards: { data: Reward[]; current_page: number; last_page: number };
    filters: { status?: string; search?: string };
    stats: { pending: number; fulfilled: number; rejected: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Reward', href: '/admin/rewards' },
];

const rewardIcons: Record<string, string> = {
    holy_trip: '✈️', cash: '💰', car: '🚗', property: '🏠',
};

export default function AdminRewardsIndex({ rewards, filters, stats }: Props) {
    const { data, setData, get } = useForm({ search: filters.search ?? '', status: filters.status ?? '' });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/rewards', { preserveState: true });
    };

    const fulfill = (id: number) => {
        if (confirm('Tandai reward ini sebagai terpenuhi?')) {
            router.post(`/admin/rewards/${id}/fulfill`);
        }
    };

    const reject = (id: number) => {
        if (confirm('Tolak reward ini?')) {
            router.post(`/admin/rewards/${id}/reject`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Reward" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Reward</h1>
                    <p className="text-sm text-muted-foreground">Kelola reward member yang telah memenuhi syarat RP.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Pending', value: stats.pending, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                        { label: 'Terpenuhi', value: stats.fulfilled, color: 'text-green-600 bg-green-50 border-green-200' },
                        { label: 'Ditolak', value: stats.rejected, color: 'text-red-600 bg-red-50 border-red-200' },
                    ].map((s) => (
                        <Card key={s.label} className={`border ${s.color}`}>
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-sm">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <form onSubmit={search} className="flex gap-2">
                    <Input
                        placeholder="Cari member..."
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="max-w-xs"
                    />
                    <select
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="fulfilled">Terpenuhi</option>
                        <option value="rejected">Ditolak</option>
                    </select>
                    <Button type="submit" variant="outline" size="sm">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>

                {/* Table */}
                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Member</th>
                                        <th className="px-4 py-3 text-left font-medium">Reward</th>
                                        <th className="px-4 py-3 text-left font-medium">RP Kiri / Kanan</th>
                                        <th className="px-4 py-3 text-left font-medium">Qualified</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rewards.data.map((reward) => (
                                        <tr key={reward.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{reward.member_profile?.user.name ?? '-'}</p>
                                                <p className="text-xs text-muted-foreground">{reward.member_profile?.user.email ?? ''}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="mr-1">{rewardIcons[reward.milestone?.reward_type ?? ''] ?? '🎁'}</span>
                                                {reward.milestone?.name ?? '-'}
                                                {reward.milestone?.cash_value ? (
                                                    <p className="text-xs text-muted-foreground">Rp {new Intl.NumberFormat('id-ID').format(reward.milestone.cash_value)}</p>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className="text-blue-600">{(reward.member_profile?.left_rp_total ?? 0).toLocaleString('id-ID')}</span>
                                                {' / '}
                                                <span className="text-green-600">{(reward.member_profile?.right_rp_total ?? 0).toLocaleString('id-ID')}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{reward.qualified_at ?? '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold ${reward.status === 'fulfilled' ? 'text-green-600' : reward.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {reward.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {reward.status === 'pending' && (
                                                    <div className="flex justify-center gap-1">
                                                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => fulfill(reward.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => reject(reward.id)}>
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {rewards.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                <Gift className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                Tidak ada reward ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
