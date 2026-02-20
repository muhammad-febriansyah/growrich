import type { Auth } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            site: {
                name: string;
                logo: string | null;
                favicon: string | null;
                recaptcha_site_key: string | null;
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
