import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { bonuses as bonusesRoute } from '@/actions/App/Http/Controllers/Member/FinancialController';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface DailyBonus {
    id: number;
    bonus_type: string;
    amount: number;
    status: string;
    bonus_date: string;
}


interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    dailyBonuses: PaginatedData<DailyBonus> | [];
    dailyTotal: number;
    dailyFilteredTotal: number | null;
    filters: {
        tanggal?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Riwayat Bonus', href: bonusesRoute.definition.url },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAILY_BONUS_LABELS: Record<string, string> = {
    Sponsor: 'SPONSOR',
    PassUpSponsor: 'PASS UP SPONSOR',
    Pairing: 'PAIRING',
    Matching: 'MATCHING',
    Leveling: 'LEVELING',
};


const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; className: string }> = {
        Pending: { label: 'Pending', className: 'bg-green-100 text-green-700 border-green-200' },
        Approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border-green-200' },
        Rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-300' },
        Paid: { label: 'Dibayar', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    };
    const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
        <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${cfg.className}`}>
            {cfg.label}
        </span>
    );
};

function isPaginated<T>(value: PaginatedData<T> | []): value is PaginatedData<T> {
    return !Array.isArray(value);
}

function formatDateId(dateStr: string): string {
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
}


export default function BonusIndex({
    dailyBonuses,
    dailyTotal,
    dailyFilteredTotal,
    filters,
}: Props) {
    const [tanggal, setTanggal] = useState(filters.tanggal || '');

    const applyFilter = (key: string, value: string) => {
        router.get(bonusesRoute.url(), { tanggal, [key]: value }, { preserveState: true, replace: true });
    };

    const dailyColumns: ColumnDef<DailyBonus>[] = [
        {
            accessorKey: 'bonus_date',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.bonus_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                </span>
            ),
        },
        {
            accessorKey: 'bonus_type',
            header: 'Jenis Bonus',
            cell: ({ row }) => (
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {DAILY_BONUS_LABELS[row.original.bonus_type] ?? row.original.bonus_type}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => (
                <div className="font-bold text-slate-900">{fmt(row.original.amount)}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
    ];

    const dailyData = isPaginated(dailyBonuses) ? dailyBonuses.data : [];
    const dailySectionTitle = tanggal ? `Bonus Harian Tanggal: ${formatDateId(tanggal)}` : 'Bonus Harian';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Bonus" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">Riwayat Bonus</h1>
                    <p className="text-muted-foreground">Monitor semua bonus yang Anda dapatkan dari GrowRich</p>
                </div>

                {/* Summary Card */}
                <Card className="shadow-premium border-none">
                    <CardHeader className="pb-3">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider opacity-70 text-primary">
                            Akumulasi Bonus
                        </CardDescription>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            {fmt(dailyTotal)}
                        </CardTitle>
                    </CardHeader>
                </Card>

                {/* Daftar Bonus */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">{dailySectionTitle}</h2>
                            <p className="text-sm text-muted-foreground">Rekapitulasi Bonus Anda</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Cari Berdasarkan Tanggal:</span>
                            <Input
                                type="date"
                                className="bg-white w-[160px]"
                                value={tanggal}
                                onChange={(e) => {
                                    setTanggal(e.target.value);
                                    applyFilter('tanggal', e.target.value);
                                }}
                            />
                        </div>
                    </div>

                    <Card className="shadow-premium border-none">
                        <CardContent className="pt-6">
                            <DataTable
                                columns={dailyColumns}
                                data={dailyData}
                                emptyTitle="Belum ada bonus"
                                emptyDescription="Tidak ada bonus untuk periode yang dipilih."
                            />
                            {tanggal && dailyFilteredTotal !== null && dailyData.length > 0 && (
                                <div className="mt-0 border-t border-slate-100 px-4 py-3 flex justify-between items-center">
                                    <span className="font-bold text-slate-800">Total Bonus</span>
                                    <span className="font-bold text-slate-900">{fmt(dailyFilteredTotal)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {isPaginated(dailyBonuses) && dailyBonuses.last_page > 1 && (
                        <div className="flex items-center justify-end gap-3">
                            <span className="text-sm text-muted-foreground">
                                Halaman {dailyBonuses.current_page} dari {dailyBonuses.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-40"
                                    disabled={dailyBonuses.current_page === 1}
                                    onClick={() => dailyBonuses.links[0].url && router.get(dailyBonuses.links[0].url)}
                                >
                                    Sebelumnya
                                </button>
                                <button
                                    className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-40"
                                    disabled={dailyBonuses.current_page === dailyBonuses.last_page}
                                    onClick={() => {
                                        const last = dailyBonuses.links[dailyBonuses.links.length - 1];
                                        if (last.url) { router.get(last.url); }
                                    }}
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
