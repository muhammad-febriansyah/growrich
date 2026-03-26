import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, History, Package, Trash2 } from 'lucide-react';
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
        is_stockist: boolean;
        stockist_level: string | null;
        stockist_parent_id: number | null;
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
    const isRoot = !member.member_profile?.parent_id;

    function handleDelete() {
        if (!confirm(`PERHATIAN: Tindakan ini tidak dapat dibatalkan!\n\nHapus member "${member.name}" beserta seluruh data terkait (bonus, poin, wallet, dll)?\n\nKetik OK untuk melanjutkan.`)) {
            return;
        }
        router.delete(`/admin/members/${member.id}`);
    }

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
                        <p className="text-muted-foreground">{member.member_id ?? member.referral_code} | Joined {new Date(member.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/admin/members/${member.id}/edit`}>Edit Member</Link>
                        </Button>
                        {!isRoot && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Member
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
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
                    <Card className={member.member_profile?.is_stockist ? 'border-violet-300 bg-violet-50/40' : ''}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                                <Package className="h-4 w-4" />
                                Level Stokis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <div>
                                {member.member_profile?.stockist_level ? (
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
                                        member.member_profile.stockist_level === 'center'
                                            ? 'border-violet-300 bg-violet-100 text-violet-700'
                                            : member.member_profile.stockist_level === 'point'
                                                ? 'border-blue-300 bg-blue-100 text-blue-700'
                                                : 'border-orange-300 bg-orange-100 text-orange-700'
                                    }`}>
                                        ✦ {{
                                            center: 'Stockist Center',
                                            point: 'Stockist Point',
                                            sub: 'Sub Stockist',
                                        }[member.member_profile.stockist_level]}
                                    </span>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Bukan Stokis</span>
                                )}
                            </div>
                            <select
                                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                                value={member.member_profile?.stockist_level ?? ''}
                                onChange={(e) => {
                                    const level = e.target.value || null;
                                    const label = level
                                        ? { center: 'Stockist Center', point: 'Stockist Point', sub: 'Sub Stockist' }[level]
                                        : 'Bukan Stokis';
                                    if (confirm(`Ubah level stokis ${member.name} menjadi "${label}"?`)) {
                                        router.post(`/admin/members/${member.id}/set-stockist-level`, {
                                            stockist_level: level,
                                        });
                                    }
                                }}
                            >
                                <option value="">— Bukan Stokis —</option>
                                <option value="center">Stockist Center</option>
                                <option value="point">Stockist Point</option>
                                <option value="sub">Sub Stockist</option>
                            </select>
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
                                    <p className="text-sm font-medium text-muted-foreground">Nomor ID Member</p>
                                    <p className="font-mono font-semibold">{member.member_id ?? member.referral_code}</p>
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
                                    <p className="text-sm font-medium text-muted-foreground">Nomor ID Member</p>
                                    <p>{member.member_id ?? member.referral_code ?? '-'}</p>
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
