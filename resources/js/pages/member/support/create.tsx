import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Bantuan / Support', href: '/member/support' },
    { title: 'Buat Tiket', href: '/member/support/create' },
];

export default function SupportCreate() {
    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        message: '',
        priority: 'normal',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/support');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Tiket Support" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-bold font-heading">Buat Tiket Baru</h1>
                    <p className="text-muted-foreground">Sampaikan pertanyaan atau kendala Anda kepada tim kami.</p>
                </div>

                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Detail Tiket</CardTitle>
                        <CardDescription>Tim kami akan merespons dalam 1x24 jam kerja.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subjek</Label>
                                <Input
                                    id="subject"
                                    placeholder="Ringkasan masalah Anda"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                />
                                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Prioritas</Label>
                                <select
                                    id="priority"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="low">Rendah - Pertanyaan umum</option>
                                    <option value="normal">Normal - Butuh bantuan</option>
                                    <option value="high">Urgent - Masalah serius</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Pesan</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={6}
                                />
                                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                <Send className="mr-2 h-4 w-4" />
                                Kirim Tiket
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
