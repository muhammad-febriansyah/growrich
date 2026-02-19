import { Head, useForm, router } from '@inertiajs/react';
import { Play, Eye, Calendar, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Run {
    id: number;
    run_date: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    total_pairing_bonus: number;
    total_matching_bonus: number;
    total_leveling_bonus: number;
}

interface Props {
    runs: {
        data: Run[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daily Bonus Run', href: '/admin/daily-runs' },
];

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        completed: 'bg-green-100 text-green-700',
        running: 'bg-blue-100 text-blue-700',
        failed: 'bg-red-100 text-red-700',
    };
    const icons: Record<string, React.ReactNode> = {
        completed: <CheckCircle className="h-3 w-3" />,
        running: <RefreshCw className="h-3 w-3 animate-spin" />,
        failed: <XCircle className="h-3 w-3" />,
    };
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {icons[status]} {status}
        </span>
    );
}

export default function DailyRunsIndex({ runs }: Props) {
    const { data, setData, post, processing } = useForm({
        date: new Date().toISOString().split('T')[0],
    });

    const { data: monthData, setData: setMonthData, post: postMonthly, processing: processingMonthly } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const triggerDaily = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/daily-runs/trigger');
    };

    const triggerMonthly = (e: React.FormEvent) => {
        e.preventDefault();
        postMonthly('/admin/daily-runs/trigger-monthly');
    };

    const fmt = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daily Bonus Run" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Manajemen Daily Bonus Run</h1>
                    <p className="text-sm text-muted-foreground">Jalankan dan pantau proses kalkulasi bonus harian.</p>
                </div>

                {/* Trigger Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Play className="h-4 w-4 text-primary" />
                                Jalankan Bonus Harian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={triggerDaily} className="flex gap-2">
                                <input
                                    type="date"
                                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                <Button type="submit" disabled={processing} size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    Jalankan
                                </Button>
                            </form>
                            <p className="text-xs text-muted-foreground mt-2">Menghitung Pairing, Matching, Leveling Bonus + upgrade karir + reward trigger.</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="h-4 w-4 text-primary" />
                                Jalankan Bonus Bulanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={triggerMonthly} className="flex gap-2">
                                <select
                                    className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={monthData.month}
                                    onChange={(e) => setMonthData('month', parseInt(e.target.value))}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={monthData.year}
                                    onChange={(e) => setMonthData('year', parseInt(e.target.value))}
                                />
                                <Button type="submit" disabled={processingMonthly} size="sm">
                                    <Play className="h-4 w-4 mr-1" />
                                    Jalankan
                                </Button>
                            </form>
                            <p className="text-xs text-muted-foreground mt-2">Menghitung Repeat Order Bonus dan Global Sharing Bonus.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Runs Table */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Riwayat Bonus Run</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Pairing</th>
                                        <th className="px-4 py-3 text-right font-medium">Matching</th>
                                        <th className="px-4 py-3 text-right font-medium">Leveling</th>
                                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {runs.data.map((run) => (
                                        <tr key={run.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">
                                                {new Date(run.run_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                                            <td className="px-4 py-3 text-right text-green-700">{fmt(run.total_pairing_bonus)}</td>
                                            <td className="px-4 py-3 text-right text-blue-700">{fmt(run.total_matching_bonus)}</td>
                                            <td className="px-4 py-3 text-right text-purple-700">{fmt(run.total_leveling_bonus)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <Button variant="ghost" size="sm" onClick={() => router.visit(`/admin/daily-runs/${run.id}`)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {runs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada bonus run.
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
