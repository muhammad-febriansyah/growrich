import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/rich-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Page {
    id: number;
    slug: string;
    title: string;
    content: string | null;
    vision: string | null;
    mission: string | null;
    image: string | null;
    image_url: string | null;
}

interface Props {
    page: Page;
}

export default function LegalPageEdit({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pengaturan Situs', href: '/admin/settings' },
        { title: page.title, href: `/admin/legal-pages/${page.slug}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: page.title,
        content: page.content || '',
        vision: page.vision || '',
        mission: page.mission || '',
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/legal-pages/${page.slug}`, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${page.title}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full items-center">
                <div className="w-full">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/settings">
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit {page.title}</h1>
                            <p className="text-sm text-muted-foreground">Kelola isi konten untuk halaman {page.title.toLowerCase()}.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-brand">Konten Halaman</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                {page.slug === 'about-us' && (
                                    <div className="grid gap-4">
                                        <Label className="text-sm font-semibold">Thumbnail / Gambar Utama</Label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 border rounded-xl bg-slate-50/50">
                                            {data.image || page.image_url ? (
                                                <div className="size-32 border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shadow-sm shrink-0">
                                                    <img
                                                        src={data.image ? URL.createObjectURL(data.image) : page.image_url!}
                                                        alt="Thumbnail Preview"
                                                        className="max-h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="size-32 border border-dashed rounded-lg bg-white flex items-center justify-center text-muted-foreground shrink-0">
                                                    <ImageIcon className="size-10 opacity-20" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-3">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                                    className="bg-white"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Format: <span className="font-semibold">PNG, JPG, WEBP</span> (Maks. 2MB).
                                                    Gambar ini akan muncul sebagai header atau thumbnail di halaman Tentang Kami.
                                                </p>
                                                {errors.image && <p className="text-xs text-destructive font-semibold">{errors.image}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="title">Judul Halaman</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Syarat & Ketentuan"
                                        required
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Isi Konten</Label>
                                    <RichEditor
                                        value={data.content}
                                        onChange={(val) => setData('content', val)}
                                        placeholder="Tuliskan isi halaman di sini..."
                                    />
                                    {errors.content && <p className="text-xs text-destructive">{errors.content}</p>}
                                </div>

                                {page.slug === 'about-us' && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label>Visi Kami</Label>
                                            <RichEditor
                                                value={data.vision}
                                                onChange={(val) => setData('vision', val)}
                                                placeholder="Tuliskan visi di sini..."
                                            />
                                            {errors.vision && <p className="text-xs text-destructive">{errors.vision}</p>}
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Misi Kami</Label>
                                            <RichEditor
                                                value={data.mission}
                                                onChange={(val) => setData('mission', val)}
                                                placeholder="Tuliskan misi di sini..."
                                            />
                                            {errors.mission && <p className="text-xs text-destructive">{errors.mission}</p>}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3">
                            <Link href="/admin/settings">
                                <Button type="button" variant="outline" disabled={processing}>
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing} className="px-8">
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
