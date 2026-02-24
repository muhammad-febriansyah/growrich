import React from 'react';
import { Head, Link } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import {
    ArrowRight,
    BarChart3,
    CalendarDays,
    CheckCircle2,
    GitBranch,
    Globe,
    Layers,
    RefreshCw,
    Share2,
    Shield,
    Sun,
    UserPlus,
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';
import { register } from '@/routes';

interface PackageItem {
    name: string;
    price: number;
    pairing_point: number;
    max_pairing: number;
    sponsor_bonus: number;
}

interface CareerLevelItem {
    id: number;
    key: string;
    label: string;
    required_pp: number;
    global_share_percent: number;
    dot_color: string | null;
    text_color: string | null;
}

interface MarketingBonusItem {
    id: number;
    category: 'daily' | 'monthly';
    icon: string;
    icon_color: string | null;
    tag: string | null;
    tag_color: string | null;
    title: string;
    description: string;
    details: { label: string; value: string }[] | null;
}


const packageColors: Record<string, { icon: string; border: string; badge: string }> = {
    Silver: { icon: 'bg-gray-100 text-gray-500', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
    Gold: { icon: 'bg-primary/10 text-primary', border: 'border-primary/30 ring-2 ring-primary/10', badge: 'bg-primary text-white' },
    Platinum: { icon: 'bg-violet-50 text-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700' },
};

function SectionDivider({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
    return (
        <div className="mb-6 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${color}`}>
                {icon}
                {label}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
        </div>
    );
}

function BonusBlock({
    icon,
    iconColor,
    tag,
    tagColor,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    iconColor: string;
    tag: string;
    tagColor: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150" />

            <div className="relative mb-5 flex items-start justify-between">
                <div className={`inline-flex h-13 w-13 items-center justify-center rounded-2xl ${iconColor}`}>
                    {icon}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tagColor}`}>{tag}</span>
            </div>

            <h3 className="relative mb-2 text-lg font-bold text-gray-900">{title}</h3>
            <p className="relative mb-5 text-sm leading-relaxed text-gray-500">{description}</p>

            <div className="relative">{children}</div>
        </div>
    );
}

function DetailRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm ${highlight ? 'bg-primary/5 font-semibold' : 'bg-gray-50'}`}>
            <span className="text-gray-500">{label}</span>
            <span className={`font-bold ${highlight ? 'text-primary' : 'text-gray-900'}`}>{value}</span>
        </div>
    );
}

export default function MarketingPlan({
    packages = [],
    careerLevels = [],
    marketingBonuses = [],
}: {
    packages?: PackageItem[];
    careerLevels?: CareerLevelItem[];
    marketingBonuses?: MarketingBonusItem[];
}) {
    const dailyBonuses = marketingBonuses.filter((b) => b.category === 'daily');
    const monthlyBonuses = marketingBonuses.filter((b) => b.category === 'monthly');

    const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
        const Icon = (LucideIcons as any)[name];
        if (!Icon) return <Shield className={className} />;
        return <Icon className={className} />;
    };

    return (
        <HomeLayout>
            <Head title="Marketing Plan — GrowRich" />

            <PageHeader
                title="Marketing Plan"
                description="Pahami sistem bonus GrowRich secara lengkap dan rencanakan perjalanan finansial Anda."
            />

            {/* ── Intro ─────────────────────────────────────────────── */}
            <section className="bg-white py-14 lg:py-20">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                        <div className="lg:col-span-2">
                            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                                Sistem Binary MLM
                            </span>
                            <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                                Cara Kerja Jaringan <span className="text-primary">GrowRich</span>
                            </h2>
                            <p className="mb-4 text-sm leading-relaxed text-gray-600">
                                GrowRich menggunakan sistem jaringan <strong>binary</strong> — setiap member memiliki dua kaki jaringan (kiri &amp; kanan). Setiap kali Anda atau downline Anda merekrut member baru, mereka akan ditempatkan di salah satu kaki, menghasilkan Pairing Point (PP) yang menjadi dasar perhitungan bonus.
                            </p>
                            <p className="text-sm leading-relaxed text-gray-600">
                                Terdapat <strong>6 jenis bonus</strong> yang bisa Anda nikmati: 4 bonus harian (Sponsor, Pairing, Matching, Leveling) dan 2 bonus bulanan (Repeat Order &amp; Global Sharing). Semakin besar jaringan Anda, semakin besar pula potensi pendapatan yang mengalir setiap harinya.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                            {[
                                { label: 'Jenis Bonus', value: marketingBonuses.length.toString(), color: 'bg-primary/5 text-primary' },
                                { label: 'Bonus Harian', value: dailyBonuses.length.toString(), color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'Bonus Bulanan', value: monthlyBonuses.length.toString(), color: 'bg-sky-50 text-sky-600' },
                                { label: 'Level Karir', value: careerLevels.length.toString(), color: 'bg-amber-50 text-amber-600' },
                            ].map((s) => (
                                <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
                                    <p className="text-3xl font-black">{s.value}</p>
                                    <p className="text-xs font-semibold opacity-70">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Bonus Harian ──────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gray-50/60 py-14 lg:py-20">
                <div className="pointer-events-none absolute -right-20 top-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    <SectionDivider
                        icon={<Sun className="h-3 w-3" />}
                        label="Bonus Harian"
                        color="bg-primary/10 text-primary"
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        {dailyBonuses.map((bonus, idx) => (
                            <BonusBlock
                                key={bonus.id}
                                icon={<DynamicIcon name={bonus.icon} className="h-6 w-6" />}
                                iconColor={bonus.icon_color || 'bg-primary/10 text-primary'}
                                tag={bonus.tag || ''}
                                tagColor={bonus.tag_color || 'bg-primary/10 text-primary'}
                                title={`${idx + 1}. ${bonus.title}`}
                                description={bonus.description}
                            >
                                <div className="space-y-2">
                                    {bonus.details?.map((detail, dIdx) => (
                                        <DetailRow
                                            key={dIdx}
                                            label={detail.label}
                                            value={detail.value}
                                            highlight={dIdx === 0}
                                        />
                                    ))}
                                    {bonus.title === 'Bonus Pairing' && (
                                        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                                            <strong>Catatan:</strong> PP yang sudah dipairing akan dikurangi dari akumulasi kaki kiri &amp; kanan.
                                        </div>
                                    )}
                                    {bonus.title === 'Bonus Matching' && (
                                        <div className="mt-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-700">
                                            <strong>Contoh:</strong> Downline G1 dapat pairing Rp 1.000.000 → Anda dapat <strong>Rp 150.000</strong> matching bonus.
                                        </div>
                                    )}
                                    {bonus.title === 'Bonus Leveling' && (
                                        <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                                            <strong>Catatan:</strong> Kombinasi mixed (mis. Gold + Platinum) menggunakan nilai level yang lebih rendah (Gold = Rp 500.000).
                                        </div>
                                    )}
                                </div>
                            </BonusBlock>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bonus Bulanan ─────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white py-14 lg:py-20">
                <div className="pointer-events-none absolute -left-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-sky-500/5 blur-[100px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    <SectionDivider
                        icon={<CalendarDays className="h-3 w-3" />}
                        label="Bonus Bulanan"
                        color="bg-sky-100 text-sky-600"
                    />

                    <div className="grid gap-5 md:grid-cols-2">
                        {monthlyBonuses.map((bonus, idx) => (
                            <BonusBlock
                                key={bonus.id}
                                icon={<DynamicIcon name={bonus.icon} className="h-6 w-6" />}
                                iconColor={bonus.icon_color || 'bg-sky-50 text-sky-600'}
                                tag={bonus.tag || ''}
                                tagColor={bonus.tag_color || 'bg-sky-50 text-sky-600'}
                                title={`${idx + 5}. ${bonus.title}`}
                                description={bonus.description}
                            >
                                <div className="space-y-2">
                                    {bonus.details?.map((detail, dIdx) => (
                                        <DetailRow
                                            key={dIdx}
                                            label={detail.label}
                                            value={detail.value}
                                        />
                                    ))}
                                    {bonus.title === 'Bonus Repeat Order' && (
                                        <div className="mt-3 rounded-xl bg-sky-50 p-3 text-xs text-sky-700">
                                            <strong>Contoh:</strong> Total RO downline G1–G7 = Rp 10.000.000 → Anda dapat <strong>Rp 500.000</strong> RO bonus.
                                        </div>
                                    )}
                                    {bonus.title === 'Bonus Global Sharing' && (
                                        <div className="space-y-2">
                                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                                <div className="grid grid-cols-2 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                                    <span>Level Karir</span>
                                                    <span className="text-right">Share Pool</span>
                                                </div>
                                                {careerLevels.filter((l) => l.global_share_percent > 0).map((l, i) => (
                                                    <div key={l.key} className={`grid grid-cols-2 px-4 py-2 text-xs border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                                        <span className={`font-medium ${l.text_color ?? 'text-gray-600'}`}>{l.label}</span>
                                                        <span className={`text-right font-bold ${l.text_color ?? 'text-gray-600'}`}>{l.global_share_percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </BonusBlock>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Career Path ───────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gray-50/60 py-14 lg:py-20">
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-4xl px-4 md:px-6">
                    <SectionDivider
                        icon={<BarChart3 className="h-3 w-3" />}
                        label="Jalur Karir"
                        color="bg-amber-100 text-amber-600"
                    />

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                            8 Level <span className="text-primary">Jenjang Karir</span>
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Level naik otomatis saat Pairing Point pada kaki terkecil memenuhi syarat.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="grid grid-cols-12 border-b border-gray-100 bg-gray-50 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <span className="col-span-1 text-center">#</span>
                            <span className="col-span-5">Level Karir</span>
                            <span className="col-span-3 text-center">Min. PP Leg Terkecil</span>
                            <span className="col-span-3 text-right">Global Sharing</span>
                        </div>

                        {careerLevels.map((level, i) => {
                            const dotColor = level.dot_color ?? 'bg-gray-300';
                            const textColor = level.text_color ?? 'text-gray-500';

                            return (
                                <div
                                    key={level.key}
                                    className={`grid grid-cols-12 items-center border-t border-gray-50 px-5 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${level.key === 'EliteTeamGlobal' ? 'bg-amber-50/60' : ''}`}
                                >
                                    <span className="col-span-1 text-center">
                                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white ${dotColor}`}>
                                            {i + 1}
                                        </span>
                                    </span>
                                    <span className={`col-span-5 font-semibold ${textColor}`}>{level.label}</span>
                                    <span className="col-span-3 text-center text-sm text-gray-600">
                                        {level.required_pp === 0 ? '—' : `${level.required_pp.toLocaleString('id')} PP`}
                                    </span>
                                    <span className={`col-span-3 text-right text-sm font-bold ${level.global_share_percent === 0 ? 'text-gray-300' : textColor}`}>
                                        {level.global_share_percent === 0 ? '—' : `${level.global_share_percent}%`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-4 text-center text-xs text-gray-400">
                        PP = Pairing Point · Setiap member baru yang bergabung menghasilkan PP untuk seluruh upline di jaringannya
                    </p>
                </div>
            </section>

            {/* ── Package Summary ───────────────────────────────────── */}
            <section className="bg-white py-14 lg:py-20">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="mb-10 text-center">
                        <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                            Perbandingan Paket
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                            Pilih Paket <span className="text-primary">Sesuai Target Anda</span>
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {packages.map((pkg) => {
                            const colors = packageColors[pkg.name] ?? packageColors.Silver;

                            return (
                                <div key={pkg.name} className={`relative rounded-2xl border bg-white p-6 ${colors.border}`}>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${colors.icon}`}>
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>{pkg.name}</span>
                                    </div>

                                    <div className="mb-5">
                                        <p className="text-2xl font-black text-gray-900">
                                            Rp {(pkg.price / 1_000_000).toFixed(2).replace('.', ',')} jt
                                        </p>
                                        <p className="text-xs text-gray-400">Registrasi satu kali</p>
                                    </div>

                                    <ul className="space-y-2.5 text-sm text-gray-600">
                                        {[
                                            `${pkg.pairing_point} PP per aktivasi`,
                                            `Maks. ${pkg.max_pairing} pasang/hari`,
                                            `Max pairing Rp ${(pkg.max_pairing * 100_000).toLocaleString('id')}/hari`,
                                            `Sponsor bonus hingga Rp ${pkg.sponsor_bonus.toLocaleString('id')}`,
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-2">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-primary py-16 lg:py-20">
                <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.06%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        Bergabung Sekarang
                    </div>

                    <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                        Siap Mulai Perjalanan Finansial Anda?
                    </h2>
                    <p className="mx-auto mb-8 max-w-xl text-base text-white/80">
                        Pilih paket yang sesuai, aktivasi akun Anda, dan mulai bangun jaringan untuk menikmati 6 jenis bonus GrowRich.
                    </p>

                    <Link
                        href={register()}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-xl shadow-black/20 transition-all hover:scale-105 hover:bg-gray-50 active:scale-95"
                    >
                        Daftar Sekarang
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </HomeLayout>
    );
}
