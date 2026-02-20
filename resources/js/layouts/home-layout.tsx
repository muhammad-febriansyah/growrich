import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function useActiveLink() {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (link: string): boolean => {
        if (!link || link === '#' || link.startsWith('/#')) return false;
        if (link === '/') return currentPath === '/';
        return currentPath === link || currentPath.startsWith(link + '/');
    };
}
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    Navbar,
    NavbarButton,
    NavBody,
    NavItems,
} from '@/components/ui/resizable-navbar';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import AppLogo from '@/components/app-logo';
import { dashboard, login, register } from '@/routes';

interface Props {
    children: React.ReactNode;
    transparentNavbar?: boolean;
}

const navItems = [
    { name: 'Home', link: '/' },
    {
        name: 'Profil',
        link: '#',
        children: [
            { name: 'Tentang Kami', link: '/about' },
            { name: 'Marketing Plan', link: '/marketing-plan' },
            { name: 'FAQ', link: '/faq' },
            { name: 'Syarat & Ketentuan', link: '/terms' },
            { name: 'Kebijakan Privasi', link: '/privacy' },
        ],
    },
    { name: 'Paket', link: '/paket' },
    { name: 'Produk', link: '/produk' },
    { name: 'Blog', link: '/blog' },
];

interface SharedProps {
    auth: { user: { name: string } | null };
    socials: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        youtube?: string;
        tiktok?: string;
    };
    contact: {
        email?: string;
        phone?: string;
        whatsapp?: string;
        address?: string;
    };
    footer: {
        about?: string | null;
        copyright?: string | null;
    };
}

export default function HomeLayout({ children, transparentNavbar }: Props) {
    const { auth, socials, contact, footer } = usePage<SharedProps>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const isActive = useActiveLink();

    const socialLinks = [
        { key: 'instagram', icon: <Instagram className="h-4 w-4" />, label: 'Instagram', href: socials.instagram },
        { key: 'facebook', icon: <Facebook className="h-4 w-4" />, label: 'Facebook', href: socials.facebook },
        { key: 'youtube', icon: <Youtube className="h-4 w-4" />, label: 'YouTube', href: socials.youtube },
        { key: 'twitter', icon: <Twitter className="h-4 w-4" />, label: 'Twitter/X', href: socials.twitter },
        { key: 'tiktok', icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.56V6.81a4.85 4.85 0 0 1-1.07-.12z" /></svg>, label: 'TikTok', href: socials.tiktok },
    ].filter((s) => s.href);

    return (
        <div className="min-h-screen bg-white">
            <Navbar className="fixed top-0 z-50 w-full">
                {/* Desktop Navbar */}
                <NavBody transparent={transparentNavbar}>
                    <Link href="/" className="relative z-20 flex-shrink-0">
                        <AppLogo />
                    </Link>

                    <NavItems items={navItems} />

                    <div className="relative z-20 flex items-center gap-2">
                        {auth.user ? (
                            <NavbarButton href={dashboard()} as={Link} variant="dark">
                                Dashboard
                            </NavbarButton>
                        ) : (
                            <>
                                <Link
                                    href="/reseller-program"
                                    className="rounded-full border-2 border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                                >
                                    Reseller Program
                                </Link>
                                <ShimmerButton
                                    background="oklch(0.508 0.155 141)"
                                    borderRadius="9999px"
                                    className="px-6 py-2 text-sm font-semibold"
                                    onClick={() => router.visit(login())}
                                >
                                    Login
                                </ShimmerButton>
                            </>
                        )}
                    </div>
                </NavBody>

                {/* Mobile Navbar */}
                <MobileNav transparent={transparentNavbar}>
                    <MobileNavHeader>
                        <Link href="/" className="flex-shrink-0">
                            <AppLogo />
                        </Link>
                        <MobileNavToggle
                            isOpen={mobileOpen}
                            onClick={() => setMobileOpen((v) => !v)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
                        {navItems.map((item) => {
                            const parentActive = item.children
                                ? item.children.some((c) => isActive(c.link))
                                : isActive(item.link);

                            return item.children ? (
                                <div key={item.name} className="w-full">
                                    <p className={`py-2 text-sm font-semibold uppercase tracking-wide ${parentActive ? 'text-primary' : 'text-neutral-500'}`}>
                                        {item.name}
                                    </p>
                                    <div className={`flex flex-col gap-1 pl-3 border-l-2 ${parentActive ? 'border-primary/50' : 'border-primary/20'}`}>
                                        {item.children.map((child) => {
                                            const childActive = isActive(child.link);
                                            return (
                                                <a
                                                    key={child.name}
                                                    href={child.link}
                                                    className={`flex items-center justify-between py-1.5 text-sm transition-colors ${childActive ? 'font-semibold text-primary' : 'font-medium text-neutral-700 hover:text-primary'}`}
                                                    onClick={() => setMobileOpen(false)}
                                                >
                                                    {child.name}
                                                    {childActive && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <a
                                    key={item.name}
                                    href={item.link}
                                    className={`flex w-full items-center justify-between py-2 text-sm transition-colors ${parentActive ? 'font-semibold text-primary' : 'font-medium text-neutral-700 hover:text-primary'}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.name}
                                    {parentActive && (
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    )}
                                </a>
                            );
                        })}

                        <div className="flex w-full flex-col gap-2 border-t pt-4">
                            {auth.user ? (
                                <NavbarButton
                                    href={dashboard()}
                                    as={Link}
                                    variant="dark"
                                    className="w-full text-center"
                                >
                                    Dashboard
                                </NavbarButton>
                            ) : (
                                <>
                                    <Link
                                        href="/reseller-program"
                                        className="w-full rounded-full border-2 border-primary px-5 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Reseller Program
                                    </Link>
                                    <ShimmerButton
                                        background="oklch(0.508 0.155 141)"
                                        borderRadius="9999px"
                                        className="w-full justify-center py-2.5 text-sm font-semibold"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            router.visit(login());
                                        }}
                                    >
                                        Login
                                    </ShimmerButton>
                                </>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>

            {/* Page content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="relative overflow-hidden border-t border-primary/10 bg-primary/[0.03]">
                {/* Soft blur accents */}
                <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/8 blur-[80px]" />

                {/* Main grid */}
                <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

                        {/* Col 1 — Brand */}
                        <div className="space-y-4">
                            <AppLogo />
                            <p className="text-sm leading-relaxed text-gray-500">
                                {footer?.about || 'Platform ekosistem MLM modern yang dirancang untuk mempercepat karir dan pendapatan Anda dengan transparansi penuh.'}
                            </p>
                        </div>

                        {/* Col 2 — Useful Links */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Useful Links</h4>
                            <ul className="space-y-2.5">
                                {[
                                    { label: 'Home', href: '/' },
                                    { label: 'Tentang Kami', href: '/about' },
                                    { label: 'Paket Bergabung', href: '/paket' },
                                    { label: 'Marketing Plan', href: '/marketing-plan' },
                                    { label: 'Blog', href: '/blog' },
                                    { label: 'FAQ', href: '/faq' },
                                    { label: 'Login', href: login() },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <a href={item.href} className="group inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-primary">
                                            <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                                            <span className="underline-offset-2 group-hover:underline">{item.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3 — Office / Kontak */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Kontak</h4>
                            <ul className="space-y-3.5">
                                {contact.address && (
                                    <li className="flex items-start gap-3 text-sm text-gray-500">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>{contact.address}</span>
                                    </li>
                                )}
                                {contact.email && (
                                    <li className="flex items-center gap-3 text-sm text-gray-500">
                                        <Mail className="h-4 w-4 shrink-0 text-primary" />
                                        <a href={`mailto:${contact.email}`} className="underline-offset-2 transition-colors hover:text-primary hover:underline">
                                            {contact.email}
                                        </a>
                                    </li>
                                )}
                                {contact.phone && (
                                    <li className="flex items-center gap-3 text-sm text-gray-500">
                                        <Phone className="h-4 w-4 shrink-0 text-primary" />
                                        <a href={`tel:${contact.phone}`} className="underline-offset-2 transition-colors hover:text-primary hover:underline">
                                            {contact.phone}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Col 4 — Follow Us + CTA Card */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Follow Us</h4>
                            <p className="text-sm leading-relaxed text-gray-500">
                                Tetap terhubung dengan kami di media sosial untuk mendapatkan pembaruan dan pengumuman menarik.
                            </p>

                            {socialLinks.length > 0 && (
                                <div className="flex gap-2">
                                    {socialLinks.map((s) => (
                                        <a
                                            key={s.key}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.label}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-white text-gray-500 shadow-sm transition-all hover:bg-primary hover:text-white hover:border-primary"
                                        >
                                            {s.icon}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* CTA Card */}
                            <div className="mt-4 rounded-2xl border border-primary/20 bg-white p-5 shadow-sm">
                                <p className="text-sm font-semibold text-gray-900">Siap Bergabung?</p>
                                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                                    Pilih paket sesuai kebutuhan dan mulai perjalanan bisnis Anda bersama GrowRich.
                                </p>
                                <Link
                                    href={register()}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
                                >
                                    Daftar Sekarang
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="relative border-t border-primary/10">
                    <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
                        <div className="flex flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
                            <p>{footer?.copyright || `© ${new Date().getFullYear()} GrowRich. Seluruh hak cipta dilindungi.`}</p>
                            <div className="flex gap-5">
                                <Link href="/terms" className="transition-colors hover:text-gray-700">Syarat &amp; Ketentuan</Link>
                                <Link href="/privacy" className="transition-colors hover:text-gray-700">Kebijakan Privasi</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
