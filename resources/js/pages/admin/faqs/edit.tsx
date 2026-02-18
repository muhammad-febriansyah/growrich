import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Faq {
    id: number;
    question: string;
    answer: string;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    faq: Faq;
}

export default function FaqEdit({ faq }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen FAQ', href: '/admin/faqs' },
        { title: 'Edit FAQ', href: `/admin/faqs/${faq.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        question: faq.question,
        answer: faq.answer,
        is_published: faq.is_published,
        sort_order: faq.sort_order,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/faqs/${faq.id}`, {
            onSuccess: () => toast.success('FAQ berhasil diperbarui'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit FAQ" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/faqs">
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit FAQ</h1>
                            <p className="text-sm text-muted-foreground">Perbarui informasi FAQ yang sudah ada.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Detail FAQ</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="question">Pertanyaan</Label>
                                <Input
                                    id="question"
                                    value={data.question}
                                    onChange={(e) => setData('question', e.target.value)}
                                    placeholder="Contoh: Bagaimana cara mendaftar?"
                                    autoFocus
                                />
                                {errors.question && <p className="text-xs text-destructive">{errors.question}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="answer">Jawaban</Label>
                                <Textarea
                                    id="answer"
                                    value={data.answer}
                                    onChange={(e) => setData('answer', e.target.value)}
                                    placeholder="Tuliskan jawaban lengkap di sini..."
                                    rows={5}
                                />
                                {errors.answer && <p className="text-xs text-destructive">{errors.answer}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Urutan Tampil</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    min="0"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    className="w-32"
                                />
                                {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order}</p>}
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                <Switch
                                    id="is_published"
                                    checked={data.is_published}
                                    onCheckedChange={(v) => setData('is_published', v)}
                                />
                                <Label htmlFor="is_published" className="cursor-pointer font-medium">
                                    Publikasikan FAQ
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex gap-3">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                        <Link href="/admin/faqs">
                            <Button type="button" variant="outline">Batal</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
