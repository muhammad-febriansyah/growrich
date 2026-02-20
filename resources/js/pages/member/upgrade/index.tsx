import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Package, CheckCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Pin {
    id: number;
    pin_code: string;
    package_type: string;
}

interface PendingRequest {
    id: number;
    current_package: string;
    requested_package: string;
    status: string;
    created_at: string;
}

interface Props {
    currentPackage: string;
    nextPackage: string | null;
    upgradePrice: number | null;
    availablePins: Pin[];
    pendingRequest: PendingRequest | null;
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

export default function UpgradePage({ currentPackage, nextPackage, upgradePrice, availablePins, pendingRequest }: Props) {
    const { data, setData, post, processing } = useForm({
        pin_code: '',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/upgrade');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upgrade Paket" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Upgrade Paket</h1>
                    <p className="text-sm text-muted-foreground">Tingkatkan paket Anda untuk mendapatkan lebih banyak keuntungan.</p>
                </div>

                {/* Current Package */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current */}
                    {(() => {
                        const Icon = packageIcons[currentPackage] ?? Package;
                        return (
                            <Card className="relative overflow-hidden border-0 shadow-md">
                                <div className="bg-gradient-to-br from-primary to-brand-700 p-5 text-primary-foreground">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Paket Saat Ini</p>
                                            <h2 className="text-2xl font-extrabold leading-tight">{currentPackage}</h2>
                                        </div>
                                    </div>
                                    <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-10">
                                        <Icon className="h-24 w-24" />
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
                        );
                    })()}

                    {/* Next / Max */}
                    {nextPackage ? (
                        (() => {
                            const Icon = packageIcons[nextPackage] ?? Package;
                            return (
                                <Card className="relative overflow-hidden border-0 shadow-md">
                                    <div className="bg-gradient-to-br from-pink to-pink-700 p-5 text-pink-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-70">Upgrade ke</p>
                                                <h2 className="text-2xl font-extrabold leading-tight">{nextPackage}</h2>
                                            </div>
                                        </div>
                                        <div className="pointer-events-none absolute -right-4 -bottom-4 opacity-10">
                                            <Icon className="h-24 w-24" />
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <ul className="space-y-2 mb-4">
                                            {(packageBenefits[nextPackage] ?? []).map((b) => (
                                                <li key={b} className="flex items-center gap-2 text-sm">
                                                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                        {upgradePrice && (
                                            <div className="rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
                                                <p className="text-xs text-muted-foreground">Harga Upgrade</p>
                                                <p className="text-base font-bold text-primary">
                                                    Rp {new Intl.NumberFormat('id-ID').format(upgradePrice)}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })()
                    ) : (
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
                </div>

                {/* Pending Request */}
                {pendingRequest && (
                    <Card className="border-amber-200 bg-amber-50">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-amber-800">Permintaan Upgrade Sedang Diproses</p>
                                <p className="text-sm text-amber-700">
                                    Upgrade dari <strong>{pendingRequest.current_package}</strong> ke <strong>{pendingRequest.requested_package}</strong> sedang menunggu persetujuan admin.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upgrade Form */}
                {nextPackage && !pendingRequest && (
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Ajukan Upgrade Paket</CardTitle>
                            <CardDescription>
                                Upgrade dari <strong>{currentPackage}</strong> ke <strong>{nextPackage}</strong>.
                                Jika Anda memiliki PIN upgrade, masukkan di bawah. Jika tidak, admin akan menghubungi Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                {availablePins.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">PIN Upgrade (Opsional)</label>
                                        <select
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={data.pin_code}
                                            onChange={(e) => setData('pin_code', e.target.value)}
                                        >
                                            <option value="">-- Pilih PIN (jika ada) --</option>
                                            {availablePins.map((pin) => (
                                                <option key={pin.id} value={pin.pin_code}>
                                                    {pin.pin_code} ({pin.package_type})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Catatan (Opsional)</label>
                                    <textarea
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                                        placeholder="Tambahkan catatan untuk admin..."
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                </div>

                                <Button type="submit" disabled={processing} className="bg-primary text-white hover:bg-primary/90">
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Ajukan Upgrade ke {nextPackage}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
