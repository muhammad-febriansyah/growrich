import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Search, TrendingUp, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Bonus {
    id: number;
    bonus_type: string;
    amount: number;
    status: string;
    member_profile: {
        user: { name: string; email: string };
    } | null;
}

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
    run: Run;
    bonuses: Bonus[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Daily Bonus Run', href: '/admin/daily-runs' },
    { title: 'Detail Run', href: '#' },
];

const fmt = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

const fmtDate = (iso: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
};

const runStatusConfig: Record<string, { label: string; className: string }> = {
    pending:   { label: 'Menunggu',  className: 'bg-amber-100 text-amber-700 border-amber-300' },
    running:   { label: 'Berjalan',  className: 'bg-blue-100 text-blue-700 border-blue-300' },
    completed: { label: 'Selesai',   className: 'bg-green-100 text-green-700 border-green-300' },
    failed:    { label: 'Gagal',     className: 'bg-red-100 text-red-700 border-red-300' },
};

const bonusTypeClass: Record<string, string> = {
    Pairing:  'bg-green-100 text-green-700 border-green-200',
    Matching: 'bg-sky-100 text-sky-700 border-sky-200',
    Leveling: 'bg-orange-100 text-orange-700 border-orange-200',
};

const bonusStatusConfig: Record<string, { label: string; className: string }> = {
    Pending:  { label: 'Menunggu',  className: 'bg-amber-100 text-amber-700 border-amber-200' },
    Approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border-green-200' },
    Rejected: { label: 'Ditolak',   className: 'bg-red-100 text-red-700 border-red-200' },
    Paid:     { label: 'Dibayar',   className: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const PER_PAGE = 20;

const columns: ColumnDef<Bonus>[] = [
    {
        id: 'member',
        header: 'Member',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-slate-900">
                    {row.original.member_profile?.user.name ?? '-'}
                </span>
                <span className="text-xs text-muted-foreground">
                    {row.original.member_profile?.user.email ?? ''}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'bonus_type',
        header: 'Jenis Bonus',
        cell: ({ row }) => {
            const cls = bonusTypeClass[row.original.bonus_type] ?? 'bg-gray-100 text-gray-700 border-gray-200';
            return (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cls}`}>
                    {row.original.bonus_type}
                </span>
            );
        },
    },
    {
        accessorKey: 'amount',
        header: 'Jumlah',
        cell: ({ row }) => (
            <span className="font-semibold text-slate-900">{fmt(row.original.amount)}</span>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const cfg = bonusStatusConfig[row.original.status] ?? { label: row.original.status, className: 'bg-gray-100 text-gray-700 border-gray-200' };
            return (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
                    {cfg.label}
                </span>
            );
        },
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <Link
                href={`/admin/bonuses/${row.original.id}`}
                className="text-xs font-medium text-primary hover:underline"
            >
                Lihat Detail
            </Link>
        ),
    },
];

export default function DailyRunShow({ run, bonuses }: Props) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const statusCfg = runStatusConfig[run.status] ?? { label: run.status, className: 'bg-gray-100 text-gray-700 border-gray-300' };

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return bonuses;
        return bonuses.filter((b) =>
            b.member_profile?.user.name.toLowerCase().includes(q) ||
            b.member_profile?.user.email.toLowerCase().includes(q) ||
            b.bonus_type.toLowerCase().includes(q),
        );
    }, [bonuses, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bonus Run #${run.id}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">

                {/* Header */}
                <div className="flex items-start gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/daily-runs')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">Bonus Run #{run.id}</h1>
                            <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.className}`}>
                                {statusCfg.label}
                            </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>
                                Tanggal run:{' '}
                                <strong className="text-slate-700">
                                    {new Date(run.run_date).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                </strong>
                            </span>
                            {run.started_at && (
                                <span>Dimulai: <strong className="text-slate-700">{fmtDate(run.started_at)}</strong></span>
                            )}
                            {run.completed_at && (
                                <span>Selesai: <strong className="text-slate-700">{fmtDate(run.completed_at)}</strong></span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Pairing', value: run.total_pairing_bonus, icon: <Zap className="h-5 w-5" />, color: 'from-green-500 to-green-700' },
                        { label: 'Total Matching', value: run.total_matching_bonus, icon: <TrendingUp className="h-5 w-5" />, color: 'from-sky-500 to-sky-700' },
                        { label: 'Total Leveling', value: run.total_leveling_bonus, icon: <CreditCard className="h-5 w-5" />, color: 'from-violet-500 to-violet-700' },
                    ].map((item) => (
                        <Card key={item.label} className={`bg-gradient-to-br ${item.color} text-white border-0 shadow-md`}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm opacity-80">{item.label}</p>
                                    <span className="opacity-60">{item.icon}</span>
                                </div>
                                <p className="text-2xl font-bold mt-2">{fmt(item.value)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bonuses DataTable */}
                <Card className="border-none shadow-sm ring-1 ring-slate-200">
                    <CardHeader className="border-b pb-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                Daftar Bonus yang Dihasilkan
                            </CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {filtered.length} dari {bonuses.length} bonus
                            </span>
                        </div>

                        {/* Search */}
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari nama, email, atau jenis bonus..."
                                className="bg-white pl-9"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </CardHeader>

                    <CardContent className="p-4">
                        <DataTable
                            columns={columns}
                            data={paginated}
                            emptyTitle="Tidak ada hasil"
                            emptyDescription={search ? 'Tidak ada bonus yang cocok dengan pencarian.' : 'Tidak ada bonus dalam run ini.'}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Halaman {currentPage} dari {totalPages}
                                    <span className="ml-2 text-xs">
                                        ({(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} dari {filtered.length})
                                    </span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        className="gap-1 bg-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        className="gap-1 bg-white"
                                    >
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
