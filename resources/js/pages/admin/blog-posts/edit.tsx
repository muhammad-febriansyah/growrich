import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import RichEditor from '@/components/rich-editor';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    thumbnail: string | null;
    thumbnail_url: string | null;
    is_published: boolean;
}

interface Props {
    post: BlogPost;
}

export default function BlogEdit({ post: blogPost }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Blog', href: '/admin/blog-posts' },
        { title: 'Edit Artikel', href: `/admin/blog-posts/${blogPost.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: blogPost.title,
        content: blogPost.content,
        excerpt: blogPost.excerpt || '',
        thumbnail: null as File | null,
        is_published: blogPost.is_published,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(blogPost.thumbnail_url);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeThumbnail = () => {
        setData('thumbnail', null);
        setPreviewUrl(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading files, we use POST with _method PUT (Standard Laravel/Inertia quirk for multipart updates)
        post(`/admin/blog-posts/${blogPost.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Artikel: ${blogPost.title}`} />

            <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/blog-posts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate">Edit: {blogPost.title}</h1>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Utama</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Artikel</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ketik judul artikel..."
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={errors.title ? 'border-destructive' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Isi Konten</Label>
                                    <RichEditor
                                        value={data.content}
                                        onChange={(val) => setData('content', val)}
                                    />
                                    {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan / Deskripsi Singkat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Ringkasan Artikel</Label>
                                    <RichEditor
                                        value={data.excerpt}
                                        onChange={(val) => setData('excerpt', val)}
                                        placeholder="Ringkasan singkat..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publikasi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Terbitkan</Label>
                                        <p className="text-sm text-muted-foreground">Aktifkan untuk publikasi umum.</p>
                                    </div>
                                    <Switch
                                        checked={data.is_published}
                                        onCheckedChange={(val) => setData('is_published', val)}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Perubahan
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Thumbnail</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div
                                    className={`relative aspect-video rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${previewUrl ? 'border-primary/20 bg-primary/5' : 'border-gray-200 hover:border-primary/40'}`}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img src={previewUrl} className="size-full object-cover" alt="Preview" />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                                                onClick={removeThumbnail}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full justify-center">
                                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div className="text-center font-semibold text-primary">Upload Thumbnail</div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
                                        </label>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
