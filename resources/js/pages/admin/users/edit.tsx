import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

interface Props {
    user: User;
}

export default function AdminEdit({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Admin', href: '/admin/users' },
        { title: 'Edit Admin', href: `/admin/users/${user.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Admin: ${user.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 truncate flex-1">Edit: {user.name}</h1>
                </div>

                <form onSubmit={submit}>
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg">Detail Administrator</CardTitle>
                            <CardDescription>Perbarui informasi profil administrator.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">No. HP / Telepon</Label>
                                    <Input
                                        id="phone"
                                        placeholder="628123456789"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-slate-50/50 border-t flex justify-end gap-3">
                            <Button variant="outline" asChild>
                                <Link href="/admin/users">Batal</Link>
                            </Button>
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
