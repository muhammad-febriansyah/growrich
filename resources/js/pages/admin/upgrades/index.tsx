import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface UpgradeRequest {
    id: number;
    current_package: string;
    requested_package: string;
    pin_code: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    reviewed_at: string | null;
    member_profile: {
        user: { name: string; email: string };
    } | null;
    reviewer: { name: string } | null;
}

interface Props {
    requests: { data: UpgradeRequest[]; current_page: number; last_page: number };
    filters: { status?: string; search?: string };
    stats: { pending: number; approved: number; rejected: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Approve Upgrade Paket', href: '/admin/upgrades' },
];

const pkgColors: Record<string, string> = {
    Silver: 'bg-slate-100 text-slate-700',
    Gold: 'bg-amber-100 text-amber-700',
    Platinum: 'bg-violet-100 text-violet-700',
};

export default function AdminUpgradesIndex({ requests, filters, stats }: Props) {
    const { data, setData, get } = useForm({ search: filters.search ?? '', status: filters.status ?? '' });

    const search = (e: React.FormEvent) => {
        e.preventDefault();
        get('/admin/upgrades', { preserveState: true });
    };

    const approve = (id: number) => {
        if (confirm('Setujui permintaan upgrade paket ini?')) {
            router.post(`/admin/upgrades/${id}/approve`);
        }
    };

    const reject = (id: number) => {
        if (confirm('Tolak permintaan upgrade paket ini?')) {
            router.post(`/admin/upgrades/${id}/reject`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Approve Upgrade Paket" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Approve Upgrade Paket</h1>
                    <p className="text-sm text-muted-foreground">Kelola permintaan upgrade paket dari member.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Pending', value: stats.pending, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                        { label: 'Disetujui', value: stats.approved, color: 'text-green-600 bg-green-50 border-green-200' },
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
                        <option value="approved">Disetujui</option>
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
                                        <th className="px-4 py-3 text-left font-medium">Upgrade</th>
                                        <th className="px-4 py-3 text-left font-medium">PIN</th>
                                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{req.member_profile?.user.name ?? '-'}</p>
                                                <p className="text-xs text-muted-foreground">{req.member_profile?.user.email ?? ''}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pkgColors[req.current_package] ?? ''}`}>
                                                        {req.current_package}
                                                    </span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pkgColors[req.requested_package] ?? ''}`}>
                                                        {req.requested_package}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{req.pin_code ?? '-'}</td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">{req.created_at}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-semibold ${req.status === 'approved' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {req.status}
                                                </span>
                                                {req.reviewer && (
                                                    <p className="text-xs text-muted-foreground">oleh {req.reviewer.name}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {req.status === 'pending' && (
                                                    <div className="flex justify-center gap-1">
                                                        <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => approve(req.id)}>
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => reject(req.id)}>
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                                Tidak ada permintaan upgrade.
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
