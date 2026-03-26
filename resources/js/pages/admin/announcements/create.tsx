import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import RichEditor from '@/components/rich-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pengumuman', href: '/admin/announcements' },
    { title: 'Buat Pengumuman', href: '/admin/announcements/create' },
];

export default function AnnouncementCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        type: 'info',
        is_pinned: false,
        is_active: true,
        expires_at: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/announcements');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pengumuman" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/announcements">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Buat Pengumuman
                    </h1>
                </div>

                <form
                    onSubmit={submit}
                    className="grid grid-cols-1 gap-6 lg:grid-cols-3"
                >
                    {/* Left: main content */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Pengumuman</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Judul pengumuman"
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
                                    <Label>Konten</Label>
                                    <RichEditor
                                        value={data.content}
                                        onChange={(val) =>
                                            setData('content', val)
                                        }
                                        placeholder="Tulis isi pengumuman di sini..."
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

                    {/* Right: settings */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Tipe</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) =>
                                            setData('type', v)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.type
                                                    ? 'border-destructive'
                                                    : ''
                                            }
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="info">
                                                Info
                                            </SelectItem>
                                            <SelectItem value="promo">
                                                Promo
                                            </SelectItem>
                                            <SelectItem value="warning">
                                                Peringatan
                                            </SelectItem>
                                            <SelectItem value="system">
                                                Sistem
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-destructive">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expires_at">
                                        Kedaluwarsa (opsional)
                                    </Label>
                                    <Input
                                        id="expires_at"
                                        type="datetime-local"
                                        value={data.expires_at}
                                        onChange={(e) =>
                                            setData(
                                                'expires_at',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.expires_at && (
                                        <p className="text-sm text-destructive">
                                            {errors.expires_at}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            Sematkan di Atas
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Tampil paling atas di list.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_pinned}
                                        onCheckedChange={(v) =>
                                            setData('is_pinned', v)
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">
                                            Aktif
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Langsung dipublikasikan.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(v) =>
                                            setData('is_active', v)
                                        }
                                    />
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        <Save className="size-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => history.back()}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
