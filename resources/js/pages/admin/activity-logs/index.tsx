import { Head, router } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface ActivityLog {
    id: number;
    user_id: number | null;
    user_name: string | null;
    user_role: string | null;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    description: string;
    ip_address: string | null;
    created_at: string;
}

interface Props {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    actionOptions: string[];
    filters: {
        action?: string;
        role?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity Log', href: '/admin/activity-logs' },
];

// ── Action badge ─────────────────────────────────────────────────────────────
const actionColor: Record<string, string> = {
    login: 'bg-green-100 text-green-700 border-green-300',
    'bonus.approved': 'bg-blue-100 text-blue-700 border-blue-300',
    'bonus.rejected': 'bg-red-100 text-red-700 border-red-300',
    'withdrawal.approved': 'bg-blue-100 text-blue-700 border-blue-300',
    'withdrawal.rejected': 'bg-red-100 text-red-700 border-red-300',
    'pin_order.completed': 'bg-teal-100 text-teal-700 border-teal-300',
    'pin_order.shipped': 'bg-cyan-100 text-cyan-700 border-cyan-300',
    'pin_order.cancelled': 'bg-orange-100 text-orange-700 border-orange-300',
    'upgrade.approved': 'bg-violet-100 text-violet-700 border-violet-300',
    'upgrade.rejected': 'bg-red-100 text-red-700 border-red-300',
    'member.updated': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'member.deleted': 'bg-rose-100 text-rose-700 border-rose-300',
    'member.password_reset': 'bg-amber-100 text-amber-700 border-amber-300',
    'member.stockist_toggled': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'reward.fulfilled': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'reward.pending': 'bg-gray-100 text-gray-700 border-gray-300',
    'repeat_order.updated': 'bg-sky-100 text-sky-700 border-sky-300',
};

function ActionBadge({ action }: { action: string }) {
    const cls = actionColor[action] ?? 'bg-gray-100 text-gray-600 border-gray-300';
    const label = action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return (
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${cls}`}>
            {label}
        </span>
    );
}

function RoleBadge({ role }: { role: string | null }) {
    if (!role) return <span className="text-xs text-muted-foreground">—</span>;
    const cls = role === 'admin'
        ? 'bg-slate-800 text-white'
        : 'bg-blue-100 text-blue-700';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}>
            {role}
        </span>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return new Date(dateStr).toLocaleDateString('id-ID', { dateStyle: 'medium' });
}

export default function ActivityLogIndex({ logs, actionOptions, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const handleFilter = (key: string, value: string) => {
        const next: Record<string, string> = { ...filters };
        if (value === 'all' || value === '') {
            delete next[key];
        } else {
            next[key] = value;
        }
        router.get('/admin/activity-logs', next, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleDateFilter = () => {
        const next: Record<string, string> = { ...filters };
        if (dateFrom) next.date_from = dateFrom; else delete next.date_from;
        if (dateTo) next.date_to = dateTo; else delete next.date_to;
        delete next.search;
        if (search) next.search = search;
        router.get('/admin/activity-logs', next, { preserveState: true, replace: true });
    };

    const buildExportUrl = () => {
        const params = new URLSearchParams();
        if (filters.action) params.set('action', filters.action);
        if (filters.role) params.set('role', filters.role);
        if (filters.search) params.set('search', filters.search);
        if (filters.date_from) params.set('date_from', filters.date_from);
        if (filters.date_to) params.set('date_to', filters.date_to);
        const qs = params.toString();
        return '/admin/activity-logs/export' + (qs ? '?' + qs : '');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Activity Log</h1>
                        <p className="text-sm text-muted-foreground">
                            {logs.total.toLocaleString()} aktivitas tercatat
                        </p>
                    </div>
                    <a href={buildExportUrl()}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                    </a>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <form onSubmit={handleSearch} className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari nama user, keterangan, atau IP..."
                                className="pl-9 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>

                        <Select
                            value={filters.action ?? 'all'}
                            onValueChange={(v) => handleFilter('action', v)}
                        >
                            <SelectTrigger className="w-[200px] bg-white">
                                <SelectValue placeholder="Semua Aksi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Aksi</SelectItem>
                                {actionOptions.map((a) => (
                                    <SelectItem key={a} value={a}>
                                        {a.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.role ?? 'all'}
                            onValueChange={(v) => handleFilter('role', v)}
                        >
                            <SelectTrigger className="w-[150px] bg-white">
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rentang tanggal:</span>
                        <Input
                            type="date"
                            className="w-40 bg-white"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">—</span>
                        <Input
                            type="date"
                            className="w-40 bg-white"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                        <Button variant="outline" size="sm" onClick={handleDateFilter}>
                            Terapkan
                        </Button>
                        {(filters.date_from || filters.date_to) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => {
                                    setDateFrom('');
                                    setDateTo('');
                                    const next: Record<string, string> = { ...filters };
                                    delete next.date_from;
                                    delete next.date_to;
                                    router.get('/admin/activity-logs', next, { preserveState: true, replace: true });
                                }}
                            >
                                Reset tanggal
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <th className="px-4 py-3 w-40">Waktu</th>
                                <th className="px-4 py-3 w-40">User</th>
                                <th className="px-4 py-3 w-28">Role</th>
                                <th className="px-4 py-3 w-48">Aksi</th>
                                <th className="px-4 py-3">Keterangan</th>
                                <th className="px-4 py-3 w-32">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                                        <p className="text-sm">Tidak ada aktivitas ditemukan</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="text-xs font-medium text-slate-700">
                                                {new Date(log.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                                                {timeAgo(log.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-800 text-xs">
                                                {log.user_name ?? <span className="italic text-muted-foreground">System</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <RoleBadge role={log.user_role} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <ActionBadge action={log.action} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-slate-700 leading-snug">{log.description}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[11px] text-muted-foreground">
                                                {log.ip_address ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            Halaman {logs.current_page} dari {logs.last_page} · {logs.total.toLocaleString()} total log
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={logs.current_page === 1}
                                onClick={() => {
                                    const prev = logs.links[logs.current_page - 1];
                                    if (prev?.url) router.get(prev.url);
                                }}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={logs.current_page === logs.last_page}
                                onClick={() => {
                                    const next = logs.links[logs.current_page + 1];
                                    if (next?.url) router.get(next.url);
                                }}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
