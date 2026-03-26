import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare, Search } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    replies_count: number;
    created_at: string;
    user: { name: string };
}

interface Props {
    tickets: {
        data: Ticket[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: { open: number; replied: number; closed: number };
    filters: { status?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tiket Support', href: '/admin/support' }];

function StatusBadge({ status }: { status: string }) {
    if (status === 'open') return <Badge className="bg-blue-100 text-blue-700 border border-blue-300">Terbuka</Badge>;
    if (status === 'replied') return <Badge className="bg-green-100 text-green-700 border border-green-300">Dibalas</Badge>;
    return <Badge variant="secondary">Ditutup</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
    if (priority === 'high') return <span className="text-[10px] font-bold text-red-600 uppercase">URGENT</span>;
    if (priority === 'low') return <span className="text-[10px] text-muted-foreground">Rendah</span>;
    return null;
}

export default function AdminSupportIndex({ tickets, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const applyFilter = () => {
        router.get('/admin/support', { search: search || undefined, status: status || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiket Support" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Tiket Support</h1>
                    <p className="text-muted-foreground">Kelola pertanyaan dan permintaan bantuan member.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-3">
                    {[
                        { label: 'Terbuka', value: stats.open, color: 'text-blue-600' },
                        { label: 'Dibalas', value: stats.replied, color: 'text-green-600' },
                        { label: 'Ditutup', value: stats.closed, color: 'text-muted-foreground' },
                    ].map((s) => (
                        <Card key={s.label} className="shadow-premium border-none text-center">
                            <CardContent className="pt-6">
                                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari subjek atau nama member..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <option value="">Semua Status</option>
                        <option value="open">Terbuka</option>
                        <option value="replied">Dibalas</option>
                        <option value="closed">Ditutup</option>
                    </select>
                    <Button onClick={applyFilter} size="sm">Filter</Button>
                </div>

                {/* Tickets List */}
                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Daftar Tiket ({tickets.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p>Tidak ada tiket ditemukan.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tickets.data.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/admin/support/${ticket.id}`}
                                        className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">{ticket.subject}</span>
                                                <PriorityBadge priority={ticket.priority} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {ticket.user.name} ·{' '}
                                                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                                {' · '}
                                                {ticket.replies_count} balasan
                                            </p>
                                        </div>
                                        <StatusBadge status={ticket.status} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
