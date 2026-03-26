import { Head, router, useForm } from '@inertiajs/react';
import { Bot, RefreshCw, Send, ShieldCheck, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Message {
    id: number;
    sender: 'user' | 'bot' | 'admin';
    message: string;
    created_at: string;
}

interface ChatSessionData {
    id: number;
    token: string;
    visitor_name: string | null;
    visitor_email: string | null;
    status: 'bot' | 'human' | 'closed';
    last_activity_at: string | null;
    created_at: string;
    messages: Message[];
}

interface Props {
    session: ChatSessionData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Live Chat', href: '/admin/chat' },
    { title: 'Percakapan', href: '' },
];

export default function AdminChatShow({ session: initial }: Props) {
    const [messages, setMessages] = useState<Message[]>(initial.messages);
    const [status, setStatus] = useState(initial.status);
    const bottomRef = useRef<HTMLDivElement>(null);
    const lastIdRef = useRef<number>(initial.messages[initial.messages.length - 1]?.id ?? 0);

    const { data, setData, post, processing, reset } = useForm({ message: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Poll for new messages
    useEffect(() => {
        if (status === 'closed') return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/admin/chat/${initial.id}/messages?since=${lastIdRef.current}`);
                const data = await res.json();
                if (data.messages.length > 0) {
                    setMessages((prev) => [...prev, ...data.messages]);
                    lastIdRef.current = data.messages[data.messages.length - 1].id;
                }
                setStatus(data.status);
            } catch {
                // silent
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [status]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/chat/${initial.id}/reply`, {
            onSuccess: () => {
                reset('message');
                // Refresh messages after reply
                setTimeout(async () => {
                    const res = await fetch(`/admin/chat/${initial.id}/messages?since=${lastIdRef.current}`);
                    const data = await res.json();
                    if (data.messages.length > 0) {
                        setMessages((prev) => [...prev, ...data.messages]);
                        lastIdRef.current = data.messages[data.messages.length - 1].id;
                    }
                }, 300);
            },
        });
    };

    const senderIcon = (sender: string) => {
        if (sender === 'user') return <User className="h-3.5 w-3.5" />;
        if (sender === 'admin') return <ShieldCheck className="h-3.5 w-3.5" />;
        return <Bot className="h-3.5 w-3.5" />;
    };

    const isOutgoing = (sender: string) => sender === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chat #${initial.id}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl">
                {/* Header */}
                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-base">
                                {initial.visitor_name ?? `Pengunjung #${initial.id}`}
                            </CardTitle>
                            {initial.visitor_email && (
                                <p className="text-xs text-muted-foreground">{initial.visitor_email}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Mulai: {new Date(initial.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {status === 'bot' && (
                                <Badge className="bg-blue-100 text-blue-700 border border-blue-300">AI Bot</Badge>
                            )}
                            {status === 'human' && (
                                <Badge className="bg-green-100 text-green-700 border border-green-300">Human</Badge>
                            )}
                            {status === 'closed' && <Badge variant="secondary">Ditutup</Badge>}

                            {status === 'bot' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => router.post(`/admin/chat/${initial.id}/takeover`)}
                                >
                                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                    Ambil Alih
                                </Button>
                            )}
                            {status !== 'closed' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                        if (confirm('Tutup sesi chat ini?')) {
                                            router.post(`/admin/chat/${initial.id}/close`);
                                        }
                                    }}
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Tutup
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* Messages */}
                <div className="space-y-3 min-h-48">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-2.5 ${isOutgoing(msg.sender) ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                                    msg.sender === 'user' ? 'bg-gray-400' : msg.sender === 'admin' ? 'bg-primary' : 'bg-blue-500'
                                }`}
                            >
                                {senderIcon(msg.sender)}
                            </div>
                            <div className={`max-w-[78%] ${isOutgoing(msg.sender) ? 'items-end flex flex-col' : ''}`}>
                                <div
                                    className={`rounded-2xl px-4 py-2.5 text-sm ${
                                        isOutgoing(msg.sender)
                                            ? 'bg-primary text-white rounded-tr-sm'
                                            : msg.sender === 'bot'
                                              ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-sm'
                                              : 'bg-muted text-foreground rounded-tl-sm'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                    {msg.sender === 'admin' ? 'Admin' : msg.sender === 'bot' ? 'AI Bot' : 'Pengunjung'} ·{' '}
                                    {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Reply */}
                {status !== 'closed' && (
                    <Card className="shadow-premium border-none">
                        <CardContent className="pt-5">
                            <form onSubmit={submit} className="space-y-3">
                                <Textarea
                                    placeholder="Tulis balasan sebagai admin..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={processing || !data.message.trim()}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Kirim
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
