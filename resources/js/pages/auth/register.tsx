import { Head, useForm } from '@inertiajs/react';
import { Banknote, Eye, EyeOff, HeartHandshake, Key, Layout, MapPin, User, UserPlus } from 'lucide-react';
import { useState } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        // PIN
        pin_code: '',
        // Data Akun
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        // Data Pribadi
        birth_date: '',
        birth_place: '',
        gender: '',
        marital_status: '',
        nationality: 'Indonesia',
        id_number: '',
        address: '',
        province: '',
        city: '',
        district: '',
        village: '',
        postal_code: '',
        // Rekening Bank
        bank_name: '',
        bank_branch: '',
        bank_account_number: '',
        bank_account_name: '',
        // Data Ahli Waris
        beneficiary_name: '',
        beneficiary_relationship: '',
        beneficiary_id_number: '',
        beneficiary_phone: '',
        // Penempatan Jaringan
        leg_position: 'left' as 'left' | 'right',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onError: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <HomeLayout>
            <Head title="Daftar Member — GrowRich" />

            <PageHeader
                title="Daftar Sebagai Member"
                description="Isi formulir di bawah ini menggunakan PIN registrasi yang Anda terima dari sponsor Anda."
            />

            <section className="bg-white py-14 lg:py-20">
                <div className="container mx-auto max-w-3xl px-4 md:px-6">
                    <form onSubmit={submit} className="flex flex-col gap-6">

                        {/* ── 1. PIN Registrasi ─────────────────────────────── */}
                        <Card className="border-primary/20 bg-primary/5 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Key className="h-4 w-4 text-primary" />
                                    Validasi PIN Registrasi
                                </CardTitle>
                                <CardDescription>
                                    Masukkan kode PIN yang diberikan oleh sponsor Anda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="pin_code">
                                        Kode PIN <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="pin_code"
                                        placeholder="Masukkan kode PIN registrasi"
                                        value={data.pin_code}
                                        onChange={(e) => setData('pin_code', e.target.value.toUpperCase())}
                                        className="bg-white font-mono font-bold tracking-widest uppercase"
                                    />
                                    <FieldError message={errors.pin_code} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 2. Data Akun ──────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4" />
                                    Data Akun
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="name">
                                        Nama Lengkap <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Nama sesuai KTP"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <FieldError message={errors.name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Huruf dan angka, tanpa spasi"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                    />
                                    <FieldError message={errors.username} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@contoh.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <FieldError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        No. HP / Telepon <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        placeholder="08xxxxxxxxxx"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <FieldError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
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
                                            onClick={() => setShowPassword((v) => !v)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Password <span className="text-destructive">*</span>
                                    </Label>
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
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password_confirmation} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 3. Data Pribadi ───────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4" />
                                    Data Pribadi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_place">
                                        Tempat Lahir <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="birth_place"
                                        placeholder="Jakarta"
                                        value={data.birth_place}
                                        onChange={(e) => setData('birth_place', e.target.value)}
                                    />
                                    <FieldError message={errors.birth_place} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">
                                        Tanggal Lahir <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                    />
                                    <FieldError message={errors.birth_date} />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Jenis Kelamin <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.gender} />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Status Pernikahan <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.marital_status} onValueChange={(v) => setData('marital_status', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status pernikahan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                                            <SelectItem value="Menikah">Menikah</SelectItem>
                                            <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                                            <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.marital_status} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nationality">
                                        Kewarganegaraan <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="nationality"
                                        placeholder="Indonesia"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                    />
                                    <FieldError message={errors.nationality} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="id_number">
                                        No. KTP <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="id_number"
                                        placeholder="16 digit NIK"
                                        value={data.id_number}
                                        onChange={(e) => setData('id_number', e.target.value)}
                                    />
                                    <FieldError message={errors.id_number} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 4. Alamat ─────────────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4" />
                                    Alamat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="address">
                                        Alamat Lengkap <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={3}
                                    />
                                    <FieldError message={errors.address} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="province">
                                        Provinsi <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="province"
                                        placeholder="DKI Jakarta"
                                        value={data.province}
                                        onChange={(e) => setData('province', e.target.value)}
                                    />
                                    <FieldError message={errors.province} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">
                                        Kota / Kabupaten <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="city"
                                        placeholder="Jakarta Selatan"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                    />
                                    <FieldError message={errors.city} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="district">
                                        Kecamatan <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="district"
                                        placeholder="Kebayoran Baru"
                                        value={data.district}
                                        onChange={(e) => setData('district', e.target.value)}
                                    />
                                    <FieldError message={errors.district} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="village">
                                        Kelurahan / Desa <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="village"
                                        placeholder="Senayan"
                                        value={data.village}
                                        onChange={(e) => setData('village', e.target.value)}
                                    />
                                    <FieldError message={errors.village} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">
                                        Kode Pos <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="postal_code"
                                        placeholder="12190"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                    />
                                    <FieldError message={errors.postal_code} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 5. Rekening Bank ──────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Banknote className="h-4 w-4" />
                                    Rekening Bank
                                </CardTitle>
                                <CardDescription>Digunakan untuk proses penarikan bonus.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">
                                        Nama Bank <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="bank_name"
                                        placeholder="BCA"
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                    />
                                    <FieldError message={errors.bank_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank_branch">Cabang</Label>
                                    <Input
                                        id="bank_branch"
                                        placeholder="KCP Sudirman"
                                        value={data.bank_branch}
                                        onChange={(e) => setData('bank_branch', e.target.value)}
                                    />
                                    <FieldError message={errors.bank_branch} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank_account_number">
                                        No. Rekening <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="bank_account_number"
                                        placeholder="1234567890"
                                        value={data.bank_account_number}
                                        onChange={(e) => setData('bank_account_number', e.target.value)}
                                    />
                                    <FieldError message={errors.bank_account_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bank_account_name">
                                        Atas Nama <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="bank_account_name"
                                        placeholder="Nama sesuai rekening"
                                        value={data.bank_account_name}
                                        onChange={(e) => setData('bank_account_name', e.target.value)}
                                    />
                                    <FieldError message={errors.bank_account_name} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 6. Data Ahli Waris ────────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <HeartHandshake className="h-4 w-4" />
                                    Data Ahli Waris
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="beneficiary_name">
                                        Nama Lengkap <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="beneficiary_name"
                                        placeholder="Nama ahli waris"
                                        value={data.beneficiary_name}
                                        onChange={(e) => setData('beneficiary_name', e.target.value)}
                                    />
                                    <FieldError message={errors.beneficiary_name} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="beneficiary_relationship">
                                        Hubungan <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="beneficiary_relationship"
                                        placeholder="Istri / Suami / Anak / dll"
                                        value={data.beneficiary_relationship}
                                        onChange={(e) => setData('beneficiary_relationship', e.target.value)}
                                    />
                                    <FieldError message={errors.beneficiary_relationship} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="beneficiary_id_number">No. KTP</Label>
                                    <Input
                                        id="beneficiary_id_number"
                                        placeholder="16 digit NIK (opsional)"
                                        value={data.beneficiary_id_number}
                                        onChange={(e) => setData('beneficiary_id_number', e.target.value)}
                                    />
                                    <FieldError message={errors.beneficiary_id_number} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="beneficiary_phone">No. HP</Label>
                                    <Input
                                        id="beneficiary_phone"
                                        placeholder="08xxxxxxxxxx (opsional)"
                                        value={data.beneficiary_phone}
                                        onChange={(e) => setData('beneficiary_phone', e.target.value)}
                                    />
                                    <FieldError message={errors.beneficiary_phone} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ── 7. Penempatan Jaringan ────────────────────────── */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Layout className="h-4 w-4" />
                                    Penempatan Jaringan
                                </CardTitle>
                                <CardDescription>
                                    Pilih posisi kaki untuk penempatan Anda di jaringan sponsor.
                                </CardDescription>
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
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <span className="text-sm font-bold uppercase">Kaki Kiri</span>
                                            <span className="mt-1 text-center text-xs text-muted-foreground">
                                                Placement di sisi kiri jaringan
                                            </span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="right" id="right" className="peer sr-only" />
                                        <Label
                                            htmlFor="right"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                        >
                                            <span className="text-sm font-bold uppercase">Kaki Kanan</span>
                                            <span className="mt-1 text-center text-xs text-muted-foreground">
                                                Placement di sisi kanan jaringan
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <FieldError message={errors.leg_position} />
                            </CardContent>
                        </Card>

                        <Button
                            type="submit"
                            className="h-12 w-full text-base"
                            disabled={processing}
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            {processing ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href="/login">Masuk di sini</TextLink>
                        </p>
                    </form>
                </div>
            </section>
        </HomeLayout>
    );
}
