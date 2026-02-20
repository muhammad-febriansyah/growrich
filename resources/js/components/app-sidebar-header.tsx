import { Link, router, usePage } from '@inertiajs/react';
import {
    DollarSign,
    Key,
    LayoutGrid,
    LogOut,
    Network,
    Package,
    Search,
    Settings,
    ShoppingCart,
    User as UserIcon,
    UserPlus,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem as BreadcrumbItemType, User } from '@/types';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { adminNavGroups, memberNavGroups } from './app-sidebar';

function MenuSearch({ role }: { role: string }) {
    const [open, setOpen] = useState(false);
    const groups = role === 'admin' ? adminNavGroups : memberNavGroups;
    const items = groups.flatMap((group) => group.items);

    // CMD/CTRL + K shortcut
    useEffect(() => {
        function handleKeydown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((open) => !open);
            }
        }
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    }, []);

    const onSelect = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm transition-all border-border hover:border-primary/40 w-48 text-muted-foreground"
            >
                <Search className="size-3.5 shrink-0" />
                <span className="flex-1 text-left">Cari menu...</span>
                <kbd className="hidden shrink-0 select-none rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
                    ⌘K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Ketik untuk mencari menu..." />
                <CommandList>
                    <CommandEmpty>Tidak ada menu ditemukan.</CommandEmpty>
                    <CommandGroup heading="Navigasi Menu">
                        {items.map((item) => (
                            <CommandItem
                                key={String(item.href)}
                                value={item.title}
                                onSelect={() => onSelect(String(item.href))}
                                className="flex items-center gap-3 group cursor-pointer"
                            >
                                <div className="flex size-7 items-center justify-center rounded-lg bg-gray-100 transition-colors group-data-[selected=true]:bg-white/20">
                                    {item.icon ? (
                                        <item.icon className="size-3.5 transition-colors group-data-[selected=true]:text-white" />
                                    ) : (
                                        <LayoutGrid className="size-3.5 transition-colors group-data-[selected=true]:text-white" />
                                    )}
                                </div>
                                <span className="font-medium">{item.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

// ── User Avatar Dropdown ─────────────────────────────────────────────────────
function UserAvatarDropdown({ user }: { user: User }) {
    const getInitials = useInitials();
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl p-1 outline-none ring-offset-background transition-all hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="size-8 cursor-pointer ring-2 ring-primary/20 transition-all hover:ring-primary/50">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden max-w-[120px] text-left lg:block">
                        <p className="truncate text-xs font-semibold text-gray-800">{user.name}</p>
                        <p className="truncate text-[10px] capitalize text-muted-foreground">{user.role}</p>
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-1.5 shadow-lg">
                {/* User info header */}
                <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex items-center gap-2.5">
                        <Avatar className="size-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link
                            href={edit()}
                            onClick={cleanup}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
                        >
                            <div className="flex size-7 items-center justify-center rounded-lg bg-brand-50">
                                <Settings className="size-3.5 text-brand" />
                            </div>
                            Pengaturan Profil
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-red-600 hover:!bg-red-50 hover:!text-red-700"
                        data-test="logout-button"
                    >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-red-50">
                            <LogOut className="size-3.5 text-red-500" />
                        </div>
                        Keluar
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Header ───────────────────────────────────────────────────────────────────
export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-5">
            {/* Left: trigger + breadcrumbs */}
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 shrink-0" />
                <div className="hidden sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Right: search + avatar dropdown */}
            <div className="flex shrink-0 items-center gap-4">
                <MenuSearch role={user.role} />
                <UserAvatarDropdown user={user} />
            </div>
        </header>
    );
}
