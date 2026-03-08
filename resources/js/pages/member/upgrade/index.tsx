import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle, Info, Key, Package, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface UpgradePin {
    id: number;
    pin_code: string;
    package_type: string;
    upgrade_from: string;
}

interface PossibleUpgrade {
    value: string;
    label: string;
    fromPackage: string;
    toPackage: string;
    price: number;
}

interface Props {
    currentPackage: string;
    availableUpgradePins: UpgradePin[];
    possibleUpgrades: PossibleUpgrade[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Upgrade Paket', href: '/member/upgrade' },
];

const packageIcons: Record<string, React.ElementType> = {
    Silver: Package,
    Gold: ShieldCheck,
    Platinum: Sparkles,
};

const packageBenefits: Record<string, string[]> = {
    Silver: ['Max 10 pair/hari', '1 PP per registrasi', 'Sponsor Bonus'],
    Gold: ['Max 20 pair/hari', '2 PP per registrasi', 'Sponsor Bonus + RP'],
    Platinum: ['Max 30 pair/hari', '3 PP per registrasi', 'Sponsor Bonus + 2 RP'],
};

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function UpgradePage({ currentPackage, availableUpgradePins, possibleUpgrades }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        pin_code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/upgrade');
    };

    const isPlatinum = currentPackage === 'Platinum';
    const CurrentIcon = packageIcons[currentPackage] ?? Package;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upgrade Paket" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Upgrade Paket</h1>
                    <p className="text-sm text-muted-foreground">Tingkatkan paket Anda untuk mendapatkan lebih banyak keuntungan.</p>
                </div>

                {/* Current Package */}
                <Card className="relative overflow-hidden border-0 shadow-md">
                    <div className="bg-gradient-to-br from-primary to-brand-700 p-5 text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                <CurrentIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Paket Saat Ini</p>
                                <h2 className="text-2xl font-extrabold leading-tight">{currentPackage}</h2>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-10">
                            <CurrentIcon className="h-24 w-24" />
                        </div>
                    </div>
                    <CardContent className="p-4">
                        <ul className="space-y-2">
                            {(packageBenefits[currentPackage] ?? []).map((b) => (
                                <li key={b} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Platinum already */}
                {isPlatinum && (
                    <Card className="flex items-center justify-center p-8 border-dashed border-primary/30 bg-primary/5">
                        <div className="text-center">
                            <div className="flex h-14 w-14 mx-auto mb-3 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle className="h-7 w-7 text-primary" />
                            </div>
                            <p className="font-semibold text-foreground">Anda sudah di level tertinggi!</p>
                            <p className="text-sm text-muted-foreground mt-1">Paket Platinum adalah paket terbaik.</p>
                        </div>
                    </Card>
                )}

                {/* Upgrade Form */}
                {!isPlatinum && (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-primary" />
                                Masukkan PIN Upgrade
                            </CardTitle>
                            <CardDescription>
                                Masukkan kode PIN upgrade Anda untuk langsung mengupgrade paket tanpa menunggu persetujuan admin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                {/* Available PINs quick-fill */}
                                {availableUpgradePins.length > 0 && (
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">PIN Upgrade Tersedia</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableUpgradePins.map((pin) => (
                                                <button
                                                    key={pin.id}
                                                    type="button"
                                                    onClick={() => setData('pin_code', pin.pin_code)}
                                                    className={`rounded-md border px-3 py-1.5 text-xs font-mono font-bold transition-all ${
                                                        data.pin_code === pin.pin_code
                                                            ? 'border-primary bg-primary text-primary-foreground'
                                                            : 'border-primary/30 bg-white text-slate-700 hover:border-primary hover:bg-primary/10'
                                                    }`}
                                                >
                                                    {pin.pin_code}
                                                    <span className="ml-1.5 opacity-60">→ {pin.package_type}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">Klik PIN di atas untuk mengisi otomatis, atau ketik manual di bawah.</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="pin_code">Kode PIN Upgrade <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="pin_code"
                                        placeholder="Contoh: UPIN-ABCD1234"
                                        value={data.pin_code}
                                        onChange={(e) => setData('pin_code', e.target.value.toUpperCase())}
                                        className="font-mono"
                                    />
                                    {errors.pin_code && (
                                        <p className="text-xs text-destructive">{errors.pin_code}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={processing || !data.pin_code} className="w-full sm:w-auto">
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Upgrade Sekarang
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Possible Upgrade Paths Info */}
                {!isPlatinum && possibleUpgrades.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
                                <Info className="h-4 w-4" />
                                Jalur Upgrade Tersedia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {possibleUpgrades.map((upgrade) => {
                                const TargetIcon = packageIcons[upgrade.toPackage] ?? Package;
                                return (
                                    <div key={upgrade.value} className="flex items-center justify-between rounded-lg border border-blue-200 bg-white px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <TargetIcon className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">{upgrade.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-blue-700">{fmt(upgrade.price)}</span>
                                    </div>
                                );
                            })}
                            {availableUpgradePins.length === 0 && (
                                <p className="text-xs text-blue-700 mt-2">
                                    Belum memiliki PIN upgrade? Pesan melalui halaman{' '}
                                    <a href="/member/pin-orders" className="font-semibold underline hover:no-underline">
                                        Order PIN
                                    </a>
                                    .
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
