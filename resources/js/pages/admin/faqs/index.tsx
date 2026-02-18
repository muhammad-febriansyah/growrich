import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { HelpCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Faq {
    id: number;
    question: string;
    answer: string;
    is_published: boolean;
    sort_order: number;
    created_at: string;
}

interface Props {
    faqs: {
        data: Faq[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen FAQ', href: '/admin/faqs' },
];

export default function FaqIndex({ faqs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleFilterChange = (key: string, value: string) => {
        const newFilters: Record<string, string> = { ...filters };
        if (value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        router.get('/admin/faqs', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const handleDelete = (faq: Faq) => {
        if (confirm(`Hapus FAQ "${faq.question}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/faqs/${faq.id}`, {
                onSuccess: () => toast.success('FAQ berhasil dihapus'),
            });
        }
    };

    const columns: ColumnDef<Faq>[] = [
        {
            accessorKey: 'sort_order',
            header: 'Urutan',
            cell: ({ row }) => <div className="text-sm font-mono">{row.original.sort_order}</div>,
        },
        {
            accessorKey: 'question',
            header: 'Pertanyaan',
            cell: ({ row }) => (
                <div className="max-w-[400px]">
                    <div className="font-medium truncate" title={row.original.question}>
                        {row.original.question}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${row.original.is_published ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                    {row.original.is_published ? 'Publik' : 'Draft'}
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Link href={`/admin/faqs/${row.original.id}/edit`}>
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
            <Head title="Manajemen FAQ" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Manajemen FAQ</h1>
                        <p className="text-sm text-muted-foreground">{faqs.total} pertanyaan terdaftar</p>
                    </div>
                    <Link href="/admin/faqs/create">
                        <Button className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Tambah FAQ
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari pertanyaan atau jawaban..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={faqs.data}
                    emptyTitle="FAQ belum tersedia"
                    emptyDescription="Belum ada FAQ yang ditambahkan."
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        Halaman {faqs.current_page} dari {faqs.last_page} · {faqs.total} total FAQ
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={faqs.current_page === 1}
                            onClick={() => {
                                const prev = faqs.links[faqs.current_page - 1];
                                if (prev?.url) router.get(prev.url);
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={faqs.current_page === faqs.last_page}
                            onClick={() => {
                                const next = faqs.links[faqs.current_page + 1];
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
