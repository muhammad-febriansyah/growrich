import { Form, Head, usePage } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const recaptchaWidgetRef = useRef<ReCAPTCHA>(null);
    const recaptchaInputRef = useRef<HTMLInputElement>(null);

    const resetRecaptcha = () => {
        recaptchaWidgetRef.current?.reset();
        if (recaptchaInputRef.current) {
            recaptchaInputRef.current.value = '';
        }
    };

    return (
        <AuthLayout
            title="Masuk ke Akun Anda"
            description="Masukkan email dan kata sandi Anda untuk melanjutkan"
        >
            <Head title="Masuk" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onError={resetRecaptcha}
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email" className="text-sm font-semibold">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@contoh.com"
                                    className="h-11 rounded-lg border-muted-foreground/20 focus-visible:ring-primary"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-semibold">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-medium hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="h-11 rounded-lg border-muted-foreground/20 focus-visible:ring-primary pr-11"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Ingat saya
                                </Label>
                            </div>

                            {/* reCAPTCHA */}
                            {usePage().props.site.recaptcha_site_key && (
                                <div className="grid gap-2 justify-items-center">
                                    <ReCAPTCHA
                                        ref={recaptchaWidgetRef}
                                        sitekey={usePage().props.site.recaptcha_site_key as string}
                                        onExpired={resetRecaptcha}
                                    />
                                    <InputError message={errors['g-recaptcha-response']} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="mt-4 h-12 w-full text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Masuk
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm font-medium text-muted-foreground">
                                Belum punya akun?{' '}
                                <TextLink href={register()} tabIndex={5} className="text-primary hover:underline font-bold">
                                    Daftar sekarang
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
