import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';

interface Member extends User {
    member_profile: {
        package_type: string;
        package_status: string;
        career_level: string;
    };
}

interface Props {
    member: Member;
}

export default function MemberEdit({ member }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Member', href: '/admin/members' },
        { title: member.name, href: `/admin/members/${member.id}` },
        { title: 'Edit', href: `/admin/members/${member.id}/edit` },
    ];

    interface MemberForm {
        status: string;
        package_type: string;
        career_level: string;
        role: string;
    }

    const { data, setData, put, processing, errors } = useForm<MemberForm>({
        status: member.status || 'active',
        package_type: member.member_profile?.package_type || 'bronze',
        career_level: member.member_profile?.career_level || 'member',
        role: member.role || 'member',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/members/${member.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Member: ${member.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/members/${member.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Member</h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Akun</CardTitle>
                            <CardDescription>Ubah status dan otorisasi member.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status Akun</Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(v) => setData('status', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                        <SelectItem value="suspended">Ditangguhkan</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role Otoritas</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(v) => setData('role', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Keanggotaan MLM</CardTitle>
                            <CardDescription>Sesuaikan paket dan level karir secara manual.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="package_type">Paket Member</Label>
                                <Select
                                    value={data.package_type}
                                    onValueChange={(v) => setData('package_type', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bronze">Bronze</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                        <SelectItem value="gold">Gold</SelectItem>
                                        <SelectItem value="platinum">Platinum</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.package_type && <p className="text-sm text-destructive">{errors.package_type}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="career_level">Level Karir</Label>
                                <Select
                                    value={data.career_level}
                                    onValueChange={(v) => setData('career_level', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="bronze_executive">Bronze Executive</SelectItem>
                                        <SelectItem value="silver_executive">Silver Executive</SelectItem>
                                        <SelectItem value="gold_executive">Gold Executive</SelectItem>
                                        <SelectItem value="platinum_executive">Platinum Executive</SelectItem>
                                        <SelectItem value="diamond">Diamond</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.career_level && <p className="text-sm text-destructive">{errors.career_level}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild disabled={processing}>
                            <Link href={`/admin/members/${member.id}`}>Batal</Link>
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
