import { Head, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, History, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface MemberProfile {
    package_type: string;
    package_status: string;
    career_level: string;
}

interface Member {
    id: number;
    name: string;
    email: string;
    member_id: string | null;
    phone: string | null;
    created_at: string;
    member_profile: MemberProfile | null;
}

interface DeletionLog {
    id: number;
    member_id: string | null;
    name: string;
    email: string;
    phone: string | null;
    package_type: string | null;
    career_level: string | null;
    created_at: string;
    deleted_by: { id: number; name: string } | null;
}

interface Props {
    members: Member[];
    logs: DeletionLog[];
}

interface FlashProps {
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Hapus Member', href: '/admin/member-deletions' }];

function packageBadgeClass(pkg: string | null) {
    if (pkg === 'platinum') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (pkg === 'gold') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function MemberDeletionsIndex({ members, logs }: Props) {
    const { flash } = usePage<{ flash: FlashProps }>().props;
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState('');

    const filtered = members.filter((m) => {
        const q = search.toLowerCase();
        return (
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            (m.member_id ?? '').toLowerCase().includes(q)
        );
    });

    const allFilteredIds = filtered.map((m) => m.id);
    const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
    const isIndeterminate = !isAllSelected && allFilteredIds.some((id) => selected.has(id));

    function toggleAll() {
        if (isAllSelected) {
            setSelected((prev) => {
                const next = new Set(prev);
                allFilteredIds.forEach((id) => next.delete(id));
                return next;
            });
        } else {
            setSelected((prev) => new Set([...prev, ...allFilteredIds]));
        }
    }

    function toggleOne(id: number) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function handleDelete(member: Member) {
        if (
            !confirm(
                `PERHATIAN: Tindakan ini tidak dapat dibatalkan!\n\nHapus member:\n• ${member.name} (${member.member_id ?? '-'})\n\nSemua data terkait akan ikut terhapus.\n\nTekan OK untuk melanjutkan.`,
            )
        ) {
            return;
        }
        router.delete(`/admin/member-deletions/${member.id}`);
    }

    function handleBulkDelete() {
        const ids = [...selected];
        if (ids.length === 0) return;
        if (
            !confirm(
                `PERHATIAN: Tindakan ini tidak dapat dibatalkan!\n\nHapus ${ids.length} member yang dipilih?\n\nSemua data terkait (bonus, poin, wallet, dll) akan ikut terhapus.\n\nTekan OK untuk melanjutkan.`,
            )
        ) {
            return;
        }
        router.delete('/admin/member-deletions', {
            data: { ids },
            onSuccess: () => setSelected(new Set()),
        });
    }

    const logColumns: ColumnDef<DeletionLog>[] = [
        {
            accessorKey: 'member_id',
            header: 'ID Member',
            cell: ({ row }) => (
                <code className="font-mono text-xs font-semibold text-slate-500">
                    {row.original.member_id ?? '-'}
                </code>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Nama Member',
            cell: ({ row }) => (
                <div>
                    <p className="text-sm font-medium">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            ),
        },
        {
            accessorKey: 'package_type',
            header: 'Paket',
            cell: ({ row }) => {
                const pkg = row.original.package_type;
                return (
                    <Badge variant="outline" className={`text-xs uppercase ${packageBadgeClass(pkg)}`}>
                        {pkg ?? '-'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'deleted_by',
            header: 'Dihapus Oleh',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {row.original.deleted_by?.name ?? '-'}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Waktu Hapus',
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </span>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hapus Member" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-bold text-gray-900">Hapus Member</h1>
                    <p className="text-sm text-muted-foreground">
                        Hapus data member beserta seluruh data terkait secara permanen.
                    </p>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                        {flash.error}
                    </div>
                )}

                {/* Warning card */}
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                        <p className="font-bold">Perhatian — Tindakan Tidak Dapat Dibatalkan</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-red-600/80">
                            Menghapus member akan menghapus seluruh data terkait secara permanen: bonus, poin (PP/RP), wallet,
                            withdrawal, repeat order, dan data lainnya. LP/FP pada upline di posisi kaki member yang dihapus
                            akan direset ke <strong>0</strong>. Member root tidak dapat dihapus.
                        </p>
                    </div>
                </div>

                {/* Member List */}
                <div className="flex flex-col gap-3">
                    {/* List header */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <UserX className="h-4 w-4 text-muted-foreground" />
                            <h2 className="text-sm font-semibold text-gray-700">
                                Daftar Member ({members.length})
                            </h2>
                        </div>
                        {selected.size > 0 && (
                            <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1.5"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus {selected.size} Member Terpilih
                            </Button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative flex items-center">
                        <svg className="absolute left-3 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                            type="text"
                            placeholder="Cari nama, email, atau ID member..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    {/* Table */}
                    <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/30 border-b">
                                    <th className="h-10 w-10 px-3 text-left">
                                        <Checkbox
                                            checked={isIndeterminate ? 'indeterminate' : isAllSelected}
                                            onCheckedChange={toggleAll}
                                            aria-label="Pilih semua"
                                        />
                                    </th>
                                    <th className="h-10 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Member</th>
                                    <th className="h-10 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama</th>
                                    <th className="h-10 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Paket</th>
                                    <th className="h-10 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Level Karir</th>
                                    <th className="h-10 px-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Bergabung</th>
                                    <th className="h-10 px-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                                            {search ? 'Tidak ditemukan member yang cocok.' : 'Tidak ada member yang dapat dihapus.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((member) => (
                                        <tr
                                            key={member.id}
                                            className={`hover:bg-muted/20 transition-colors ${selected.has(member.id) ? 'bg-red-50/40' : ''}`}
                                        >
                                            <td className="px-3 py-3">
                                                <Checkbox
                                                    checked={selected.has(member.id)}
                                                    onCheckedChange={() => toggleOne(member.id)}
                                                    aria-label={`Pilih ${member.name}`}
                                                />
                                            </td>
                                            <td className="px-3 py-3">
                                                <code className="font-mono text-xs font-semibold text-slate-700">
                                                    {member.member_id ?? '-'}
                                                </code>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs uppercase ${packageBadgeClass(member.member_profile?.package_type ?? null)}`}
                                                >
                                                    {member.member_profile?.package_type ?? '-'}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground">
                                                {member.member_profile?.career_level ?? '-'}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground">
                                                {new Date(member.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 gap-1 border-red-200 text-xs text-red-600 hover:border-red-300 hover:bg-red-50"
                                                        onClick={() => handleDelete(member)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Hapus
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {selected.size > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {selected.size} dari {members.length} member dipilih.
                        </p>
                    )}
                </div>

                {/* Deletion History */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-gray-700">
                            Riwayat Penghapusan ({logs.length})
                        </h2>
                    </div>
                    <DataTable
                        columns={logColumns}
                        data={logs}
                        searchKey="name"
                        searchPlaceholder="Cari riwayat penghapusan..."
                        showPagination={true}
                        pageSize={10}
                        emptyTitle="Belum ada riwayat"
                        emptyDescription="Riwayat penghapusan member akan muncul di sini."
                    />
                </div>

                <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Total {logs.length} member telah dihapus
                </p>
            </div>
        </AppLayout>
    );
}
