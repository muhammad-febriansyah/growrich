import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Package {
    id: number;
    key: string;
    name: string;
    sort_order: number;
    pairing_point: number;
    reward_point: number;
    max_pairing_per_day: number;
    registration_price: number;
    upgrade_price: number | null;
    sponsor_bonus_unit: number;
    leveling_bonus_amount: number;
    member_profiles_count: number;
    registration_pins_count: number;
}

interface Props {
    packages: Package[];
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Paket', href: '/admin/packages' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function PackageIndex({ packages, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/packages', { search }, { preserveState: true, replace: true });
    };

    const handleDelete = (pkg: Package) => {
        const inUse = pkg.member_profiles_count > 0 || pkg.registration_pins_count > 0;
        if (inUse) return;

        if (confirm(`Hapus paket "${pkg.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/packages/${pkg.id}`);
        }
    };

    const columns: ColumnDef<Package>[] = [
        {
            accessorKey: 'sort_order',
            header: '#',
            cell: ({ row }) => (
                <span className="font-mono text-xs text-muted-foreground">{row.original.sort_order}</span>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Nama Paket',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{row.original.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{row.original.key}</span>
                </div>
            ),
        },
        {
            accessorKey: 'registration_price',
            header: 'Harga Daftar',
            cell: ({ row }) => <span className="font-medium text-brand">{fmt(row.original.registration_price)}</span>,
        },
        {
            accessorKey: 'upgrade_price',
            header: 'Harga Upgrade',
            cell: ({ row }) => (
                <span className="text-sm font-medium text-amber-600">
                    {row.original.upgrade_price ? fmt(row.original.upgrade_price) : <span className="text-muted-foreground font-normal">—</span>}
                </span>
            ),
        },
        {
            id: 'points',
            header: 'Poin (PP/RP)',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {row.original.pairing_point} PP
                    </span>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                        {row.original.reward_point} RP
                    </span>
                </div>
            ),
        },
        {
            accessorKey: 'max_pairing_per_day',
            header: 'Max Pair',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.original.max_pairing_per_day}x</span>
                    <span className="text-[10px] text-muted-foreground">per hari</span>
                </div>
            ),
        },
        {
            accessorKey: 'leveling_bonus_amount',
            header: 'Leveling Bonus',
            cell: ({ row }) => <span className="text-sm">{fmt(row.original.leveling_bonus_amount)}</span>,
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const inUse = row.original.member_profiles_count > 0 || row.original.registration_pins_count > 0;
                return (
                    <div className="flex justify-end gap-1">
                        <Link href={`/admin/packages/${row.original.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                            onClick={() => handleDelete(row.original)}
                            disabled={inUse}
                            title={inUse ? `Digunakan oleh ${row.original.member_profiles_count} member / ${row.original.registration_pins_count} PIN` : 'Hapus paket'}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Paket" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manajemen Paket</h1>
                        <p className="text-sm text-muted-foreground">Konfigurasi tier dan bonus paket member.</p>
                    </div>
                    <Link href="/admin/packages/create">
                        <Button className="gap-2 bg-brand hover:bg-brand/90 shadow-sm transition-all duration-200">
                            <Plus className="h-4 w-4" />
                            <span>Tambah Paket</span>
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-brand" />
                        <Input
                            type="search"
                            placeholder="Cari nama paket atau key..."
                            className="pl-9 bg-white border-gray-200 focus-visible:ring-brand"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={packages}
                        emptyTitle="Paket tidak ditemukan"
                        emptyDescription={search ? `Tidak ada paket yang sesuai dengan pencarian "${search}".` : "Belum ada paket yang dikonfigurasi."}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
