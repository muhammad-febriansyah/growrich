import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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

const packageColors: Record<string, string> = {
    Silver: 'from-slate-400 to-slate-600',
    Gold: 'from-amber-400 to-amber-600',
    Platinum: 'from-violet-400 to-violet-600',
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-0 shadow-md">
                        <div className={`bg-gradient-to-br ${packageColors[currentPackage] ?? 'from-gray-400 to-gray-600'} p-6 text-white`}>
                            <div className="flex items-center gap-3">
                                <Package className="h-8 w-8" />
                                <div>
                                    <p className="text-sm opacity-80">Paket Saat Ini</p>
                                    <h2 className="text-2xl font-bold">{currentPackage}</h2>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <ul className="space-y-2">
                                {(packageBenefits[currentPackage] ?? []).map((b) => (
                                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {nextPackage ? (
                        <Card className="overflow-hidden border-2 border-primary/30 shadow-md">
                            <div className={`bg-gradient-to-br ${packageColors[nextPackage] ?? 'from-gray-400 to-gray-600'} p-6 text-white`}>
                                <div className="flex items-center gap-3">
                                    <Package className="h-8 w-8" />
                                    <div>
                                        <p className="text-sm opacity-80">Upgrade ke</p>
                                        <h2 className="text-2xl font-bold">{nextPackage}</h2>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <ul className="space-y-2 mb-4">
                                    {(packageBenefits[nextPackage] ?? []).map((b) => (
                                        <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                {upgradePrice && (
                                    <p className="text-sm font-semibold text-primary">
                                        Harga Upgrade: Rp {new Intl.NumberFormat('id-ID').format(upgradePrice)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="flex items-center justify-center p-8 border-dashed">
                            <div className="text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                                <p className="font-semibold">Anda sudah di level tertinggi!</p>
                                <p className="text-sm">Paket Platinum adalah paket terbaik.</p>
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
