import { Head, Link } from '@inertiajs/react';
import { CreditCard, Edit, Mail, Phone, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';

interface Member extends User {
    member_profile: {
        package_type: string;
        package_status: string;
        career_level: string;
        referral_code: string;
    };
    wallet?: {
        balance: number;
    };
}

interface ContactInfo {
    name: string;
    member_id: string;
    phone: string | null;
}

interface Props {
    user: Member;
    sponsor: ContactInfo | null;
    upline: ContactInfo | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil', href: '/member/profile' },
];

export default function ProfileIndex({ user, sponsor, upline }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Profil Member</h1>
                        <p className="text-muted-foreground">Lihat informasi akun dan status keanggotaan Anda.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/member/profile/edit">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profil
                        </Link>
                    </Button>
                </div>

                {/* Avatar + Info Akun + Keanggotaan */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Info Akun */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>Detail utama profil Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6 md:flex-row">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-slate-100 flex items-center justify-center">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-12 w-12 text-slate-400" />
                                    )}
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/member/profile/edit">Ganti Foto</Link>
                                </Button>
                            </div>

                            {/* Fields */}
                            <div className="grid flex-1 gap-4 md:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <UserIcon className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <ShieldCheck className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nomor ID Member</p>
                                        <p className="font-medium font-mono">{user.member_id ?? user.referral_code}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <Mail className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <Phone className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">No. Telepon</p>
                                        <p className="font-medium">{user.phone || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Keanggotaan */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Keanggotaan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Paket Aktif</p>
                                <Badge className="uppercase">{user.member_profile?.package_type}</Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Level Karir</p>
                                <p className="font-bold underline decoration-primary">{user.member_profile?.career_level}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 uppercase">
                                    {user.member_profile?.package_status === 'active' ? 'Aktif' : user.member_profile?.package_status}
                                </Badge>
                            </div>
                            <div className="pt-2 border-t mt-2">
                                <p className="text-xs text-muted-foreground">Nomor ID Member</p>
                                <code className="block p-2 bg-slate-50 border rounded mt-1 font-mono text-sm">
                                    {user.member_id ?? user.referral_code}
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sponsor & Upline */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Informasi Sponsor</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {sponsor ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama Sponsor</p>
                                        <p className="font-medium">{sponsor.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nomor ID Sponsor</p>
                                        <p className="font-mono text-sm font-medium">{sponsor.member_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">No. Telepon Sponsor</p>
                                        <p className="font-medium">{sponsor.phone || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada data sponsor.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <CardTitle>Informasi Upline</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {upline ? (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama Upline</p>
                                        <p className="font-medium">{upline.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nomor ID Upline</p>
                                        <p className="font-mono text-sm font-medium">{upline.member_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">No. Telepon Upline</p>
                                        <p className="font-medium">{upline.phone || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Tidak ada data upline.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Wallet */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">Saldo Tersedia</p>
                                        <h3 className="text-2xl font-bold">Rp {new Intl.NumberFormat('id-ID').format(user.wallet?.balance || 0)}</h3>
                                    </div>
                                </div>
                                <Button asChild size="sm">
                                    <Link href="/member/wallet">Withdraw</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
