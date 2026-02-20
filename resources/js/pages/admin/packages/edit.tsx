import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputRupiah } from '@/components/ui/input-rupiah';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Package {
    id: number;
    key: string;
    name: string;
    sort_order: number;
    pairing_point: number;
    reward_point: number;
    max_pairing_per_day: number;
    registration_price: number;
    upgrade_price: number | null;
    sponsor_bonus_unit: number;
    leveling_bonus_amount: number;
}

interface Props {
    package: Package;
}

type FormData = {
    key: string;
    name: string;
    sort_order: number;
    pairing_point: number;
    reward_point: number;
    max_pairing_per_day: number;
    registration_price: number;
    upgrade_price: number | null;
    sponsor_bonus_unit: number;
    leveling_bonus_amount: number;
};

export default function PackageEdit({ package: pkg }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Paket', href: '/admin/packages' },
        { title: `Edit ${pkg.name}`, href: `/admin/packages/${pkg.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        key: pkg.key,
        name: pkg.name,
        sort_order: pkg.sort_order,
        pairing_point: pkg.pairing_point,
        reward_point: pkg.reward_point,
        max_pairing_per_day: pkg.max_pairing_per_day,
        registration_price: pkg.registration_price,
        upgrade_price: pkg.upgrade_price,
        sponsor_bonus_unit: pkg.sponsor_bonus_unit,
        leveling_bonus_amount: pkg.leveling_bonus_amount,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/packages/${pkg.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Paket ${pkg.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/packages">
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Edit Paket: {pkg.name}</h1>
                        <p className="text-sm text-muted-foreground">Perbarui konfigurasi paket MLM. Cache akan di-refresh otomatis.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Identitas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Identitas Paket</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="key">Key (unik)</Label>
                                        <Input
                                            id="key"
                                            value={data.key}
                                            onChange={(e) => setData('key', e.target.value)}
                                            className="font-mono"
                                        />
                                        {errors.key && <p className="text-xs text-destructive">{errors.key}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Tampilan</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order">Sort Order (urutan tier)</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="1"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 1)}
                                        className="w-32"
                                    />
                                    {errors.sort_order && <p className="text-xs text-destructive">{errors.sort_order}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* MLM Config */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Konfigurasi MLM</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="pairing_point">Pairing Point (PP)</Label>
                                        <Input
                                            id="pairing_point"
                                            type="number"
                                            min="0"
                                            value={data.pairing_point}
                                            onChange={(e) => setData('pairing_point', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.pairing_point && <p className="text-xs text-destructive">{errors.pairing_point}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="reward_point">Reward Point (RP)</Label>
                                        <Input
                                            id="reward_point"
                                            type="number"
                                            min="0"
                                            value={data.reward_point}
                                            onChange={(e) => setData('reward_point', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.reward_point && <p className="text-xs text-destructive">{errors.reward_point}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="max_pairing_per_day">Max Pair/Hari</Label>
                                        <Input
                                            id="max_pairing_per_day"
                                            type="number"
                                            min="1"
                                            value={data.max_pairing_per_day}
                                            onChange={(e) => setData('max_pairing_per_day', parseInt(e.target.value) || 1)}
                                        />
                                        {errors.max_pairing_per_day && <p className="text-xs text-destructive">{errors.max_pairing_per_day}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="sponsor_bonus_unit">Sponsor Bonus Unit (per level)</Label>
                                    <InputRupiah
                                        id="sponsor_bonus_unit"
                                        value={data.sponsor_bonus_unit}
                                        onChange={(v) => setData('sponsor_bonus_unit', v)}
                                    />
                                    {errors.sponsor_bonus_unit && <p className="text-xs text-destructive">{errors.sponsor_bonus_unit}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="leveling_bonus_amount">Leveling Bonus Amount</Label>
                                    <InputRupiah
                                        id="leveling_bonus_amount"
                                        value={data.leveling_bonus_amount}
                                        onChange={(v) => setData('leveling_bonus_amount', v)}
                                    />
                                    {errors.leveling_bonus_amount && <p className="text-xs text-destructive">{errors.leveling_bonus_amount}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Harga */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Harga</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="registration_price">Harga Pendaftaran</Label>
                                    <InputRupiah
                                        id="registration_price"
                                        value={data.registration_price}
                                        onChange={(v) => setData('registration_price', v)}
                                    />
                                    {errors.registration_price && <p className="text-xs text-destructive">{errors.registration_price}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="upgrade_price">
                                        Harga Upgrade
                                        <span className="ml-1 text-xs text-muted-foreground">(kosongkan jika tier tertinggi)</span>
                                    </Label>
                                    <InputRupiah
                                        id="upgrade_price"
                                        value={data.upgrade_price ?? 0}
                                        onChange={(v) => setData('upgrade_price', v === 0 ? null : v)}
                                    />
                                    {errors.upgrade_price && <p className="text-xs text-destructive">{errors.upgrade_price}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                        <Link href="/admin/packages">
                            <Button type="button" variant="outline">Batal</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
