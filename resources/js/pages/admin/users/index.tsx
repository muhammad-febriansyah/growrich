import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Search, UserPlus, Users, Key, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Admin', href: '/admin/users' },
];

export default function AdminIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {row.original.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-sm text-gray-900">{row.original.name}</div>
                        <div className="text-xs text-muted-foreground">{row.original.email}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'phone',
            header: 'No. Telepon',
            cell: ({ row }) => <div className="text-sm">{row.original.phone ?? '—'}</div>,
        },
        {
            accessorKey: 'created_at',
            header: 'Terdaftar Pada',
            cell: ({ row }) => (
                <div className="text-sm text-gray-500">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Buka menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/users/${user.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit Admin
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (confirm('Reset password administrator ini ke "password123"?')) {
                                            router.post(`/admin/users/${user.id}/reset-password`);
                                        }
                                    }}
                                >
                                    <Key className="mr-2 h-4 w-4 text-blue-500" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive font-medium"
                                    onClick={() => {
                                        if (confirm(`Hapus administrator "${user.name}"?`)) {
                                            router.delete(`/admin/users/${user.id}`);
                                        }
                                    }}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus Admin
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Admin" />

            <div className="flex flex-col gap-6 p-4 md:p-6 w-full">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Administrator</h1>
                        <p className="text-sm text-muted-foreground">Kelola tim administrator aplikasi Anda.</p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm font-semibold">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Tambah Admin Baru
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama atau email..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>
                </div>

                <DataTable
                    columns={columns}
                    data={users.data}
                    emptyTitle="Administrator tidak ditemukan"
                    emptyDescription="Tidak ada administrator yang sesuai dengan kriteria pencarian Anda."
                />

                <div className="flex items-center justify-between gap-3 border-t pt-4">
                    <div className="text-sm text-muted-foreground italic">
                        Menampilkan {users.data.length} dari {users.total} administrator
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={users.current_page === 1}
                            onClick={() => {
                                const prev = users.links[users.current_page - 1];
                                if (prev?.url) router.get(prev.url);
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <span className="text-sm font-medium px-1">
                            {users.current_page} / {users.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={users.current_page === users.last_page}
                            onClick={() => {
                                const next = users.links[users.current_page + 1];
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
