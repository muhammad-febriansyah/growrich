import { Head, useForm } from '@inertiajs/react';
import { UserPlus, Key, User, Layout, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Pin {
    id: number;
    pin_code: string;
    package_type: string;
    price: number;
}

interface Props {
    myPins: Pin[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Registrasi Member', href: '/member/register' },
];

export default function RegistrationIndex({ myPins }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        pin_code: myPins.length === 1 ? myPins[0].pin_code : '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        leg_position: 'left' as 'left' | 'right',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/member/register', {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrasi Member Baru" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Daftarkan Member Baru</h1>
                    <p className="text-muted-foreground">Gunakan Registration PIN untuk mendaftarkan mitra baru di jaringan Anda.</p>
                </div>

                <form onSubmit={submit} className="space-y-6 w-full">
                    {/* PIN Section */}
                    <Card className="border-primary/20 shadow-sm bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Key className="h-4 w-4 text-primary" /> Validasi PIN Registrasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myPins.length === 0 ? (
                                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                    Anda belum memiliki PIN yang tersedia. Hubungi admin untuk mendapatkan PIN registrasi.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="pin_code">Pilih PIN</Label>
                                    <Select
                                        value={data.pin_code}
                                        onValueChange={(v) => setData('pin_code', v)}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Pilih PIN yang akan digunakan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {myPins.map((pin) => (
                                                <SelectItem key={pin.id} value={pin.pin_code} className="group">
                                                    <div className="flex items-center gap-2">
                                                        <code className="font-mono font-bold text-sm">{pin.pin_code}</code>
                                                        <Badge variant="outline" className="text-[10px] font-bold uppercase group-focus:border-white/50 group-focus:text-white">
                                                            {pin.package_type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground group-focus:text-white/70">
                                                            Rp {new Intl.NumberFormat('id-ID').format(pin.price)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.pin_code && <p className="text-xs text-destructive">{errors.pin_code}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <User className="h-4 w-4" /> Data Akun Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Nama sesuai KTP"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="budi@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 8 karakter"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowPassword(v => !v)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Ulangi password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Network Placement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Layout className="h-4 w-4" /> Penempatan Jaringan
                            </CardTitle>
                            <CardDescription>Pilih posisi kaki untuk member baru ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={data.leg_position}
                                onValueChange={(val) => setData('leg_position', val as 'left' | 'right')}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="left" id="left" className="peer sr-only" />
                                    <Label
                                        htmlFor="left"
                                        className="group flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="text-sm font-bold uppercase">Kaki Kiri</span>
                                        <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-accent-foreground">Placement di sisi kiri jaringan</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="right" id="right" className="peer sr-only" />
                                    <Label
                                        htmlFor="right"
                                        className="group flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="text-sm font-bold uppercase">Kaki Kanan</span>
                                        <span className="text-xs text-muted-foreground mt-1 text-center group-hover:text-accent-foreground">Placement di sisi kanan jaringan</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                            {errors.leg_position && <p className="text-xs text-destructive mt-2">{errors.leg_position}</p>}
                        </CardContent>
                    </Card>

                    <Button type="submit" className="w-full h-12 text-lg" disabled={processing || myPins.length === 0}>
                        <UserPlus className="mr-2 h-5 w-5" /> Daftarkan Member
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
