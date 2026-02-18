import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Search, Users } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface MemberProfile {
    package_type: string;
    package_status: string;
    career_level: string;
    left_pp_total: number;
    right_pp_total: number;
}

interface Member {
    id: number;
    name: string;
    email: string;
    referral_code: string | null;
    role: string;
    created_at: string;
    member_profile: MemberProfile | null;
}

interface Props {
    members: {
        data: Member[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        package?: string;
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Member', href: '/admin/members' },
];

// ── Package badge ─────────────────────────────────────────────────────────────
function PackageBadge({ type }: { type: string | undefined }) {
    if (!type) return <span className="text-muted-foreground text-xs">—</span>;

    const styles: Record<string, string> = {
        Silver: 'bg-slate-100 text-slate-700 border-slate-300',
        Gold: 'bg-amber-100 text-amber-700 border-amber-300',
        Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
    };

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[type] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
            {type}
        </span>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | undefined }) {
    if (!status) return <span className="text-muted-foreground text-xs">—</span>;

    const styles: Record<string, string> = {
        active: 'bg-green-100 text-green-700 border-green-300',
        inactive: 'bg-red-100 text-red-700 border-red-300',
        suspended: 'bg-orange-100 text-orange-700 border-orange-300',
    };

    const labels: Record<string, string> = {
        active: 'Aktif',
        inactive: 'Nonaktif',
        suspended: 'Ditangguhkan',
    };

    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize tracking-wide ${styles[status] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
            {labels[status] ?? status}
        </span>
    );
}

// ── Career level badge ────────────────────────────────────────────────────────
function CareerBadge({ level }: { level: string | undefined }) {
    if (!level) return <span className="text-muted-foreground text-xs">—</span>;

    const styles: Record<string, string> = {
        Member: 'bg-gray-100 text-gray-600',
        CoreLoader: 'bg-sky-100 text-sky-700',
        SapphireManager: 'bg-cyan-100 text-cyan-700',
        RubyManager: 'bg-rose-100 text-rose-700',
        EmeraldManager: 'bg-emerald-100 text-emerald-700',
        DiamondManager: 'bg-indigo-100 text-indigo-700',
        BlueDiamondManager: 'bg-blue-100 text-blue-700',
        EliteTeamGlobal: 'bg-yellow-100 text-yellow-700',
    };

    const labels: Record<string, string> = {
        Member: 'Member',
        CoreLoader: 'Core Loader',
        SapphireManager: 'Sapphire',
        RubyManager: 'Ruby',
        EmeraldManager: 'Emerald',
        DiamondManager: 'Diamond',
        BlueDiamondManager: 'Blue Diamond',
        EliteTeamGlobal: 'Elite Global',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${styles[level] ?? 'bg-gray-100 text-gray-600'}`}>
            {labels[level] ?? level}
        </span>
    );
}

export default function MemberIndex({ members, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium text-sm">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">{row.original.email}</div>
                </div>
            ),
        },
        {
            accessorKey: 'referral_code',
            header: 'Kode Referral',
            cell: ({ row }) => (
                <div className="font-mono text-xs font-semibold tracking-wider text-slate-600">
                    {row.original.referral_code ?? '—'}
                </div>
            ),
        },
        {
            id: 'package',
            header: 'Paket',
            cell: ({ row }) => <PackageBadge type={row.original.member_profile?.package_type} />,
        },
        {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => <StatusBadge status={row.original.member_profile?.package_status} />,
        },
        {
            id: 'career',
            header: 'Level Karir',
            cell: ({ row }) => <CareerBadge level={row.original.member_profile?.career_level} />,
        },
        {
            id: 'pp',
            header: 'PP (L / R)',
            cell: ({ row }) => {
                const mp = row.original.member_profile;
                if (!mp) return <span className="text-muted-foreground text-xs">—</span>;
                return (
                    <div className="text-xs font-mono">
                        <span className="text-brand font-semibold">{mp.left_pp_total.toLocaleString()}</span>
                        <span className="mx-1 text-muted-foreground">/</span>
                        <span className="text-pink font-semibold">{mp.right_pp_total.toLocaleString()}</span>
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const member = row.original;
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
                                    <Link href={`/admin/members/${member.id}`}>Detail Member</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/members/${member.id}/edit`}>Edit Member</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive font-medium"
                                    onClick={() => {
                                        if (confirm('Reset password member ini ke "password123"?')) {
                                            router.post(`/admin/members/${member.id}/reset-password`);
                                        }
                                    }}
                                >
                                    Reset Password
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    const handleFilterChange = (key: string, value: string) => {
        const newFilters: Record<string, string> = { ...filters };
        if (value === 'all') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        router.get('/admin/members', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search || 'all');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Member" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Daftar Member</h1>
                    <p className="text-sm text-muted-foreground">
                        {members.total} member terdaftar
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari nama, email, atau kode referral..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="flex gap-2">
                        <Select
                            defaultValue={filters.package ?? 'all'}
                            onValueChange={(v) => handleFilterChange('package', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Paket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Paket</SelectItem>
                                <SelectItem value="Silver">Silver</SelectItem>
                                <SelectItem value="Gold">Gold</SelectItem>
                                <SelectItem value="Platinum">Platinum</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            defaultValue={filters.status ?? 'all'}
                            onValueChange={(v) => handleFilterChange('status', v)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Nonaktif</SelectItem>
                                <SelectItem value="suspended">Ditangguhkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <DataTable
                    columns={columns}
                    data={members.data}
                    emptyTitle="Member tidak ditemukan"
                    emptyDescription="Tidak ada member yang sesuai dengan filter atau pencarian Anda."
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        Halaman {members.current_page} dari {members.last_page} · {members.total} total member
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={members.current_page === 1}
                            onClick={() => {
                                const prev = members.links[members.current_page - 1];
                                if (prev?.url) router.get(prev.url);
                            }}
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={members.current_page === members.last_page}
                            onClick={() => {
                                const next = members.links[members.current_page + 1];
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
