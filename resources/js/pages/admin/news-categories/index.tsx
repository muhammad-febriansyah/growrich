import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface NewsCategory {
    id: number;
    title: string;
    slug: string;
    news_count: number;
    created_at: string;
}

interface Props {
    categories: {
        data: NewsCategory[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kategori Berita', href: '/admin/news-categories' },
];

export default function NewsCategoryIndex({ categories }: Props) {
    const [search, setSearch] = useState('');

    const handleDelete = (category: NewsCategory) => {
        if (
            confirm(
                `Hapus kategori "${category.title}"? Berita dalam kategori ini tidak akan terhapus.`,
            )
        ) {
            router.delete(`/admin/news-categories/${category.id}`);
        }
    };

    const columns: ColumnDef<NewsCategory>[] = [
        {
            id: 'category',
            header: 'Kategori',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FolderOpen className="size-4" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">
                            {row.original.title}
                        </div>
                        <div className="text-xs text-muted-foreground italic">
                            /{row.original.slug}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'news_count',
            header: 'Jumlah Berita',
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                    {row.original.news_count} berita
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }) => (
                <div className="text-sm text-gray-500">
                    {format(new Date(row.original.created_at), 'd MMM yyyy', {
                        locale: id,
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Link
                        href={`/admin/news-categories/${row.original.id}/edit`}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                        >
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

    const filtered = categories.data.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Berita" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Kategori Berita
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola kategori untuk pengelompokan berita.
                        </p>
                    </div>
                    <Link href="/admin/news-categories/create">
                        <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama kategori..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filtered}
                    emptyTitle="Belum ada kategori"
                    emptyDescription="Buat kategori pertama untuk mengelompokkan berita Anda."
                />

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <div className="text-sm text-muted-foreground italic">
                        Menampilkan {categories.data.length} dari{' '}
                        {categories.total} total kategori
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={categories.current_page === 1}
                            onClick={() => {
                                const prev =
                                    categories.links[
                                        categories.current_page - 1
                                    ];
                                if (prev?.url) router.get(prev.url);
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <span className="px-1 text-sm font-medium">
                            {categories.current_page} / {categories.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                categories.current_page === categories.last_page
                            }
                            onClick={() => {
                                const next =
                                    categories.links[
                                        categories.current_page + 1
                                    ];
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
