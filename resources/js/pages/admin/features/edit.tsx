import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Feature {
    id: number;
    icon: string;
    title: string;
    description: string;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    feature: Feature;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Fitur', href: '/admin/features' },
    { title: 'Edit Fitur', href: '#' },
];

const AVAILABLE_ICONS = [
    'Target', 'Zap', 'Trophy', 'ShieldCheck', 'Star', 'Users', 'DollarSign', 'Box', 'BarChart', 'Heart',
    'Smartphone', 'Globe', 'Lock', 'Gift', 'Clock', 'Award', 'CheckCircle', 'TrendingUp', 'Layers'
];

export default function FeatureEdit({ feature }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        icon: feature.icon,
        title: feature.title,
        description: feature.description,
        is_active: feature.is_active,
        sort_order: feature.sort_order,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/features/${feature.id}`);
    };

    const renderIcon = (iconName: string) => {
        const LucideIcon = (Icons as any)[iconName];
        return LucideIcon ? <LucideIcon className="h-6 w-6" /> : <Icons.HelpCircle className="h-6 w-6" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Fitur: ${feature.title}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/features">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Fitur Unggulan</h1>
                </div>

                <form onSubmit={submit}>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Informasi Fitur</CardTitle>
                            <CardDescription>Perbarui detail fitur unggulan.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <Label>Pilih Ikon</Label>
                                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                                    {AVAILABLE_ICONS.map((iconName) => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setData('icon', iconName)}
                                            className={`p-3 rounded-lg flex items-center justify-center transition-all border-2 ${data.icon === iconName
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-slate-100 hover:border-slate-200 text-slate-500'
                                                }`}
                                        >
                                            {renderIcon(iconName)}
                                        </button>
                                    ))}
                                </div>
                                {errors.icon && <p className="text-sm text-destructive">{errors.icon}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Fitur</Label>
                                    <Input
                                        id="title"
                                        placeholder="Masukkan judul fitur..."
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={errors.title ? 'border-destructive' : ''}
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan Tampil</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                        className={errors.sort_order ? 'border-destructive' : ''}
                                    />
                                    {errors.sort_order && <p className="text-sm text-destructive">{errors.sort_order}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Singkat</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Jelaskan tentang fitur ini..."
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Aktifkan fitur ini</Label>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-slate-50/50 border-t flex justify-end">
                            <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white px-8">
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
