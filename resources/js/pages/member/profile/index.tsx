import { Head, Link } from '@inertiajs/react';
import { CreditCard, Edit, Mail, Phone, ShieldCheck, User as UserIcon } from 'lucide-react';
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

interface Props {
    user: Member;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Profil Saya', href: '/member/profile' },
];

export default function ProfileIndex({ user }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil Saya" />

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

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Informasi Akun</CardTitle>
                            <CardDescription>Detail utama profil Anda.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
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
                                    <p className="text-xs text-muted-foreground">Kode Referral</p>
                                    <p className="font-medium font-mono">{user.referral_code}</p>
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
                        </CardContent>
                    </Card>

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
                                <p className="text-xs text-muted-foreground">Referral Code</p>
                                <code className="block p-2 bg-slate-50 border rounded mt-1 font-mono text-sm">
                                    {user.referral_code}
                                </code>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
