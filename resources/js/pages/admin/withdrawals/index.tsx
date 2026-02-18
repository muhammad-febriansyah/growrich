import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Eye, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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

interface Withdrawal {
    id: number;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
        referral_code: string;
    };
}

interface Props {
    withdrawals: {
        data: Withdrawal[];
        current_page: number;
        last_page: number;
        total: number;
        links: any[];
    };
    filters: {
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Penarikan Dana', href: '/admin/withdrawals' },
];

export default function WithdrawalIndex({ withdrawals, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const columns: ColumnDef<Withdrawal>[] = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'member',
            header: 'Member',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.original.user?.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.user?.referral_code}</span>
                </div>
            ),
        },
        {
            id: 'account',
            header: 'Rekening',
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span className="font-medium text-slate-900">{row.original.bank_name} - {row.original.account_number}</span>
                    <span className="text-xs text-muted-foreground">a.n. {row.original.account_name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => (
                <div className="font-bold text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.amount)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === 'approved') {
                    return <Badge variant="default">Disetujui</Badge>;
                } else if (status === 'pending') {
                    return <Badge className="bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-100">Menunggu</Badge>;
                } else {
                    return <Badge variant="destructive">Ditolak</Badge>;
                }
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Link href={`/admin/withdrawals/${row.original.id}`}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-brand"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    {row.original.status === 'pending' && (
                        <>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                    if (confirm('Setujui penarikan ini?')) {
                                        router.post(`/admin/withdrawals/${row.original.id}/approve`);
                                    }
                                }}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    if (confirm('Tolak penarikan ini?')) {
                                        router.post(`/admin/withdrawals/${row.original.id}/reject`);
                                    }
                                }}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (value === 'all') delete newFilters[key as keyof typeof filters];
        router.get('/admin/withdrawals', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Penarikan Dana" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold font-heading">Penarikan Dana</h1>
                        <p className="text-muted-foreground">Proses permintaan pencairan dana dari member.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama, email, atau kode referral..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <Select
                        defaultValue={filters.status || 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Disetujui</SelectItem>
                            <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DataTable
                    columns={columns}
                    data={withdrawals.data}
                    emptyTitle="Penarikan tidak ditemukan"
                    emptyDescription="Belum ada permintaan penarikan dana yang sesuai dengan filter."
                />

                {/* Pagination */}
                {withdrawals.last_page > 1 && (
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <div className="text-sm text-muted-foreground font-medium">
                            Menampilkan {withdrawals.data.length} dari total data
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={withdrawals.current_page === 1}
                                onClick={() => router.get(withdrawals.links[0].url)}
                                className="bg-white"
                            >
                                Sebelumnya
                            </Button>
                            <div className="text-sm font-bold px-2 bg-muted rounded-md py-1">
                                {withdrawals.current_page} / {withdrawals.last_page}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={withdrawals.current_page === withdrawals.last_page}
                                onClick={() => router.get(withdrawals.links[withdrawals.links.length - 1].url)}
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
