import React from 'react';
import { Head, Link } from '@inertiajs/react';
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
    value: string;
    label: string;
    required_pp: number;
    global_share_percent: number;
}

const careerDotColors: Record<string, string> = {
    Member: 'bg-gray-300',
    CoreLoader: 'bg-blue-400',
    SapphireManager: 'bg-cyan-400',
    RubyManager: 'bg-rose-400',
    EmeraldManager: 'bg-emerald-400',
    DiamondManager: 'bg-violet-400',
    BlueDiamondManager: 'bg-indigo-400',
    EliteTeamGlobal: 'bg-amber-400',
};

const careerTextColors: Record<string, string> = {
    Member: 'text-gray-400',
    CoreLoader: 'text-blue-600',
    SapphireManager: 'text-cyan-600',
    RubyManager: 'text-rose-600',
    EmeraldManager: 'text-emerald-600',
    DiamondManager: 'text-violet-600',
    BlueDiamondManager: 'text-indigo-600',
    EliteTeamGlobal: 'text-amber-600',
};

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
    packages,
    careerLevels,
}: {
    packages: PackageItem[];
    careerLevels: CareerLevelItem[];
}) {
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
                        {/* Description */}
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                            {[
                                { label: 'Jenis Bonus', value: '6', color: 'bg-primary/5 text-primary' },
                                { label: 'Bonus Harian', value: '4', color: 'bg-emerald-50 text-emerald-600' },
                                { label: 'Bonus Bulanan', value: '2', color: 'bg-sky-50 text-sky-600' },
                                { label: 'Level Karir', value: '8', color: 'bg-amber-50 text-amber-600' },
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
                        {/* 1. Bonus Sponsor */}
                        <BonusBlock
                            icon={<UserPlus className="h-6 w-6" />}
                            iconColor="bg-primary/10 text-primary"
                            tag="Instan"
                            tagColor="bg-primary/10 text-primary"
                            title="1. Bonus Sponsor"
                            description="Diterima langsung saat Anda berhasil merekrut member baru. Besarannya ditentukan oleh level paket sponsor dan member baru (menggunakan level yang lebih rendah)."
                        >
                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <span>Sponsor ↓ / Member →</span>
                                    <span className="text-center">Silver</span>
                                    <span className="text-center">Gold</span>
                                    <span className="text-center">Platinum</span>
                                </div>
                                {[
                                    { sponsor: 'Silver', values: ['Rp 200rb', 'Rp 200rb', 'Rp 200rb'] },
                                    { sponsor: 'Gold', values: ['Rp 200rb', 'Rp 400rb', 'Rp 400rb'] },
                                    { sponsor: 'Platinum', values: ['Rp 200rb', 'Rp 400rb', 'Rp 600rb'] },
                                ].map((row, i) => (
                                    <div key={row.sponsor} className={`grid grid-cols-4 items-center border-t border-gray-50 px-4 py-2.5 text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                        <span className="font-semibold text-gray-700">{row.sponsor}</span>
                                        {row.values.map((v, j) => (
                                            <span key={j} className={`text-center font-bold ${v === 'Rp 600rb' ? 'text-primary' : v === 'Rp 400rb' ? 'text-emerald-600' : 'text-gray-600'}`}>{v}</span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </BonusBlock>

                        {/* 2. Bonus Pairing */}
                        <BonusBlock
                            icon={<GitBranch className="h-6 w-6" />}
                            iconColor="bg-emerald-50 text-emerald-600"
                            tag="Setiap Hari"
                            tagColor="bg-emerald-50 text-emerald-600"
                            title="2. Bonus Pairing"
                            description="Dihitung setiap hari dari pencocokan kaki kiri dan kanan jaringan binary Anda. Setiap pasang bernilai Rp 100.000, dibatasi sesuai paket."
                        >
                            <div className="space-y-2">
                                <DetailRow label="Nilai per Pasang" value="Rp 100.000" highlight />
                                {packages.map((pkg) => (
                                    <DetailRow
                                        key={pkg.name}
                                        label={`Paket ${pkg.name}`}
                                        value={`Maks. ${pkg.max_pairing} pasang/hari (Rp ${(pkg.max_pairing * 100_000).toLocaleString('id')})`}
                                    />
                                ))}
                                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                                    <strong>Catatan:</strong> PP yang sudah dipairing akan dikurangi dari akumulasi kaki kiri &amp; kanan.
                                </div>
                            </div>
                        </BonusBlock>

                        {/* 3. Bonus Matching */}
                        <BonusBlock
                            icon={<Share2 className="h-6 w-6" />}
                            iconColor="bg-violet-50 text-violet-600"
                            tag="Setiap Hari"
                            tagColor="bg-violet-50 text-violet-600"
                            title="3. Bonus Matching"
                            description="Anda mendapat persentase dari Bonus Pairing yang diterima downline Anda, dihitung hingga 10 generasi ke bawah setiap harinya."
                        >
                            <div className="space-y-2">
                                {[
                                    { gen: 'Generasi 1 – 4', pct: '15%', color: 'text-violet-600' },
                                    { gen: 'Generasi 5 – 6', pct: '10%', color: 'text-violet-500' },
                                    { gen: 'Generasi 7 – 10', pct: '5%', color: 'text-violet-400' },
                                ].map((row) => (
                                    <div key={row.gen} className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm">
                                        <span className="text-gray-500">{row.gen}</span>
                                        <span className={`text-lg font-black ${row.color}`}>{row.pct}</span>
                                    </div>
                                ))}
                                <div className="mt-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-700">
                                    <strong>Contoh:</strong> Downline G1 dapat pairing Rp 1.000.000 → Anda dapat <strong>Rp 150.000</strong> matching bonus.
                                </div>
                            </div>
                        </BonusBlock>

                        {/* 4. Bonus Leveling */}
                        <BonusBlock
                            icon={<Layers className="h-6 w-6" />}
                            iconColor="bg-amber-50 text-amber-600"
                            tag="Setiap Hari"
                            tagColor="bg-amber-50 text-amber-600"
                            title="4. Bonus Leveling"
                            description="Bonus tambahan berdasarkan kombinasi paket dari direct downline kiri dan kanan Anda. Nilai ditentukan oleh paket yang lebih rendah dari kedua kaki."
                        >
                            <div className="space-y-2">
                                {[
                                    { combo: 'Silver + Silver', value: 'Rp 250.000 / hari', color: 'text-gray-600' },
                                    { combo: 'Gold + Gold', value: 'Rp 500.000 / hari', color: 'text-primary' },
                                    { combo: 'Platinum + Platinum', value: 'Rp 750.000 / hari', color: 'text-violet-600' },
                                ].map((row) => (
                                    <div key={row.combo} className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm">
                                        <span className="text-gray-500">{row.combo}</span>
                                        <span className={`font-bold ${row.color}`}>{row.value}</span>
                                    </div>
                                ))}
                                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                                    <strong>Catatan:</strong> Kombinasi mixed (mis. Gold + Platinum) menggunakan nilai level yang lebih rendah (Gold = Rp 500.000).
                                </div>
                            </div>
                        </BonusBlock>
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
                        {/* 5. Bonus Repeat Order */}
                        <BonusBlock
                            icon={<RefreshCw className="h-6 w-6" />}
                            iconColor="bg-sky-50 text-sky-600"
                            tag="Per Bulan"
                            tagColor="bg-sky-50 text-sky-600"
                            title="5. Bonus Repeat Order"
                            description="Diterima setiap bulan dari total omset Repeat Order seluruh downline Anda hingga 7 generasi. Syarat: Anda harus memiliki RO pribadi minimal Rp 1.000.000 di bulan tersebut."
                        >
                            <div className="space-y-2">
                                <DetailRow label="Komisi dari RO Downline" value="5%" highlight />
                                <DetailRow label="Jangkauan Generasi" value="G1 – G7" />
                                <DetailRow label="Syarat RO Pribadi" value="≥ Rp 1.000.000 / bulan" />
                                <DetailRow label="Syarat RO Downline" value="≥ Rp 1.000.000 total" />
                                <div className="mt-3 rounded-xl bg-sky-50 p-3 text-xs text-sky-700">
                                    <strong>Contoh:</strong> Total RO downline G1–G7 = Rp 10.000.000 → Anda dapat <strong>Rp 500.000</strong> RO bonus.
                                </div>
                            </div>
                        </BonusBlock>

                        {/* 6. Bonus Global Sharing */}
                        <BonusBlock
                            icon={<Globe className="h-6 w-6" />}
                            iconColor="bg-rose-50 text-rose-600"
                            tag="Per Bulan"
                            tagColor="bg-rose-50 text-rose-600"
                            title="6. Bonus Global Sharing"
                            description="Bagian dari pool omset RO nasional yang dibagi rata ke seluruh member dengan level karir yang sama. Semakin tinggi level karir Anda, semakin besar persentase yang Anda dapatkan."
                        >
                            <div className="space-y-2">
                                <DetailRow label="Sumber Pool" value="Omset RO Nasional" highlight />
                                <DetailRow label="Syarat RO Pribadi" value="≥ Rp 1.000.000 / bulan" />
                                <DetailRow label="Dibagi Rata" value="Per member dalam level" />
                                <div className="overflow-hidden rounded-xl border border-gray-100 mt-2">
                                    <div className="grid grid-cols-2 bg-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                        <span>Level Karir</span>
                                        <span className="text-right">% Pool</span>
                                    </div>
                                    {careerLevels.filter((l) => l.global_share_percent > 0).map((l, i) => (
                                        <div key={l.value} className={`grid grid-cols-2 px-4 py-2 text-xs border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                            <span className={`font-medium ${careerTextColors[l.value] ?? 'text-gray-600'}`}>{l.label}</span>
                                            <span className={`text-right font-bold ${careerTextColors[l.value] ?? 'text-gray-600'}`}>{l.global_share_percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </BonusBlock>
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
                            const dotColor = careerDotColors[level.value] ?? 'bg-gray-300';
                            const textColor = careerTextColors[level.value] ?? 'text-gray-500';

                            return (
                                <div
                                    key={level.value}
                                    className={`grid grid-cols-12 items-center border-t border-gray-50 px-5 py-4 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${level.value === 'EliteTeamGlobal' ? 'bg-amber-50/60' : ''}`}
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
