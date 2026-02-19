import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, MoveVertical } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    features: {
        data: Feature[];
        total: number;
    };
    filters: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Fitur', href: '/admin/features' },
];

export default function FeatureIndex({ features, filters }: Props) {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get('/admin/features', { search: e.target.value }, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus fitur ini?')) {
            router.delete(`/admin/features/${id}`);
        }
    };

    const renderIcon = (iconName: string) => {
        const LucideIcon = (Icons as any)[iconName];
        return LucideIcon ? <LucideIcon className="h-5 w-5" /> : <Icons.HelpCircle className="h-5 w-5" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Fitur" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Fitur Unggulan</h1>
                        <p className="text-sm text-muted-foreground">Kelola fitur-fitur yang ditampilkan pada halaman utama.</p>
                    </div>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/admin/features/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Fitur
                        </Link>
                    </Button>
                </div>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari judul fitur..."
                                    className="pl-9"
                                    defaultValue={filters.search}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-slate-50/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Urutan</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Ikon</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Judul</th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">Deskripsi</th>
                                        <th className="px-4 py-3 text-center font-medium text-slate-600">Status</th>
                                        <th className="px-4 py-3 text-right font-medium text-slate-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {features.data.map((feature) => (
                                        <tr key={feature.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <Badge variant="outline" className="font-mono">
                                                    #{feature.sort_order}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary w-fit">
                                                    {renderIcon(feature.icon)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-medium text-slate-900">{feature.title}</td>
                                            <td className="px-4 py-4 text-slate-500 max-w-md truncate">
                                                {feature.description}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {feature.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                        <CheckCircle className="h-3 w-3" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                                        <XCircle className="h-3 w-3" /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                        <Link href={`/admin/features/${feature.id}/edit`}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                                                        onClick={() => handleDelete(feature.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {features.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                                                Tidak ada fitur ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
