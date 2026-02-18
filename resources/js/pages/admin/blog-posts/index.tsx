import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Pencil, Plus, Search, Trash2, Globe, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
}

interface Props {
    posts: {
        data: BlogPost[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Blog', href: '/admin/blog-posts' },
];

export default function BlogIndex({ posts }: Props) {
    const [search, setSearch] = useState('');

    const handleDelete = (post: BlogPost) => {
        if (confirm(`Hapus artikel "${post.title}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/blog-posts/${post.id}`);
        }
    };

    const columns: ColumnDef<BlogPost>[] = [
        {
            id: 'post',
            header: 'Artikel',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                        {row.original.thumbnail_url ? (
                            <img src={row.original.thumbnail_url} alt={row.original.title} className="size-full object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center text-gray-300">
                                <FileText className="size-6" />
                            </div>
                        )}
                    </div>
                    <div className="max-w-xs md:max-w-sm">
                        <div className="font-semibold text-gray-900 truncate">{row.original.title}</div>
                        <div className="text-xs text-muted-foreground truncate italic">/{row.original.slug}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'is_published',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.is_published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            <Globe className="h-3 w-3" /> Publik
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                            <Lock className="h-3 w-3" /> Draft
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Dibuat',
            cell: ({ row }) => (
                <div className="text-sm text-gray-500">
                    {format(new Date(row.original.created_at), 'd MMM yyyy', { locale: id })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Link href={`/admin/blog-posts/${row.original.id}/edit`}>
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
            <Head title="Manajemen Blog" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Blog</h1>
                        <p className="text-sm text-muted-foreground">Kelola artikel, berita, dan pengumuman untuk website.</p>
                    </div>
                    <Link href="/admin/blog-posts/create">
                        <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                            <Plus className="h-4 w-4" />
                            Buat Artikel Baru
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari judul artikel..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={posts.data.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))}
                    emptyTitle="Belum ada artikel"
                    emptyDescription="Mulai tulis artikel pertama Anda untuk menjangkau audiens lebih luas."
                />

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <div className="text-sm text-muted-foreground italic">
                        Menampilkan {posts.data.length} dari {posts.total} total artikel
                    </div>
                    <div className="flex gap-2">
                        {posts.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
