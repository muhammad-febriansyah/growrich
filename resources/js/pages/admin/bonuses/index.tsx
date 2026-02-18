import { Head, Link, router } from '@inertiajs/react';
import { approve, reject } from '@/actions/App/Http/Controllers/Admin/BonusController';
import { show } from '@/actions/App/Http/Controllers/Admin/BonusController';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeCheck, Eye, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Bonus {
    id: number;
    bonus_type: string;
    amount: number;
    status: string;
    bonus_date: string;
    member_profile?: {
        user?: {
            name: string;
            referral_code: string;
        };
    };
    created_at: string;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    total_amount: number;
}

interface Props {
    bonuses: {
        data: Bonus[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        status?: string;
        type?: string;
        search?: string;
    };
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Bonus', href: '/admin/bonuses' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; className: string }> = {
        Pending:  { label: 'Pending',   className: 'bg-amber-100 text-amber-700 border-amber-300' },
        Approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border-green-300' },
        Rejected: { label: 'Ditolak',   className: 'bg-red-100 text-red-700 border-red-300' },
        Paid:     { label: 'Dibayar',   className: 'bg-blue-100 text-blue-700 border-blue-300' },
    };
    const cfg = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-700 border-gray-300' };
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
};

const BonusTypeBadge = ({ type }: { type: string }) => {
    const map: Record<string, string> = {
        Sponsor:       'bg-violet-100 text-violet-700 border-violet-300',
        Pairing:       'bg-brand-50 text-brand border-brand/30',
        Matching:      'bg-sky-100 text-sky-700 border-sky-300',
        Leveling:      'bg-orange-100 text-orange-700 border-orange-300',
        RepeatOrder:   'bg-teal-100 text-teal-700 border-teal-300',
        GlobalSharing: 'bg-pink-100 text-pink-700 border-pink-300',
    };
    const cls = map[type] ?? 'bg-gray-100 text-gray-700 border-gray-300';
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
            {type}
        </span>
    );
};

export default function BonusIndex({ bonuses, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleApprove = (bonus: Bonus) => {
        if (confirm(`Setujui bonus ${bonus.bonus_type} sebesar ${fmt(bonus.amount)} untuk ${bonus.member_profile?.user?.name}?`)) {
            router.post(approve(bonus.id).url);
        }
    };

    const handleReject = (bonus: Bonus) => {
        if (confirm(`Tolak bonus ${bonus.bonus_type} sebesar ${fmt(bonus.amount)} untuk ${bonus.member_profile?.user?.name}?`)) {
            router.post(reject(bonus.id).url);
        }
    };

    const columns: ColumnDef<Bonus>[] = [
        {
            accessorKey: 'bonus_date',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.bonus_date || row.original.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </span>
            ),
        },
        {
            id: 'member',
            header: 'Member',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.original.member_profile?.user?.name ?? '-'}</span>
                    <span className="font-mono text-xs text-muted-foreground">{row.original.member_profile?.user?.referral_code}</span>
                </div>
            ),
        },
        {
            accessorKey: 'bonus_type',
            header: 'Jenis',
            cell: ({ row }) => <BonusTypeBadge type={row.original.bonus_type} />,
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
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                        <Link href={show(row.original.id).url}>
                            <Eye className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                    {row.original.status === 'Pending' && (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 border-green-300 bg-green-50 px-2 text-green-700 hover:bg-green-100 hover:text-green-800"
                                onClick={() => handleApprove(row.original)}
                            >
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Setujui
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 border-red-300 bg-red-50 px-2 text-red-700 hover:bg-red-100 hover:text-red-800"
                                onClick={() => handleReject(row.original)}
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Tolak
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') {
            delete newFilters[key as keyof typeof filters];
        }
        router.get('/admin/bonuses', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Bonus" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Manajemen Bonus</h1>
                        <p className="text-sm text-muted-foreground">Tinjau dan setujui bonus member yang dihasilkan sistem.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border bg-amber-50 p-4">
                        <p className="text-xs text-amber-600">Pending</p>
                        <p className="mt-1 text-2xl font-bold text-amber-700">{stats.pending}</p>
                    </div>
                    <div className="rounded-xl border bg-green-50 p-4">
                        <p className="text-xs text-green-600">Disetujui</p>
                        <p className="mt-1 text-2xl font-bold text-green-700">{stats.approved}</p>
                    </div>
                    <div className="rounded-xl border bg-red-50 p-4">
                        <p className="text-xs text-red-600">Ditolak</p>
                        <p className="mt-1 text-2xl font-bold text-red-700">{stats.rejected}</p>
                    </div>
                    <div className="rounded-xl border bg-brand-50 p-4">
                        <p className="text-xs text-brand/70">Total Dibayar</p>
                        <p className="mt-1 text-lg font-bold text-brand">{fmt(stats.total_amount)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama, email, atau kode referral..."
                            className="bg-white pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="flex flex-wrap gap-2">
                        <Select
                            defaultValue={filters.status || 'all'}
                            onValueChange={(v) => handleFilterChange('status', v)}
                        >
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Disetujui</SelectItem>
                                <SelectItem value="Rejected">Ditolak</SelectItem>
                                <SelectItem value="Paid">Dibayar</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            defaultValue={filters.type || 'all'}
                            onValueChange={(v) => handleFilterChange('type', v)}
                        >
                            <SelectTrigger className="w-[170px] bg-white">
                                <SelectValue placeholder="Jenis Bonus" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                <SelectItem value="Sponsor">Sponsor</SelectItem>
                                <SelectItem value="Pairing">Pairing</SelectItem>
                                <SelectItem value="Matching">Matching</SelectItem>
                                <SelectItem value="Leveling">Leveling</SelectItem>
                                <SelectItem value="RepeatOrder">Repeat Order</SelectItem>
                                <SelectItem value="GlobalSharing">Global Sharing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={bonuses.data}
                    emptyTitle="Belum ada bonus"
                    emptyDescription="Bonus akan muncul di sini setelah sistem menjalankan kalkulasi harian atau bulanan."
                />

                {bonuses.last_page > 1 && (
                    <div className="flex items-center justify-end gap-3">
                        <span className="text-sm text-muted-foreground">
                            Halaman {bonuses.current_page} dari {bonuses.last_page}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={bonuses.current_page === 1}
                                onClick={() => router.get(bonuses.links[0].url)}
                                className="bg-white"
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={bonuses.current_page === bonuses.last_page}
                                onClick={() => router.get(bonuses.links[bonuses.links.length - 1].url)}
                                className="bg-white"
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
