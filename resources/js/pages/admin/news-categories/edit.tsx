import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface NewsCategory {
    id: number;
    title: string;
    slug: string;
}

interface Props {
    category: NewsCategory;
}

export default function NewsCategoryEdit({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Kategori Berita', href: '/admin/news-categories' },
        {
            title: 'Edit Kategori',
            href: `/admin/news-categories/${category.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        title: category.title,
        slug: category.slug,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/news-categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Kategori: ${category.title}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/news-categories">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Edit Kategori: {category.title}
                    </h1>
                </div>

                <form onSubmit={submit} className="max-w-xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Nama Kategori</Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Teknologi, Kesehatan..."
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className={
                                        errors.title ? 'border-destructive' : ''
                                    }
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    className={
                                        errors.slug ? 'border-destructive' : ''
                                    }
                                />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-white hover:bg-primary/90"
                                    disabled={processing}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
