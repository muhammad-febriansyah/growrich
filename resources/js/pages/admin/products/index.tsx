import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

interface Product {
    id: number;
    name: string;
    sku: string;
    image_url: string | null;
    regular_price: number;
    ro_price: number;
    member_discount: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Produk', href: '/admin/products' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function ProductIndex({ products, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleFilterChange = (key: string, value: string) => {
        const newFilters: Record<string, string> = { ...filters };
        if (value === 'all' || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        router.get('/admin/products', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const handleDelete = (product: Product) => {
        if (confirm(`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/products/${product.id}`);
        }
    };

    const columns: ColumnDef<Product>[] = [
        {
            id: 'product',
            header: 'Produk',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                        {row.original.image_url ? (
                            <img src={row.original.image_url} alt={row.original.name} className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center text-gray-300">
                                <Package className="size-5" />
                            </div>
                        )}
                    </div>
                    <div>
                        <Link href={`/admin/products/${row.original.id}`} className="font-medium hover:text-brand hover:underline">
                            {row.original.name}
                        </Link>
                        <div className="font-mono text-xs text-muted-foreground">{row.original.sku}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'regular_price',
            header: 'Harga Reguler',
            cell: ({ row }) => <div className="text-sm">{fmt(row.original.regular_price)}</div>,
        },
        {
            accessorKey: 'ro_price',
            header: 'Harga RO',
            cell: ({ row }) => <div className="text-sm font-semibold text-brand">{fmt(row.original.ro_price)}</div>,
        },
        {
            accessorKey: 'member_discount',
            header: 'Diskon',
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                    {row.original.member_discount}%
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${row.original.is_active ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                    {row.original.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Link href={`/admin/products/${row.original.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href={`/admin/products/${row.original.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(row.original)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Produk" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Manajemen Produk</h1>
                        <p className="text-sm text-muted-foreground">{products.total} produk dalam katalog</p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Tambah Produk
                        </Button>
                    </Link>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama produk atau SKU..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                    <Select
                        defaultValue={filters.status ?? 'all'}
                        onValueChange={(v) => handleFilterChange('status', v)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={products.data}
                    emptyTitle="Produk belum tersedia"
                    emptyDescription="Belum ada produk dalam katalog."
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        Halaman {products.current_page} dari {products.last_page} · {products.total} total produk
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={products.current_page === 1}
                            onClick={() => {
                                const prev = products.links[products.current_page - 1];
                                if (prev?.url) router.get(prev.url);
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={products.current_page === products.last_page}
                            onClick={() => {
                                const next = products.links[products.current_page + 1];
                                if (next?.url) router.get(next.url);
                            }}
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
