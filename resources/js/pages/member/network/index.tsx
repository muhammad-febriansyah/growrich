import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Home, Plus, User as UserIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TreeNode {
    id: number;
    referral_code: string;
    name: string;
    package: string;
    left_pp: number;
    right_pp: number;
    left: TreeNode | null;
    right: TreeNode | null;
}

interface Ancestor {
    id: number;
    name: string;
}

interface Props {
    tree: TreeNode | null;
    ancestors: Ancestor[];
}

interface TooltipState {
    node: TreeNode;
    x: number;
    y: number;
}

// ── Tooltip context (avoids prop drilling through recursive Node) ──────────────

const TooltipContext = createContext<{
    show: (node: TreeNode, x: number, y: number) => void;
    hide: () => void;
}>({ show: () => {}, hide: () => {} });

// ── Constants ─────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Jaringan Saya', href: '/member/network' }];

// ── Navigation helpers ────────────────────────────────────────────────────────

function navigateTo(id: number) {
    router.get('/member/network', { root_id: id }, { preserveScroll: false });
}

function navigateHome() {
    router.get('/member/network', {}, { preserveScroll: false });
}

// ── Package colour helpers ────────────────────────────────────────────────────

function circleClass(pkg: string): string {
    const p = pkg.toLowerCase();
    if (p.includes('platinum')) return 'bg-indigo-50 border-indigo-300';
    if (p.includes('gold')) return 'bg-amber-50 border-amber-300';
    return 'bg-slate-50 border-slate-200';
}

function iconClass(pkg: string): string {
    const p = pkg.toLowerCase();
    if (p.includes('platinum')) return 'text-indigo-600';
    if (p.includes('gold')) return 'text-amber-600';
    return 'text-slate-500';
}

// ── Empty slot ────────────────────────────────────────────────────────────────

function EmptySlot() {
    return (
        <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50">
                <Plus className="h-4 w-4 text-slate-300" />
            </div>
            <div className="mt-2 text-[10px] font-medium text-slate-400">KOSONG</div>
        </div>
    );
}

// ── Floating tooltip (rendered at page level, never clipped) ──────────────────

function FloatingTooltip({ tooltip }: { tooltip: TooltipState | null }) {
    if (!tooltip) return null;

    const { node, x, y } = tooltip;
    const isClickable = true; // only shown for non-root nodes

    // Offset: appear to the right of cursor; flip left if near right edge
    const left = x + 14;
    const top  = y - 10;

    return (
        <div
            className="pointer-events-none fixed z-50 w-52 rounded-lg border bg-white p-3 text-xs shadow-xl"
            style={{ left, top }}
        >
            <p className="mb-1 border-b pb-1 font-bold">{node.name}</p>
            <p>
                <span className="text-muted-foreground">Kode: </span>
                {node.referral_code}
            </p>
            <p>
                <span className="text-muted-foreground">Paket: </span>
                {node.package}
            </p>
            <div className="mt-1 grid grid-cols-2 border-t pt-1 text-[10px]">
                <div>
                    <p className="text-muted-foreground">L-PP</p>
                    <p className="font-bold">{node.left_pp}</p>
                </div>
                <div className="text-right">
                    <p className="text-muted-foreground">R-PP</p>
                    <p className="font-bold">{node.right_pp}</p>
                </div>
            </div>
            {isClickable && (
                <p className="mt-1.5 border-t pt-1.5 text-[10px] text-primary">
                    Klik untuk lihat subtree →
                </p>
            )}
        </div>
    );
}

// ── Single node ───────────────────────────────────────────────────────────────

function Node({ node, level = 0 }: { node: TreeNode | null; level?: number }) {
    const { show, hide } = useContext(TooltipContext);

    if (!node) return <EmptySlot />;

    const isRoot        = level === 0;
    const isClickable   = !isRoot;
    const hasChildren   = node.left !== null || node.right !== null;
    const showDrillHint = level === 2 && hasChildren;

    return (
        <div className="flex flex-col items-center">
            {/* Circle --------------------------------------------------------- */}
            <div
                className={cn('relative', isClickable && 'cursor-pointer')}
                onClick={() => isClickable && navigateTo(node.id)}
                onMouseEnter={(e) => show(node, e.clientX, e.clientY)}
                onMouseMove={(e) => show(node, e.clientX, e.clientY)}
                onMouseLeave={hide}
            >
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full border-2 shadow-sm transition-all',
                        isRoot ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12 md:h-14 md:w-14',
                        circleClass(node.package),
                        isClickable && 'hover:ring-4 hover:ring-primary/20 hover:border-primary',
                    )}
                >
                    <UserIcon
                        className={cn(isRoot ? 'h-7 w-7' : 'h-5 w-5', iconClass(node.package))}
                    />
                </div>
            </div>

            {/* Labels ---------------------------------------------------------- */}
            <div className="mt-2 text-center">
                <p className="w-20 truncate text-[10px] font-bold text-slate-700 md:w-24">
                    {node.referral_code}
                </p>
                <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-tighter text-slate-600">
                    {node.package}
                </span>
            </div>

            {/* Drill-down hint ------------------------------------------------- */}
            {showDrillHint && (
                <button
                    onClick={() => navigateTo(node.id)}
                    className="mt-1 flex cursor-pointer items-center gap-0.5 text-[9px] font-medium text-primary/70 hover:text-primary"
                >
                    <ChevronDown className="h-3 w-3" />
                    Lihat
                </button>
            )}

            {/* Children -------------------------------------------------------- */}
            {level < 2 && (
                <div className="mt-4 flex w-full">
                    {/* Left */}
                    <div className="relative flex flex-1 flex-col items-center">
                        <div className="absolute top-0 right-0 h-[2px] w-1/2 -translate-y-4 bg-slate-200" />
                        <div className="absolute top-0 right-0 h-4 w-[2px] -translate-y-4 bg-slate-200" />
                        <Node node={node.left} level={level + 1} />
                    </div>
                    {/* Right */}
                    <div className="relative flex flex-1 flex-col items-center">
                        <div className="absolute top-0 left-0 h-[2px] w-1/2 -translate-y-4 bg-slate-200" />
                        <div className="absolute top-0 left-0 h-4 w-[2px] -translate-y-4 bg-slate-200" />
                        <Node node={node.right} level={level + 1} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ ancestors, currentName }: { ancestors: Ancestor[]; currentName: string }) {
    if (ancestors.length === 0) return null;

    return (
        <div className="mb-4 flex flex-wrap items-center gap-1 text-xs">
            <button
                onClick={navigateHome}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
                <Home className="h-3 w-3" />
                <span>Root</span>
            </button>

            {ancestors.map((a) => (
                <span key={a.id} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                    <button
                        onClick={() => navigateTo(a.id)}
                        className="rounded px-1.5 py-0.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                    >
                        {a.name}
                    </button>
                </span>
            ))}

            <span className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                <span className="rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                    {currentName}
                </span>
            </span>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NetworkIndex({ tree, ancestors }: Props) {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);

    const show = useCallback((node: TreeNode, x: number, y: number) => {
        setTooltip({ node, x, y });
    }, []);

    const hide = useCallback(() => setTooltip(null), []);

    return (
        <TooltipContext.Provider value={{ show, hide }}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Jaringan Visual" />

                <div className="flex min-h-[calc(100vh-200px)] flex-col gap-6 p-4 text-foreground md:p-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold">Jaringan Visual (Binary)</h1>
                        <p className="text-muted-foreground">
                            Visualisasi struktur jaringan dan poin pairing Anda.
                        </p>
                    </div>

                    <Card className="flex-1 border-dashed bg-slate-50/50">
                        <CardHeader className="border-b bg-white">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <CardTitle className="text-sm font-medium">Pohon Jaringan</CardTitle>
                                <div className="flex gap-4 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-slate-200" /> Silver
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-amber-300" /> Gold
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-indigo-300" /> Platinum
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="overflow-x-auto p-6 md:p-10">
                            {tree ? (
                                <>
                                    <Breadcrumb ancestors={ancestors} currentName={tree.name} />
                                    <div className="min-w-[520px]">
                                        <div className="flex justify-center py-4">
                                            <Node node={tree} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                    <UserIcon className="mb-3 h-10 w-10 opacity-30" />
                                    <p className="font-medium">Profil jaringan belum tersedia.</p>
                                    <p className="mt-1 text-sm">
                                        Aktivasi akun Anda untuk melihat jaringan.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tooltip rendered outside overflow containers ─────────────── */}
                <FloatingTooltip tooltip={tooltip} />
            </AppLayout>
        </TooltipContext.Provider>
    );
}
