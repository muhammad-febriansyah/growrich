import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { site } = usePage().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div
                    className="absolute inset-0 bg-cover bg-center brightness-[0.4]"
                    style={{ backgroundImage: 'url("/images/auth-background.png")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center"
                >
                    <AppLogo iconClassName="text-white" className="text-white" />
                </Link>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg font-medium italic leading-relaxed">
                            "The path to wealth is through multiplication, not just addition.
                            GrowRich provides the tools to manage your journey towards financial freedom."
                        </p>
                        <footer className="text-sm font-semibold text-zinc-300">— {site.name}</footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[380px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogo showName={false} iconClassName="size-12 fill-current text-black dark:text-white sm:size-14" />
                    </Link>
                    <div className="flex flex-col items-start gap-3 text-left lg:items-center lg:text-center">
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
