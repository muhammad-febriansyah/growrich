import { Head, useForm } from '@inertiajs/react';
import { Send, ShieldCheck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Reply {
    id: number;
    message: string;
    is_admin: boolean;
    created_at: string;
    user: { name: string };
}

interface Ticket {
    id: number;
    subject: string;
    message: string;
    status: string;
    priority: string;
    created_at: string;
    replies: Reply[];
}

interface Props {
    ticket: Ticket;
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'open') return <Badge className="bg-blue-100 text-blue-700 border border-blue-300">Terbuka</Badge>;
    if (status === 'replied') return <Badge className="bg-green-100 text-green-700 border border-green-300">Dibalas</Badge>;
    return <Badge variant="secondary">Ditutup</Badge>;
}

export default function SupportShow({ ticket }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Bantuan / Support', href: '/member/support' },
        { title: ticket.subject, href: `/member/support/${ticket.id}` },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({ message: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/member/support/${ticket.id}/reply`, {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={ticket.subject} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Ticket Header */}
                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dibuat{' '}
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversation Thread */}
                {ticket.replies.length > 0 && (
                    <div className="space-y-3">
                        {ticket.replies.map((reply) => (
                            <div
                                key={reply.id}
                                className={`flex gap-3 ${reply.is_admin ? '' : 'flex-row-reverse'}`}
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${reply.is_admin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {reply.is_admin ? (
                                        <ShieldCheck className="h-4 w-4" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <div className={`max-w-[80%] ${reply.is_admin ? '' : 'items-end flex flex-col'}`}>
                                    <div
                                        className={`rounded-2xl px-4 py-3 text-sm ${reply.is_admin ? 'bg-primary/5 rounded-tl-none' : 'bg-muted rounded-tr-none'}`}
                                    >
                                        <p className="whitespace-pre-wrap">{reply.message}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                        {reply.is_admin ? 'Tim Support' : reply.user.name} ·{' '}
                                        {new Date(reply.created_at).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply Form */}
                {ticket.status !== 'closed' ? (
                    <Card className="shadow-premium border-none">
                        <CardHeader>
                            <CardTitle className="text-base">Kirim Balasan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-3">
                                <Textarea
                                    placeholder="Tulis balasan Anda..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={4}
                                />
                                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                                <Button type="submit" disabled={processing}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Balasan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                        Tiket ini telah ditutup.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
