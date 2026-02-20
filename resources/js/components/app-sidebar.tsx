import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Users,
    Key,
    Package,
    DollarSign,
    Wallet,
    Network,
    User as UserIcon,
    ShoppingCart,
    UserPlus,
    Settings,
    HelpCircle,
    FileText,
    ShieldCheck,
    Info,
    BookOpen,
    Play,
    Gift,
    ArrowUpCircle,
    Trophy,
    Star,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavGroup, User } from '@/types';
import AppLogo from './app-logo';

export const adminNavGroups: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        ],
    },
    {
        label: 'Manajemen MLM',
        items: [
            { title: 'Manajemen Member', href: '/admin/members', icon: Users },
            { title: 'Registration PIN', href: '/admin/pins', icon: Key },
            { title: 'Manajemen Paket', href: '/admin/packages', icon: Package },
        ],
    },
    {
        label: 'Keuangan',
        items: [
            { title: 'Riwayat Bonus', href: '/admin/bonuses', icon: DollarSign },
            { title: 'Penarikan Dana', href: '/admin/withdrawals', icon: Wallet },
            { title: 'Manajemen RO', href: '/admin/repeat-orders', icon: ShoppingCart },
        ],
    },
    {
        label: 'Bonus Runner',
        items: [
            { title: 'Daily Bonus Run', href: '/admin/daily-runs', icon: Play },
            { title: 'Manajemen Reward', href: '/admin/rewards', icon: Gift },
            { title: 'Approve Upgrade Paket', href: '/upgrade-requests', icon: ArrowUpCircle },
        ],
    },
    {
        label: 'Konten',
        items: [
            { title: 'Manajemen Produk', href: '/admin/products', icon: Package },
            { title: 'Manajemen Blog', href: '/admin/blog-posts', icon: BookOpen },
            { title: 'Manajemen Admin', href: '/admin/users', icon: Users },
            { title: 'Manajemen FAQ', href: '/admin/faqs', icon: HelpCircle },
            { title: 'Reseller Program', href: '/admin/reseller-program', icon: LayoutGrid },
            { title: 'Fitur Unggulan', href: '/admin/features', icon: Star },
        ],
    },
    {
        label: 'Halaman Legal',
        items: [
            { title: 'Syarat & Ketentuan', href: '/admin/legal-pages/terms-conditions/edit', icon: FileText },
            { title: 'Kebijakan Privasi', href: '/admin/legal-pages/privacy-policy/edit', icon: ShieldCheck },
            { title: 'Tentang Kami', href: '/admin/legal-pages/about-us/edit', icon: Info },
        ],
    },
    {
        label: 'Konfigurasi',
        items: [
            { title: 'Pengaturan Situs', href: '/admin/settings', icon: Settings },
        ],
    },
];

export const memberNavGroups: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Profil Saya', href: '/member/profile', icon: UserIcon },
        ],
    },
    {
        label: 'Jaringan MLM',
        items: [
            { title: 'PIN Saya', href: '/member/pins', icon: Key },
            { title: 'Jaringan Saya', href: '/member/network', icon: Network },
            { title: 'Registrasi Member', href: '/member/register', icon: UserPlus },
        ],
    },
    {
        label: 'Karir & Reward',
        items: [
            { title: 'Upgrade Paket', href: '/member/upgrade', icon: ArrowUpCircle },
            { title: 'Jenjang Karir', href: '/member/career', icon: Trophy },
            { title: 'Progress Reward', href: '/member/rewards', icon: Star },
        ],
    },
    {
        label: 'Keuangan',
        items: [
            { title: 'Riwayat Bonus', href: '/member/bonuses', icon: DollarSign },
            { title: 'Wallet & Withdraw', href: '/member/wallet', icon: Wallet },
        ],
    },
    {
        label: 'Belanja',
        items: [
            { title: 'Repeat Order', href: '/member/ro', icon: ShoppingCart },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const userRole = auth.user.role;

    const mainNavGroups = userRole === 'admin' ? adminNavGroups : memberNavGroups;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
