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
    Database,
    Banknote,
    Store,
    UserX,
    BarChart2,
    Megaphone,
    Newspaper,
    Tag,
    ScrollText,
    LifeBuoy,
    MessageCircle,
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
            {
                title: 'Order PIN',
                href: '/admin/pin-orders',
                icon: ShoppingCart,
            },
            {
                title: 'Manajemen Paket',
                href: '/admin/packages',
                icon: Package,
            },
            { title: 'Manajemen Bank', href: '/admin/banks', icon: Banknote },
            {
                title: 'Dashboard Stokis',
                href: '/admin/stockists',
                icon: Store,
            },
        ],
    },
    {
        label: 'Keuangan',
        items: [
            {
                title: 'Riwayat Bonus',
                href: '/admin/bonuses',
                icon: DollarSign,
            },
            {
                title: 'Pembayaran Bonus Harian',
                href: '/admin/bonuses/daily-payment',
                icon: Banknote,
            },
            {
                title: 'Penarikan Dana',
                href: '/admin/withdrawals',
                icon: Wallet,
            },
            {
                title: 'Transaksi RO',
                href: '/admin/repeat-orders',
                icon: ShoppingCart,
            },
        ],
    },
    {
        label: 'Bonus Runner',
        items: [
            { title: 'Daily Bonus Run', href: '/admin/daily-runs', icon: Play },
            { title: 'Manajemen Reward', href: '/admin/rewards', icon: Gift },
            {
                title: 'Approve Upgrade Paket',
                href: '/upgrade-requests',
                icon: ArrowUpCircle,
            },
        ],
    },
    {
        label: 'Konten',
        items: [
            {
                title: 'Manajemen Produk',
                href: '/admin/products',
                icon: Package,
            },
            { title: 'Pengumuman Member', href: '/admin/announcements', icon: Megaphone },
            { title: 'Tiket Support', href: '/admin/support', icon: LifeBuoy },
            { title: 'Live Chat', href: '/admin/chat', icon: MessageCircle },
            {
                title: 'Manajemen Blog',
                href: '/admin/blog-posts',
                icon: BookOpen,
            },
            {
                title: 'Kategori Berita',
                href: '/admin/news-categories',
                icon: Tag,
            },
            { title: 'Manajemen Berita', href: '/admin/news', icon: Newspaper },
            { title: 'Manajemen Admin', href: '/admin/users', icon: Users },
            { title: 'Manajemen FAQ', href: '/admin/faqs', icon: HelpCircle },
            {
                title: 'Reseller Program',
                href: '/admin/reseller-program',
                icon: LayoutGrid,
            },
            {
                title: 'Marketing Bonus',
                href: '/admin/marketing-bonuses',
                icon: Star,
            },
            {
                title: 'Jenjang Karir',
                href: '/admin/career-levels',
                icon: Trophy,
            },
            { title: 'Fitur Unggulan', href: '/admin/features', icon: Star },
        ],
    },
    {
        label: 'Halaman Legal',
        items: [
            {
                title: 'Syarat & Ketentuan',
                href: '/admin/legal-pages/terms-conditions/edit',
                icon: FileText,
            },
            {
                title: 'Kebijakan Privasi',
                href: '/admin/legal-pages/privacy-policy/edit',
                icon: ShieldCheck,
            },
            {
                title: 'Tentang Kami',
                href: '/admin/legal-pages/about-us/edit',
                icon: Info,
            },
        ],
    },
    {
        label: 'Laporan',
        items: [
            {
                title: 'Laporan & Statistik',
                href: '/admin/reports',
                icon: BarChart2,
            },
            {
                title: 'Activity Log',
                href: '/admin/activity-logs',
                icon: ScrollText,
            },
        ],
    },
    {
        label: 'Konfigurasi',
        items: [
            {
                title: 'Pengaturan Situs',
                href: '/admin/settings',
                icon: Settings,
            },
            {
                title: 'Backup Database',
                href: '/admin/database-backups',
                icon: Database,
            },
            {
                title: 'Hapus Member',
                href: '/admin/member-deletions',
                icon: UserX,
            },
        ],
    },
];

export const memberNavGroups: NavGroup[] = [
    {
        label: 'Utama',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            { title: 'Profil', href: '/member/profile', icon: UserIcon },
        ],
    },
    {
        label: 'Jaringan',
        items: [
            {
                title: 'Order PIN',
                href: '/member/pin-orders',
                icon: ShoppingCart,
            },
            { title: 'Stok PIN', href: '/member/pins', icon: Key },
            {
                title: 'Diagram Jaringan',
                href: '/member/network',
                icon: Network,
            },
            {
                title: 'Registrasi Member',
                href: '/member/register',
                icon: UserPlus,
            },
        ],
    },
    {
        label: 'Karir & Reward',
        items: [
            {
                title: 'Upgrade Paket',
                href: '/member/upgrade',
                icon: ArrowUpCircle,
            },
            { title: 'Jenjang Karir', href: '/member/career', icon: Trophy },
            { title: 'Progress Reward', href: '/member/rewards', icon: Star },
        ],
    },
    {
        label: 'Bonus Statement',
        items: [
            {
                title: 'Riwayat Bonus',
                href: '/member/bonuses',
                icon: DollarSign,
            },
            {
                title: 'Simulasi Bonus',
                href: '/member/bonuses/simulation',
                icon: BarChart2,
            },
            {
                title: 'Wallet & Withdraw',
                href: '/member/wallet',
                icon: Wallet,
            },
        ],
    },
    {
        label: 'Belanja',
        items: [
            { title: 'Repeat Order', href: '/member/ro', icon: ShoppingCart },
        ],
    },
    {
        label: 'Informasi',
        items: [
            { title: 'Pengumuman', href: '/member/announcements', icon: Megaphone },
            { title: 'Bantuan / Support', href: '/member/support', icon: LifeBuoy },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const userRole = auth.user.role;

    const mainNavGroups =
        userRole === 'admin' ? adminNavGroups : memberNavGroups;

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
