import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    replies_count: number;
    created_at: string;
}

interface Props {
    tickets: {
        data: Ticket[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Bantuan / Support', href: '/member/support' }];

function StatusBadge({ status }: { status: string }) {
    if (status === 'open') return <Badge className="bg-blue-100 text-blue-700 border border-blue-300">Terbuka</Badge>;
    if (status === 'replied') return <Badge className="bg-green-100 text-green-700 border border-green-300">Dibalas</Badge>;
    return <Badge variant="secondary">Ditutup</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
    if (priority === 'high') return <Badge variant="destructive" className="text-[10px]">Urgent</Badge>;
    if (priority === 'low') return <Badge variant="outline" className="text-[10px]">Rendah</Badge>;
    return null;
}

export default function SupportIndex({ tickets }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bantuan & Support" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-heading">Bantuan & Support</h1>
                        <p className="text-muted-foreground">Hubungi tim kami jika membutuhkan bantuan.</p>
                    </div>
                    <Button asChild>
                        <Link href="/member/support/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Tiket Baru
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Tiket Saya</CardTitle>
                        <CardDescription>Riwayat pertanyaan dan permintaan bantuan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p className="font-medium">Belum ada tiket</p>
                                <p className="text-sm mt-1">Buat tiket baru jika membutuhkan bantuan dari tim kami.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tickets.data.map((ticket) => (
                                    <Link
                                        key={ticket.id}
                                        href={`/member/support/${ticket.id}`}
                                        className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm truncate">{ticket.subject}</span>
                                                <PriorityBadge priority={ticket.priority} />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
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
