import { Head, Link } from '@inertiajs/react';
import { Bot, MessageCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface ChatSession {
    id: number;
    visitor_name: string | null;
    visitor_email: string | null;
    status: 'bot' | 'human' | 'closed';
    messages_count: number;
    last_activity_at: string | null;
    created_at: string;
    messages: { message: string; sender: string }[];
}

interface Props {
    sessions: {
        data: ChatSession[];
        current_page: number;
        last_page: number;
        total: number;
    };
    stats: { active: number; bot: number; human: number; closed: number };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Live Chat', href: '/admin/chat' }];

function StatusBadge({ status }: { status: string }) {
    if (status === 'human') return <Badge className="bg-green-100 text-green-700 border border-green-300">Human</Badge>;
    if (status === 'bot') return <Badge className="bg-blue-100 text-blue-700 border border-blue-300">AI Bot</Badge>;
    return <Badge variant="secondary">Ditutup</Badge>;
}

export default function AdminChatIndex({ sessions, stats }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Live Chat" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Live Chat</h1>
                    <p className="text-muted-foreground">Monitor dan kelola percakapan live chat dari pengunjung.</p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Aktif', value: stats.active, icon: <Users className="h-5 w-5" />, color: 'text-emerald-600' },
                        { label: 'AI Bot', value: stats.bot, icon: <Bot className="h-5 w-5" />, color: 'text-blue-600' },
                        { label: 'Human', value: stats.human, icon: <MessageCircle className="h-5 w-5" />, color: 'text-green-600' },
                        { label: 'Ditutup', value: stats.closed, icon: <MessageCircle className="h-5 w-5" />, color: 'text-muted-foreground' },
                    ].map((s) => (
                        <Card key={s.label} className="shadow-premium border-none">
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                    </div>
                                    <div className={`p-2 rounded-full bg-muted ${s.color}`}>{s.icon}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sessions */}
                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Sesi Chat ({sessions.total})</CardTitle>
                        <CardDescription>Klik sesi untuk melihat percakapan dan membalas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageCircle className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                <p>Belum ada percakapan.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sessions.data.map((session) => (
                                    <Link
                                        key={session.id}
                                        href={`/admin/chat/${session.id}`}
                                        className="flex items-center gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1a5c0e] to-[#2d9e1a] text-white text-sm font-bold">
                                            {session.visitor_name?.[0]?.toUpperCase() ?? '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    {session.visitor_name ?? `Pengunjung #${session.id}`}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {session.messages[0]?.message ?? 'Belum ada pesan'}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {session.messages_count} pesan ·{' '}
                                                {session.last_activity_at
                                                    ? new Date(session.last_activity_at).toLocaleString('id-ID')
                                                    : new Date(session.created_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <StatusBadge status={session.status} />
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
