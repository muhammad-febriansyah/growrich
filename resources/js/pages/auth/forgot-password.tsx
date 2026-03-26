import { Head, router, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

function ForgotPasswordForm({ status }: { status?: string }) {
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData(e.currentTarget);
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
            data[key] = value as string;
        });

        if (executeRecaptcha) {
            data['g-recaptcha-response'] = await executeRecaptcha('forgot_password');
        }

        router.post(email(), data, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthLayout
            title="Lupa Kata Sandi"
            description="Masukkan email Anda untuk menerima tautan reset kata sandi"
        >
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            autoFocus
                            placeholder="email@contoh.com"
                        />
                        <InputError message={errors.email} />
                        <InputError message={errors['g-recaptcha-response']} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            className="w-full"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Kirim Tautan Reset Kata Sandi
                        </Button>
                    </div>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Atau, kembali ke</span>
                    <TextLink href={login()}>halaman masuk</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function ForgotPassword({ status }: { status?: string }) {
    const siteKey = usePage().props.site.recaptcha_site_key as string | undefined;

    if (siteKey) {
        return (
            <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
                <ForgotPasswordForm status={status} />
            </GoogleReCaptchaProvider>
        );
    }

    return <ForgotPasswordForm status={status} />;
}
