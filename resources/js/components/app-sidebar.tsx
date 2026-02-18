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
    Info
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
import type { NavItem, User } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const userRole = auth.user.role;

    const adminNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        { title: 'Manajemen Member', href: '/admin/members', icon: Users },
        { title: 'Registration PIN', href: '/admin/pins', icon: Key },
        { title: 'Manajemen Produk', href: '/admin/products', icon: Package },
        { title: 'Manajemen Blog', href: '/admin/blog-posts', icon: FileText },
        { title: 'Riwayat Bonus', href: '/admin/bonuses', icon: DollarSign },
        { title: 'Penarikan Dana', href: '/admin/withdrawals', icon: Wallet },
        { title: 'Manajemen FAQ', href: '/admin/faqs', icon: HelpCircle },
        { title: 'Syarat & Ketentuan', href: '/admin/legal-pages/terms-conditions/edit', icon: FileText },
        { title: 'Kebijakan Privasi', href: '/admin/legal-pages/privacy-policy/edit', icon: ShieldCheck },
        { title: 'Tentang Kami', href: '/admin/legal-pages/about-us/edit', icon: Info },
        { title: 'Pengaturan Situs', href: '/admin/settings', icon: Settings },
    ];

    const memberNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        { title: 'Profil Saya', href: '/member/profile', icon: UserIcon },
        { title: 'PIN Saya', href: '/member/pins', icon: Key },
        { title: 'Jaringan Saya', href: '/member/network', icon: Network },
        { title: 'Riwayat Bonus', href: '/member/bonuses', icon: DollarSign },
        { title: 'Wallet & Withdraw', href: '/member/wallet', icon: Wallet },
        { title: 'Repeat Order', href: '/member/ro', icon: ShoppingCart },
        { title: 'Registrasi Member', href: '/member/register', icon: UserPlus },
    ];

    const mainNavItems = userRole === 'admin' ? adminNavItems : memberNavItems;
    const footerNavItems: NavItem[] = [];

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
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
