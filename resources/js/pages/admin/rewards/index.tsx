import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Gift, Search, Truck, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Reward {
    id: number;
    status: string;
    qualified_at: string | null;
    fulfilled_at: string | null;
    claimed_at: string | null;
    shipped_at: string | null;
    courier: string | null;
    tracking_number: string | null;
    shipping_notes: string | null;
    recipient_name: string | null;
    recipient_phone: string | null;
    recipient_address: string | null;
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

const statusBadge: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    claimed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    fulfilled: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

const statusLabel: Record<string, string> = {
    pending: 'Pending',
    claimed: 'Diklaim',
    shipped: 'Dikirim',
    fulfilled: 'Terpenuhi',
    rejected: 'Ditolak',
};

function ShipModal({ reward, onClose }: { reward: Reward; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        courier: '',
        tracking_number: '',
        shipping_notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/rewards/${reward.id}/ship`, {
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="mb-1 text-lg font-bold">Input Pengiriman</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                    Reward: <strong>{reward.milestone?.name}</strong> · {reward.member_profile?.user.name}
                </p>

                {reward.recipient_address && (
                    <div className="mb-4 rounded-xl bg-muted/50 p-3 text-sm">
                        <p className="font-medium">{reward.recipient_name}</p>
                        <p className="text-muted-foreground">{reward.recipient_phone}</p>
                        <p className="text-muted-foreground">{reward.recipient_address}</p>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-3">
                    <div className="space-y-1">
                        <Label htmlFor="courier">Kurir</Label>
                        <Input
                            id="courier"
                            value={data.courier}
                            onChange={(e) => setData('courier', e.target.value)}
                            placeholder="JNE, J&T, SiCepat, dll."
                        />
                        {errors.courier && <p className="text-xs text-destructive">{errors.courier}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="tracking_number">No. Resi</Label>
                        <Input
                            id="tracking_number"
                            value={data.tracking_number}
                            onChange={(e) => setData('tracking_number', e.target.value)}
                            placeholder="Nomor resi pengiriman"
                        />
                        {errors.tracking_number && <p className="text-xs text-destructive">{errors.tracking_number}</p>}
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="shipping_notes">Catatan (opsional)</Label>
                        <textarea
                            id="shipping_notes"
                            rows={2}
                            value={data.shipping_notes}
                            onChange={(e) => setData('shipping_notes', e.target.value)}
                            placeholder="Catatan tambahan..."
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button type="submit" disabled={processing} className="flex-1">
                            <Truck className="size-4" />
                            {processing ? 'Menyimpan...' : 'Simpan & Kirim'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminRewardsIndex({ rewards, filters, stats }: Props) {
    const { data, setData, get } = useForm({ search: filters.search ?? '', status: filters.status ?? '' });
    const [shipTarget, setShipTarget] = useState<Reward | null>(null);

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/rewards', { preserveState: true });
    };

    const fulfill = (id: number) => {
        if (confirm('Tandai reward ini sebagai terpenuhi/diterima?')) {
            router.post(`/admin/rewards/${id}/fulfill`);
        }
    };

    const reject = (id: number) => {
        if (confirm('Tolak reward ini?')) {
            router.post(`/admin/rewards/${id}/reject`);
        }
    };

    const totalPending = stats.pending;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Reward" />

            {shipTarget && <ShipModal reward={shipTarget} onClose={() => setShipTarget(null)} />}

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Reward</h1>
                    <p className="text-sm text-muted-foreground">Kelola klaim & pengiriman reward member.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Pending', value: stats.pending, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                        { label: 'Terpenuhi', value: stats.fulfilled, color: 'text-green-600 bg-green-50 border-green-200' },
                        { label: 'Ditolak', value: stats.rejected, color: 'text-red-600 bg-red-50 border-red-200' },
                        { label: 'Total', value: stats.pending + stats.fulfilled + stats.rejected, color: 'text-slate-600 bg-slate-50 border-slate-200' },
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
                <form onSubmit={search} className="flex flex-wrap gap-2">
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
                        <option value="claimed">Diklaim</option>
                        <option value="shipped">Dikirim</option>
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
                                        <th className="px-4 py-3 text-left font-medium">Alamat Klaim</th>
                                        <th className="px-4 py-3 text-left font-medium">Pengiriman</th>
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
                                                <p className="text-xs text-muted-foreground">
                                                    RP: <span className="text-blue-600">{(reward.member_profile?.left_rp_total ?? 0).toLocaleString('id-ID')}</span>
                                                    {' / '}
                                                    <span className="text-green-600">{(reward.member_profile?.right_rp_total ?? 0).toLocaleString('id-ID')}</span>
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="mr-1">{rewardIcons[reward.milestone?.reward_type ?? ''] ?? '🎁'}</span>
                                                <span className="font-medium">{reward.milestone?.name ?? '-'}</span>
                                                {reward.milestone?.cash_value ? (
                                                    <p className="text-xs text-muted-foreground">Rp {new Intl.NumberFormat('id-ID').format(reward.milestone.cash_value)}</p>
                                                ) : null}
                                                {reward.qualified_at && (
                                                    <p className="text-xs text-muted-foreground">Qualified: {reward.qualified_at}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {reward.recipient_name ? (
                                                    <div>
                                                        <p className="font-medium">{reward.recipient_name}</p>
                                                        <p className="text-muted-foreground">{reward.recipient_phone}</p>
                                                        <p className="max-w-[160px] text-muted-foreground">{reward.recipient_address}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/50">Belum diklaim</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {reward.tracking_number ? (
                                                    <div>
                                                        <p className="font-semibold">{reward.courier}</p>
                                                        <p className="font-mono text-muted-foreground">{reward.tracking_number}</p>
                                                        {reward.shipping_notes && (
                                                            <p className="text-muted-foreground">{reward.shipping_notes}</p>
                                                        )}
                                                        {reward.shipped_at && (
                                                            <p className="text-muted-foreground">Dikirim: {reward.shipped_at}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/50">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadge[reward.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {statusLabel[reward.status] ?? reward.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col items-center gap-1">
                                                    {(reward.status === 'pending' || reward.status === 'claimed') && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                                                            onClick={() => setShipTarget(reward)}
                                                        >
                                                            <Truck className="h-3.5 w-3.5" /> Kirim
                                                        </Button>
                                                    )}
                                                    {reward.status === 'shipped' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full gap-1 text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => fulfill(reward.id)}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5" /> Terima
                                                        </Button>
                                                    )}
                                                    {reward.status === 'pending' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => reject(reward.id)}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" /> Tolak
                                                        </Button>
                                                    )}
                                                </div>
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

                {/* Pagination */}
                {rewards.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {rewards.current_page > 1 && (
                            <Button variant="outline" size="sm" onClick={() => router.get('/admin/rewards', { ...filters, page: rewards.current_page - 1 })}>
                                Sebelumnya
                            </Button>
                        )}
                        <span className="flex items-center px-3 text-sm text-muted-foreground">
                            {rewards.current_page} / {rewards.last_page}
                        </span>
                        {rewards.current_page < rewards.last_page && (
                            <Button variant="outline" size="sm" onClick={() => router.get('/admin/rewards', { ...filters, page: rewards.current_page + 1 })}>
                                Selanjutnya
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
