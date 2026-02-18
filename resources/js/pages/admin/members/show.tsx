import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CreditCard, History, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';

interface Member extends User {
    member_profile: {
        package_type: string;
        package_status: string;
        career_level: string;
        pin_code?: string;
        activated_at: string;
        left_pp_total: number;
        right_pp_total: number;
        left_rp_total: number;
        right_rp_total: number;
        parent_id?: number;
        leg_position?: string;
    };
    wallet?: {
        balance: number;
    };
}

interface Props {
    member: Member;
}

export default function MemberShow({ member }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Manajemen Member',
            href: '/admin/members',
        },
        {
            title: member.name,
            href: `/admin/members/${member.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Member: ${member.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/members">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{member.name}</h1>
                        <p className="text-muted-foreground">{member.referral_code} | Joined {new Date(member.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/members/${member.id}/edit`}>Edit Member</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Paket</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold uppercase">{member.member_profile?.package_type || '-'}</div>
                            <p className="text-xs text-muted-foreground uppercase">{member.member_profile?.package_status}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Level Karir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold uppercase">{member.member_profile?.career_level || '-'}</div>
                            <p className="text-xs text-muted-foreground">Level saat ini</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Saldo Wallet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Rp {new Intl.NumberFormat('id-ID').format(member.wallet?.balance || 0)}</div>
                            <p className="text-xs text-muted-foreground text-green-600">Saldo saat ini</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList>
                        <TabsTrigger value="info">Info Pribadi</TabsTrigger>
                        <TabsTrigger value="network">Jaringan</TabsTrigger>
                        <TabsTrigger value="points">Poin (PP/RP)</TabsTrigger>
                        <TabsTrigger value="history">Riwayat Bonus</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Pribadi</CardTitle>
                                <CardDescription>Detail profil dan akun member.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                                    <p>{member.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Kode Referral</p>
                                    <p className="font-mono font-semibold">{member.referral_code}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <p>{member.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">No. Telepon</p>
                                    <p>{member.phone || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Kode Referral</p>
                                    <p>{member.referral_code || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">ID Sponsor</p>
                                    <p>{member.sponsor_id || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="network" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Posisi Jaringan</CardTitle>
                                <CardDescription>Informasi penempatan dalam binary tree.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Parent ID</p>
                                    <p>{member.member_profile?.parent_id || 'Root'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Posisi Kaki</p>
                                    <p className="uppercase">{member.member_profile?.leg_position || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="points" className="mt-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pairing Points (PP)</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 border rounded bg-slate-50">
                                        <p className="text-xs text-muted-foreground">Kiri</p>
                                        <p className="text-xl font-bold">{member.member_profile?.left_pp_total}</p>
                                    </div>
                                    <div className="text-center p-4 border rounded bg-slate-50">
                                        <p className="text-xs text-muted-foreground">Kanan</p>
                                        <p className="text-xl font-bold">{member.member_profile?.right_pp_total}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reward Points (RP)</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 border rounded bg-slate-50">
                                        <p className="text-xs text-muted-foreground">Kiri</p>
                                        <p className="text-xl font-bold">{member.member_profile?.left_rp_total}</p>
                                    </div>
                                    <div className="text-center p-4 border rounded bg-slate-50">
                                        <p className="text-xs text-muted-foreground">Kanan</p>
                                        <p className="text-xl font-bold">{member.member_profile?.right_rp_total}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="mt-4 text-center py-10">
                        <History className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                        <p className="mt-2 text-muted-foreground">Riwayat bonus akan ditampilkan di sini.</p>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
