import { Head, router } from '@inertiajs/react';
import { ChevronLeft, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TreeNode {
    id: number;
    member_id: string;
    referral_code: string;
    name: string;
    package: string;
    career_level: string;
    avatar: string | null;
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

// ── Constants ─────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Diagram Jaringan', href: '/member/network' }];

// ── Navigation helpers ────────────────────────────────────────────────────────

function navigateTo(id: number) {
    router.get('/member/network', { root_id: id }, { preserveScroll: false });
}

function navigateHome() {
    router.get('/member/network', {}, { preserveScroll: false });
}

// ── Package style helpers ─────────────────────────────────────────────────────

interface PkgStyle {
    card: string;
    text: string;
    idText: string;
    pkgText: string;
    badge: string;
    ppText: string;
    ppLabel: string;
    sep: string;
}

function pkgStyle(pkg: string): PkgStyle {
    const p = pkg.toLowerCase();

    if (p.includes('platinum')) {
        return {
            card: 'bg-[#1B2B1B]',
            text: 'text-white',
            idText: 'text-gray-400',
            pkgText: 'text-white',
            badge: 'bg-white/20 text-white',
            ppText: 'text-white',
            ppLabel: 'text-white/55',
            sep: 'border-white/20',
        };
    }

    if (p.includes('gold')) {
        return {
            card: 'bg-amber-400',
            text: 'text-amber-950',
            idText: 'text-amber-700',
            pkgText: 'text-amber-950',
            badge: 'bg-white/60 text-amber-900',
            ppText: 'text-amber-950',
            ppLabel: 'text-amber-800/70',
            sep: 'border-amber-600/30',
        };
    }

    // Silver / default
    return {
        card: 'bg-gray-200',
        text: 'text-gray-900',
        idText: 'text-gray-500',
        pkgText: 'text-gray-900',
        badge: 'bg-white/70 text-gray-700',
        ppText: 'text-gray-900',
        ppLabel: 'text-gray-500',
        sep: 'border-gray-400/40',
    };
}

// ── NodeCard ──────────────────────────────────────────────────────────────────

function NodeCard({ node, isLeaf }: { node: TreeNode; isLeaf: boolean }) {
    const s = pkgStyle(node.package);

    return (
        <div
            className={cn(
                'w-36 overflow-hidden rounded-2xl shadow-md transition-all duration-150 select-none md:w-44',
                s.card,
                isLeaf && 'cursor-pointer hover:-translate-y-1 hover:shadow-xl',
            )}
            onClick={isLeaf ? () => navigateTo(node.id) : undefined}
        >
            {/* Top: avatar / name / id / package / rank */}
            <div className="flex flex-col items-center p-3 text-center">
                {/* Avatar */}
                <div className="mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/25 ring-2 ring-white/40">
                    {node.avatar ? (
                        <img src={node.avatar} alt={node.name} className="h-full w-full object-cover" />
                    ) : (
                        <UserIcon className={cn('h-6 w-6', s.text)} />
                    )}
                </div>

                {/* Name */}
                <p className={cn('max-w-full truncate px-1 text-xs font-semibold leading-tight', s.text)}>
                    {node.name}
                </p>

                {/* Member ID */}
                <p className={cn('mt-0.5 font-mono text-[10px]', s.idText)}>{node.member_id}</p>

                {/* Package */}
                <p className={cn('mt-1 text-xs font-bold', s.pkgText)}>({node.package.toUpperCase()})</p>

                {/* Career level badge */}
                <span className={cn('mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium', s.badge)}>
                    {node.career_level}
                </span>
            </div>

            {/* Dotted separator */}
            <div className={cn('mx-3 border-t border-dashed', s.sep)} />

            {/* L-PP / R-PP */}
            <div className="grid grid-cols-2 px-3 py-2">
                <div>
                    <p className={cn('text-[10px]', s.ppLabel)}>L-PP</p>
                    <p className={cn('text-xs font-bold', s.ppText)}>{node.left_pp.toLocaleString('id')}</p>
                </div>
                <div className="text-right">
                    <p className={cn('text-[10px]', s.ppLabel)}>R-PP</p>
                    <p className={cn('text-xs font-bold', s.ppText)}>{node.right_pp.toLocaleString('id')}</p>
                </div>
            </div>
        </div>
    );
}

// ── AvailableSlot ─────────────────────────────────────────────────────────────

function AvailableSlot({ parentId, leg }: { parentId: number | null; leg: 'left' | 'right' }) {
    function handleClick() {
        if (!parentId) return;
        router.get('/member/register', { parent_id: parentId, leg });
    }

    return (
        <div
            className={cn(
                'w-36 overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 shadow-sm md:w-44',
                parentId && 'cursor-pointer transition-colors hover:border-primary/50 hover:bg-gray-200',
            )}
            onClick={handleClick}
        >
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <p className="text-sm font-bold text-gray-500">Available</p>
                {parentId && (
                    <p className="mt-2 text-[10px] leading-snug text-gray-400">
                        Klik untuk mendaftarkan member baru disini
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Node (recursive) ──────────────────────────────────────────────────────────

function Node({
    node,
    level = 0,
    parentId = null,
    leg = 'left',
}: {
    node: TreeNode | null;
    level?: number;
    parentId?: number | null;
    leg?: 'left' | 'right';
}) {
    const isLeaf = level === 2;

    return (
        <div className="flex flex-col items-center">
            {/* Box */}
            {node ? <NodeCard node={node} isLeaf={isLeaf} /> : <AvailableSlot parentId={parentId} leg={leg} />}

            {/* Children — only for filled non-leaf nodes */}
            {node && !isLeaf && (
                <>
                    {/* Vertical: parent box bottom → crossbar */}
                    <div className="h-12 w-[2px] bg-slate-300" />

                    {/* Children row — gap-6 between subtrees; crossbar extended by gap/2 */}
                    <div className="flex gap-6">
                        {/* Left child container */}
                        <div className="relative flex flex-col items-center">
                            {/* Horizontal crossbar: center → gap midpoint */}
                            <div className="absolute -right-3 top-0 h-[2px] w-[calc(50%+0.75rem)] bg-slate-300" />
                            {/* Vertical: crossbar → left child top */}
                            <div className="absolute left-1/2 top-0 h-12 w-[2px] -translate-x-1/2 bg-slate-300" />
                            {/* Spacer (same height as vertical above) */}
                            <div className="h-12" />
                            <Node node={node.left} level={level + 1} parentId={node.id} leg="left" />
                        </div>

                        {/* Right child container */}
                        <div className="relative flex flex-col items-center">
                            {/* Horizontal crossbar: gap midpoint → center */}
                            <div className="absolute -left-3 top-0 h-[2px] w-[calc(50%+0.75rem)] bg-slate-300" />
                            {/* Vertical: crossbar → right child top */}
                            <div className="absolute left-1/2 top-0 h-12 w-[2px] -translate-x-1/2 bg-slate-300" />
                            {/* Spacer */}
                            <div className="h-12" />
                            <Node node={node.right} level={level + 1} parentId={node.id} leg="right" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NetworkIndex({ tree, ancestors }: Props) {
    const isSubTree = ancestors.length > 0;

    function handleBack() {
        if (ancestors.length >= 2) {
            navigateTo(ancestors[ancestors.length - 2].id);
        } else {
            navigateHome();
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Diagram Jaringan" />

            <div className="flex flex-col gap-6 p-4 text-foreground md:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Diagram Jaringan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Visualisasi struktur jaringan binary Anda.</p>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-white px-4 py-3 md:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Kembali ke atas / title */}
                            {isSubTree ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Kembali ke atas
                                </button>
                            ) : (
                                <span className="text-sm font-medium text-muted-foreground">Pohon Jaringan</span>
                            )}

                            {/* Legend */}
                            <div className="flex gap-3 text-[11px] text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded bg-gray-300" />
                                    Silver
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded bg-amber-400" />
                                    Gold
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded bg-[#1B2B1B]" />
                                    Platinum
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="overflow-x-auto bg-slate-50/50 p-6 md:p-10">
                        {tree ? (
                            <div className="flex min-w-[640px] justify-center py-6">
                                <Node node={tree} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                                <UserIcon className="mb-3 h-10 w-10 opacity-30" />
                                <p className="font-medium">Profil jaringan belum tersedia.</p>
                                <p className="mt-1 text-sm">Aktivasi akun Anda untuk melihat jaringan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
