import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, Save, User as UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';

interface Props {
    user: User;
}

export default function ProfileEdit({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profil', href: '/member/profile' },
        { title: 'Edit Profil', href: '/member/profile/edit' },
    ];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar ?? null);

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        email: string;
        phone: string;
        avatar: File | null;
        _method: string;
    }>({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: null,
        _method: 'PUT',
    });

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/profile');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Profil" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto text-foreground">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/member/profile">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Ubah Data Diri</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Foto Profil */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Foto Profil</CardTitle>
                            <CardDescription>Foto akan ditampilkan di profil dan diagram jaringan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-slate-100 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserIcon className="h-12 w-12 text-slate-400" />
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Pilih Foto
                                    </Button>
                                    <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP. Maks. 2 MB.</p>
                                    {errors.avatar && <p className="text-sm text-destructive">{errors.avatar}</p>}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Pribadi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pribadi</CardTitle>
                            <CardDescription>Pastikan data yang Anda masukkan sudah benar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
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
                                    placeholder="email@contoh.com"
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">No. WhatsApp / Telepon</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="Contoh: 08123456789"
                                />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild disabled={processing}>
                            <Link href="/member/profile">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
