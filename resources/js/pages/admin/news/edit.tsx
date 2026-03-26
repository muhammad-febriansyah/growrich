import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import RichEditor from '@/components/rich-editor';

interface NewsCategory {
    id: number;
    title: string;
}

interface NewsItem {
    id: number;
    title: string;
    content: string;
    thumbnail: string | null;
    thumbnail_url: string | null;
    is_published: boolean;
    news_category_id: number | null;
}

interface Props {
    news: NewsItem;
    categories: NewsCategory[];
}

export default function NewsEdit({ news: newsItem, categories }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Berita', href: '/admin/news' },
        { title: 'Edit Berita', href: `/admin/news/${newsItem.id}/edit` },
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        news_category_id: newsItem.news_category_id
            ? String(newsItem.news_category_id)
            : '',
        title: newsItem.title,
        content: newsItem.content,
        thumbnail: null as File | null,
        is_published: newsItem.is_published,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(
        newsItem.thumbnail_url,
    );

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
        post(`/admin/news/${newsItem.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Berita: ${newsItem.title}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/news">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">
                        Edit: {newsItem.title}
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Utama</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Berita</Label>
                                    <Input
                                        id="title"
                                        placeholder="Ketik judul berita..."
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        className={
                                            errors.title
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-destructive">
                                            {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Isi Konten</Label>
                                    <RichEditor
                                        value={data.content}
                                        onChange={(val) =>
                                            setData('content', val)
                                        }
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-destructive">
                                            {errors.content}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Kategori</Label>
                                    <Select
                                        value={data.news_category_id}
                                        onValueChange={(val) =>
                                            setData('news_category_id', val)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.news_category_id
                                                    ? 'border-destructive'
                                                    : ''
                                            }
                                        >
                                            <SelectValue placeholder="Pilih kategori..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id}
                                                    value={String(cat.id)}
                                                >
                                                    {cat.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.news_category_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.news_category_id}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            Terbitkan
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Aktifkan untuk publikasi umum.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_published}
                                        onCheckedChange={(val) =>
                                            setData('is_published', val)
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-white hover:bg-primary/90"
                                    disabled={processing}
                                >
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
                                    className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                                        previewUrl
                                            ? 'border-primary/20 bg-primary/5'
                                            : 'border-gray-200 hover:border-primary/40'
                                    }`}
                                >
                                    {previewUrl ? (
                                        <>
                                            <img
                                                src={previewUrl}
                                                className="size-full object-cover"
                                                alt="Preview"
                                            />
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
                                        <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div className="text-center font-semibold text-primary">
                                                Upload Thumbnail
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                            />
                                        </label>
                                    )}
                                </div>
                                {errors.thumbnail && (
                                    <p className="text-sm text-destructive">
                                        {errors.thumbnail}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
