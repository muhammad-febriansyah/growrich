import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
        <AuthLayout
            title="Buat Akun Baru"
            description="Isi data di bawah ini untuk mendaftar sebagai member GrowRich"
        >
            <Head title="Daftar — GrowRich" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            {/* Nama Lengkap */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap Anda"
                                />
                                <InputError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* No. HP */}
                            <div className="grid gap-2">
                                <Label htmlFor="phone">
                                    Nomor HP
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">(opsional)</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    tabIndex={3}
                                    autoComplete="tel"
                                    name="phone"
                                    placeholder="08xxxxxxxxxx"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            {/* Kode Sponsor */}
                            <div className="grid gap-2">
                                <Label htmlFor="sponsor_code">
                                    Kode Sponsor
                                    <span className="ml-1 text-xs font-normal text-muted-foreground">(opsional)</span>
                                </Label>
                                <Input
                                    id="sponsor_code"
                                    type="text"
                                    tabIndex={4}
                                    name="sponsor_code"
                                    placeholder="Masukkan kode referral sponsor"
                                    className="uppercase"
                                />
                                <InputError message={errors.sponsor_code} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Minimal 8 karakter"
                                        className="pr-11"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Konfirmasi Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={showConfirmation ? 'text' : 'password'}
                                        required
                                        tabIndex={6}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ulangi password Anda"
                                        className="pr-11"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowConfirmation(!showConfirmation)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showConfirmation ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={7}
                            >
                                {processing && <Spinner />}
                                Buat Akun
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Sudah punya akun?{' '}
                            <TextLink href={login()} tabIndex={8}>
                                Masuk
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
