import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';
import { cn } from '@/lib/utils';

interface AppLogoProps {
    className?: string;
    iconClassName?: string;
    showName?: boolean;
}

export default function AppLogo({ className, iconClassName, showName = true }: AppLogoProps) {
    const { site } = usePage().props;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {site.logo ? (
                <img
                    src={site.logo}
                    alt={site.name}
                    className={cn("h-9 w-auto object-contain", iconClassName)}
                />
            ) : (
                <AppLogoIcon className={cn("size-9 fill-current", iconClassName)} />
            )}
            {/* {showName && (
                <span className="text-xl font-bold tracking-tight">
                    {site.name}
                </span>
            )} */}
        </div>
    );
}
