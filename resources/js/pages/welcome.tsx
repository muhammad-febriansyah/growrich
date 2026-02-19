import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, CheckCircle, DollarSign, LucideIcon, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { Marquee } from '@/components/ui/marquee';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/layouts/home-layout';
import { register } from '@/routes';

interface HeroData {
    badge: string;
    title: string;
    title_highlight: string;
    description: string;
    image_url: string | null;
    stats_value: string;
    stats_label: string;
}

interface FeatureItem {
    id: number;
    icon: string;
    title: string;
    description: string;
}

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

interface TestimonialItem {
    id: number;
    name: string;
    role: string | null;
    avatar: string | null;
    content: string;
    rating: number;
}

interface PackageItem {
    name: string;
    price: number;
    pairing_point: number;
    max_pairing: number;
    sponsor_bonus: number;
    is_popular: boolean;
}

const iconColors = [
    'bg-primary/10 text-primary',
    'bg-emerald-50 text-emerald-600',
    'bg-violet-50 text-violet-600',
    'bg-amber-50 text-amber-600',
    'bg-sky-50 text-sky-600',
    'bg-rose-50 text-rose-600',
];

function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
    if (!Icon) {
        return <LucideIcons.Sparkles className={className} />;
    }
    return <Icon className={className} />;
}

const defaultImage =
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop';

const packageBenefits: Record<string, string[]> = {
    Silver: [
        'Bonus Sponsor hingga Rp 200.000',
        'Pairing Bonus 1 PP per pasang',
        'Maks. 10 pasang/hari',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
    Gold: [
        'Bonus Sponsor hingga Rp 400.000',
        'Pairing Bonus 2 PP per pasang',
        'Maks. 20 pasang/hari',
        'Reward point 1 poin/aktivasi',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
    Platinum: [
        'Bonus Sponsor hingga Rp 600.000',
        'Pairing Bonus 3 PP per pasang',
        'Maks. 30 pasang/hari',
        'Reward point 2 poin/aktivasi',
        'Prioritas dukungan admin',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
};

const packageColors: Record<string, { badge: string; border: string; icon: string; glow: string }> = {
    Silver: {
        badge: 'bg-gray-100 text-gray-600',
        border: 'border-gray-200 hover:border-gray-300',
        icon: 'bg-gray-100 text-gray-500',
        glow: '',
    },
    Gold: {
        badge: 'bg-primary text-white',
        border: 'border-primary/40 ring-2 ring-primary/20',
        icon: 'bg-primary/10 text-primary',
        glow: 'shadow-xl shadow-primary/10',
    },
    Platinum: {
        badge: 'bg-violet-100 text-violet-700',
        border: 'border-violet-200 hover:border-violet-300',
        icon: 'bg-violet-50 text-violet-600',
        glow: '',
    },
};

export default function Welcome({
    canRegister = true,
    hero,
    features = [],
    packages = [],
    testimonials = [],
    faqs = [],
}: {
    canRegister?: boolean;
    hero: HeroData;
    features?: FeatureItem[];
    packages?: PackageItem[];
    testimonials?: TestimonialItem[];
    faqs?: FaqItem[];
}) {
    return (
        <HomeLayout transparentNavbar>
            <Head title="GrowRich - Accelerate Your Growth" />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white pt-32 pb-0 lg:pt-40">
                {/* blur blobs */}
                <div className="pointer-events-none absolute -top-32 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
                <div className="pointer-events-none absolute top-10 -right-32 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[100px]" />
                <div className="pointer-events-none absolute top-[40%] left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[80px]" />

                <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        <AnimatedShinyText className="text-sm font-semibold text-primary via-primary/80">
                            {hero.badge}
                        </AnimatedShinyText>
                    </div>

                    {/* Heading */}
                    <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
                        {hero.title}{' '}
                        <span className="text-primary">{hero.title_highlight}</span>
                        <br className="hidden sm:block" />
                        {' '}Bersama Kami
                    </h1>

                    {/* Description */}
                    <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
                        {hero.description}
                    </p>

                    {/* CTA */}
                    {canRegister && (
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-14 rounded-full bg-primary px-10 text-base font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                            >
                                <Link href={register()}>
                                    Mulai Sekarang
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-14 rounded-full border-gray-200 px-10 text-base font-semibold text-gray-600 hover:border-primary/30 hover:text-primary"
                            >
                                <a href="/#marketing-plan">Lihat Marketing Plan</a>
                            </Button>
                        </div>
                    )}

                    {/* Trust indicators */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                        {[
                            'Bonus transparan & real-time',
                            'Jaringan binary terstruktur',
                            'Support komunitas aktif',
                        ].map((item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Hero Image */}
                <div className="relative mx-auto mt-16 max-w-5xl px-4 md:px-6">
                    {/* Browser chrome decoration */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/80">
                        {/* Browser top bar */}
                        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-red-400" />
                            <span className="h-3 w-3 rounded-full bg-yellow-400" />
                            <span className="h-3 w-3 rounded-full bg-green-400" />
                            <div className="mx-auto flex items-center gap-2 rounded-full bg-white px-4 py-1 text-xs text-gray-400 border border-gray-200">
                                <span className="h-2 w-2 rounded-full bg-primary/60" />
                                growrich.id
                            </div>
                        </div>
                        {/* Image */}
                        <img
                            src={hero.image_url ?? defaultImage}
                            alt="GrowRich Dashboard"
                            className="w-full object-cover"
                            style={{ maxHeight: '480px', objectPosition: 'top' }}
                        />
                    </div>

                    {/* Floating stats cards */}
                    <div className="absolute -left-2 bottom-12 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100 md:flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{hero.stats_label}</p>
                            <p className="text-xl font-black text-gray-900">{hero.stats_value}</p>
                        </div>
                    </div>

                    <div className="absolute -right-2 bottom-12 hidden rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100 md:flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bonus Dibayarkan</p>
                            <p className="text-xl font-black text-gray-900">Rp 2M+</p>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="mt-12 border-t border-gray-100 bg-gray-50/60">
                    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                            {[
                                { icon: <Users className="h-5 w-5" />, prefix: '', number: 1200, suffix: '+', label: 'Member Aktif' },
                                { icon: <DollarSign className="h-5 w-5" />, prefix: 'Rp ', number: 2, suffix: 'M+', label: 'Total Bonus' },
                                { icon: <Star className="h-5 w-5" />, prefix: '', number: 6, suffix: ' Tipe', label: 'Jenis Bonus' },
                                { icon: <Zap className="h-5 w-5" />, prefix: '', number: 3, suffix: ' Paket', label: 'Pilihan Bergabung' },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        {stat.icon}
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-gray-900">
                                            {stat.prefix}
                                            <NumberTicker value={stat.number} />
                                            {stat.suffix}
                                        </p>
                                        <p className="text-xs text-gray-500">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gray-50/50 py-24 lg:py-32">
                {/* subtle bg blobs */}
                <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <LucideIcons.Sparkles className="h-3.5 w-3.5" />
                            Fitur Unggulan
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                            Mengapa Memilih <span className="text-primary">GrowRich?</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Platform lengkap yang dirancang untuk mempercepat pertumbuhan bisnis MLM Anda.
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => (
                            <div
                                key={feature.id}
                                className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-xl"
                            >
                                {/* blur blob primary di dalam card */}
                                <div className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/15" />

                                {/* Icon */}
                                <div className={`relative mb-6 inline-flex h-13 w-13 items-center justify-center rounded-2xl ${iconColors[i % iconColors.length]}`}>
                                    <DynamicIcon name={feature.icon} className="h-6 w-6" />
                                </div>

                                {/* Text */}
                                <h3 className="relative mb-2 text-base font-bold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="relative text-sm leading-relaxed text-gray-500">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Packages ─────────────────────────────────────────── */}
            <section id="packages" className="bg-white py-24 lg:py-32">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <LucideIcons.Package className="h-3.5 w-3.5" />
                            Paket Bergabung
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                            Pilih Paket <span className="text-primary">Terbaik Anda</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Mulai perjalanan bisnis Anda dengan paket yang sesuai. Upgrade kapan saja seiring pertumbuhan jaringan Anda.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                        {packages.map((pkg) => {
                            const colors = packageColors[pkg.name] ?? packageColors.Silver;
                            const benefits = packageBenefits[pkg.name] ?? [];

                            return (
                                <div
                                    key={pkg.name}
                                    className={`relative flex flex-col rounded-3xl border bg-white p-8 transition-all duration-300 ${colors.border} ${colors.glow}`}
                                >
                                    {/* Popular badge */}
                                    {pkg.is_popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/30">
                                                <LucideIcons.Star className="h-3 w-3 fill-white" />
                                                Paling Populer
                                            </span>
                                        </div>
                                    )}

                                    {/* Package name */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${colors.icon}`}>
                                            <LucideIcons.Shield className="h-5 w-5" />
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                                            {pkg.name}
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-semibold text-gray-400">Rp</span>
                                            <span className="text-4xl font-black text-gray-900">
                                                {(pkg.price / 1_000_000).toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-400">jt</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">Harga registrasi satu kali</p>
                                    </div>

                                    {/* Key stats */}
                                    <div className="mb-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                                            <p className="text-lg font-black text-gray-900">{pkg.pairing_point} PP</p>
                                            <p className="text-[10px] font-medium text-gray-400">Per Pasang</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                                            <p className="text-lg font-black text-gray-900">{pkg.max_pairing}x</p>
                                            <p className="text-[10px] font-medium text-gray-400">Maks/Hari</p>
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <ul className="mb-8 flex-1 space-y-2.5">
                                        {benefits.map((b) => (
                                            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <LucideIcons.CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    {canRegister ? (
                                        <Link
                                            href={register()}
                                            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${pkg.is_popular
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90'
                                                    : 'border-2 border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary'
                                                }`}
                                        >
                                            Daftar Paket {pkg.name}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <div className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold ${pkg.is_popular ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            Registrasi Ditutup
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom note */}
                    <p className="mt-10 text-center text-sm text-gray-400">
                        Semua paket dapat di-upgrade kapan saja. Harga sudah termasuk produk starter kit.
                    </p>
                </div>
            </section>

            {/* ── Marketing Plan ───────────────────────────────────── */}
            <section id="marketing-plan" className="relative overflow-hidden bg-gray-50/50 py-24 lg:py-32">
                <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    {/* Section Header */}
                    <div className="mb-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <LucideIcons.BarChart3 className="h-3.5 w-3.5" />
                            Marketing Plan
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                            6 Jenis <span className="text-primary">Bonus Menggiurkan</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Sistem jaringan binary dengan 6 jalur bonus transparan yang mengalir setiap hari dan setiap bulan.
                        </p>
                    </div>

                    {/* Daily Bonuses */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                <LucideIcons.Sun className="h-3 w-3" />
                                Bonus Harian
                            </span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <BonusCard
                                icon={<LucideIcons.UserPlus className="h-6 w-6" />}
                                iconColor="bg-primary/10 text-primary"
                                title="Bonus Sponsor"
                                tag="Instan"
                                tagColor="bg-primary/10 text-primary"
                                description="Diterima langsung saat berhasil merekrut member baru ke jaringan Anda."
                                details={[
                                    { label: 'Silver × Siapapun', value: 'Rp 200.000' },
                                    { label: 'Gold × Gold/Platinum', value: 'Rp 400.000' },
                                    { label: 'Platinum × Platinum', value: 'Rp 600.000' },
                                ]}
                            />
                            <BonusCard
                                icon={<LucideIcons.GitBranch className="h-6 w-6" />}
                                iconColor="bg-emerald-50 text-emerald-600"
                                title="Bonus Pairing"
                                tag="Setiap Hari"
                                tagColor="bg-emerald-50 text-emerald-600"
                                description="Rp 100.000 per pasang dari pencocokan jaringan binary kiri & kanan."
                                details={[
                                    { label: 'Silver', value: 'Maks. 10 pasang/hari' },
                                    { label: 'Gold', value: 'Maks. 20 pasang/hari' },
                                    { label: 'Platinum', value: 'Maks. 30 pasang/hari' },
                                ]}
                            />
                            <BonusCard
                                icon={<LucideIcons.Share2 className="h-6 w-6" />}
                                iconColor="bg-violet-50 text-violet-600"
                                title="Bonus Matching"
                                tag="Setiap Hari"
                                tagColor="bg-violet-50 text-violet-600"
                                description="Persentase dari pairing bonus downline hingga 10 generasi ke bawah."
                                details={[
                                    { label: 'Generasi 1–4', value: '15%' },
                                    { label: 'Generasi 5–6', value: '10%' },
                                    { label: 'Generasi 7–10', value: '5%' },
                                ]}
                            />
                            <BonusCard
                                icon={<LucideIcons.Layers className="h-6 w-6" />}
                                iconColor="bg-amber-50 text-amber-600"
                                title="Bonus Leveling"
                                tag="Setiap Hari"
                                tagColor="bg-amber-50 text-amber-600"
                                description="Berdasarkan kombinasi paket kiri & kanan direct downline Anda."
                                details={[
                                    { label: 'Silver + Silver', value: 'Rp 250.000' },
                                    { label: 'Gold + Gold', value: 'Rp 500.000' },
                                    { label: 'Platinum + Platinum', value: 'Rp 750.000' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Monthly Bonuses */}
                    <div className="mb-16">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-600">
                                <LucideIcons.CalendarDays className="h-3 w-3" />
                                Bonus Bulanan
                            </span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <BonusCard
                                icon={<LucideIcons.RefreshCw className="h-6 w-6" />}
                                iconColor="bg-sky-50 text-sky-600"
                                title="Bonus Repeat Order"
                                tag="Per Bulan"
                                tagColor="bg-sky-50 text-sky-600"
                                description="5% dari total omset Repeat Order downline G1–G7 dalam satu bulan."
                                details={[
                                    { label: 'Syarat Pribadi', value: 'RO ≥ Rp 1 jt/bulan' },
                                    { label: 'Komisi Downline', value: '5% dari total RO' },
                                    { label: 'Jangkauan', value: 'Generasi 1–7' },
                                ]}
                            />
                            <BonusCard
                                icon={<LucideIcons.Globe className="h-6 w-6" />}
                                iconColor="bg-rose-50 text-rose-600"
                                title="Bonus Global Sharing"
                                tag="Per Bulan"
                                tagColor="bg-rose-50 text-rose-600"
                                description="Bagian dari pool omset nasional yang dibagi rata ke seluruh member per level karir."
                                details={[
                                    { label: 'Syarat Pribadi', value: 'RO ≥ Rp 1 jt/bulan' },
                                    { label: 'Sumber Pool', value: 'Omset RO Nasional' },
                                    { label: 'Share per Level', value: '1% – 3%' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Career Path */}
                    <div>
                        <div className="mb-8 text-center space-y-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Jalur Karir & <span className="text-primary">Global Sharing</span>
                            </h3>
                            <p className="text-sm text-gray-500">
                                Level karir naik otomatis saat syarat Pairing Point terpenuhi pada kedua kaki jaringan Anda.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <div className="grid grid-cols-3 border-b border-gray-100 bg-gray-50 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span>Level Karir</span>
                                <span className="text-center">Min. PP (Leg Terkecil)</span>
                                <span className="text-right">Global Sharing</span>
                            </div>
                            {[
                                { level: 'Member', pp: '—', share: '0%', color: 'text-gray-400', dot: 'bg-gray-300' },
                                { level: 'Core Loader', pp: '25 PP', share: '1%', color: 'text-blue-600', dot: 'bg-blue-400' },
                                { level: 'Sapphire Manager', pp: '100 PP', share: '1%', color: 'text-cyan-600', dot: 'bg-cyan-400' },
                                { level: 'Ruby Manager', pp: '500 PP', share: '1%', color: 'text-rose-600', dot: 'bg-rose-400' },
                                { level: 'Emerald Manager', pp: '1.000 PP', share: '1.5%', color: 'text-emerald-600', dot: 'bg-emerald-400' },
                                { level: 'Diamond Manager', pp: '5.000 PP', share: '2%', color: 'text-violet-600', dot: 'bg-violet-400' },
                                { level: 'Blue Diamond Manager', pp: '10.000 PP', share: '2.5%', color: 'text-indigo-600', dot: 'bg-indigo-400' },
                                { level: 'Elite Team Global', pp: '25.000 PP', share: '3%', color: 'text-amber-600', dot: 'bg-amber-400' },
                            ].map((row, i) => (
                                <div
                                    key={row.level}
                                    className={`grid grid-cols-3 items-center border-t border-gray-50 px-6 py-3.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                >
                                    <span className="flex items-center gap-2 font-semibold">
                                        <span className={`h-2 w-2 rounded-full ${row.dot}`} />
                                        <span className={row.color}>{row.level}</span>
                                    </span>
                                    <span className="text-center text-gray-600">{row.pp}</span>
                                    <span className={`text-right font-bold ${row.share === '0%' ? 'text-gray-400' : row.color}`}>
                                        {row.share}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className="mt-4 text-center text-xs text-gray-400">
                            PP = Pairing Point · Setiap member baru yang bergabung menghasilkan PP untuk upline-nya
                        </p>
                    </div>
                </div>
            </section>

            {/* ── How to Join ───────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gray-50/50 py-24 lg:py-32">
                {/* bg blobs */}
                <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-5xl px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-16 text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <LucideIcons.MapPin className="h-3.5 w-3.5" />
                            Cara Bergabung
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                            Mulai dalam <span className="text-primary">4 Langkah</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Proses bergabung yang mudah dan cepat. Dalam hitungan menit, akun Anda sudah aktif dan siap membangun jaringan.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="relative">
                        {/* connector line desktop */}
                        <div className="pointer-events-none absolute top-10 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] hidden h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent lg:block" />

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    step: '01',
                                    icon: <LucideIcons.UserPlus className="h-6 w-6" />,
                                    title: 'Buat Akun',
                                    desc: 'Isi formulir pendaftaran dengan data diri yang valid. Proses hanya butuh 2 menit.',
                                    color: 'bg-primary/10 text-primary',
                                    dot: 'bg-primary',
                                },
                                {
                                    step: '02',
                                    icon: <LucideIcons.Package className="h-6 w-6" />,
                                    title: 'Pilih Paket',
                                    desc: 'Tentukan paket Silver, Gold, atau Platinum sesuai target dan kemampuan Anda.',
                                    color: 'bg-emerald-50 text-emerald-600',
                                    dot: 'bg-emerald-500',
                                },
                                {
                                    step: '03',
                                    icon: <LucideIcons.KeyRound className="h-6 w-6" />,
                                    title: 'Aktivasi PIN',
                                    desc: 'Masukkan PIN aktivasi yang didapat dari sponsor atau beli langsung melalui sistem.',
                                    color: 'bg-violet-50 text-violet-600',
                                    dot: 'bg-violet-500',
                                },
                                {
                                    step: '04',
                                    icon: <LucideIcons.TrendingUp className="h-6 w-6" />,
                                    title: 'Raih Bonus',
                                    desc: 'Akun aktif! Mulai bangun jaringan dan nikmati berbagai bonus yang mengalir setiap hari.',
                                    color: 'bg-amber-50 text-amber-600',
                                    dot: 'bg-amber-500',
                                },
                            ].map((s, i) => (
                                <div key={i} className="group flex flex-col items-center text-center lg:items-center">
                                    {/* Icon circle */}
                                    <div className="relative mb-5">
                                        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-white shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg ${s.color}`}>
                                            {s.icon}
                                        </div>
                                        {/* Step number badge */}
                                        <span className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white shadow ${s.dot}`}>
                                            {s.step}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 text-base font-bold text-gray-900">{s.title}</h3>
                                    <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA inline */}
                    {canRegister && (
                        <div className="mt-14 text-center">
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                            >
                                Mulai Sekarang — Gratis
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────────── */}
            {testimonials.length > 0 && (
                <section className="relative overflow-hidden bg-white py-24 lg:py-32">
                    <div className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                    <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                        {/* Header */}
                        <div className="mb-14 text-center space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                <LucideIcons.MessageSquareQuote className="h-3.5 w-3.5" />
                                Testimoni Member
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                                Mereka Sudah <span className="text-primary">Membuktikannya</span>
                            </h2>
                            <p className="mx-auto max-w-xl text-gray-500">
                                Ribuan member aktif telah merasakan manfaat nyata dari platform GrowRich.
                            </p>
                        </div>
                    </div>

                    {/* Marquee rows — fade edges */}
                    <div className="relative">
                        {/* left fade */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
                        {/* right fade */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

                        {/* Row 1 — forward */}
                        <Marquee pauseOnHover repeat={3} className="[--duration:35s] [--gap:1.25rem] mb-4">
                            {testimonials.slice(0, Math.ceil(testimonials.length / 2)).map((t) => (
                                <TestimonialCard key={t.id} testimonial={t} />
                            ))}
                        </Marquee>

                        {/* Row 2 — reverse */}
                        <Marquee pauseOnHover reverse repeat={3} className="[--duration:35s] [--gap:1.25rem]">
                            {testimonials.slice(Math.ceil(testimonials.length / 2)).map((t) => (
                                <TestimonialCard key={t.id} testimonial={t} />
                            ))}
                        </Marquee>
                    </div>
                </section>
            )}

            {/* ── FAQ ───────────────────────────────────────────────── */}
            {faqs.length > 0 && (
                <section id="faq" className="relative overflow-hidden bg-gray-50/50 py-24 lg:py-32">
                    <div className="pointer-events-none absolute -bottom-20 left-1/2 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                    <div className="relative mx-auto max-w-3xl px-4 md:px-6">
                        {/* Header */}
                        <div className="mb-14 text-center space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                <LucideIcons.HelpCircle className="h-3.5 w-3.5" />
                                FAQ
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
                                Pertanyaan yang Sering <span className="text-primary">Ditanyakan</span>
                            </h2>
                            <p className="mx-auto max-w-xl text-gray-500">
                                Temukan jawaban atas pertanyaan umum seputar GrowRich di sini.
                            </p>
                        </div>

                        {/* Accordion */}
                        <div className="space-y-3">
                            {faqs.map((faq, i) => (
                                <FaqAccordion key={faq.id} faq={faq} defaultOpen={i === 0} />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <p className="mt-10 text-center text-sm text-gray-400">
                            Masih ada pertanyaan?{' '}
                            <a href="/#contact" className="font-semibold text-primary hover:underline">
                                Hubungi kami
                            </a>
                        </p>
                    </div>
                </section>
            )}

        </HomeLayout>
    );
}

function BonusCard({
    icon,
    iconColor,
    title,
    tag,
    tagColor,
    description,
    details,
}: {
    icon: React.ReactNode;
    iconColor: string;
    title: string;
    tag: string;
    tagColor: string;
    description: string;
    details: { label: string; value: string }[];
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lg">
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />

            <div className="mb-4 flex items-start justify-between">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconColor}`}>
                    {icon}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tagColor}`}>{tag}</span>
            </div>

            <h4 className="relative mb-2 font-bold text-gray-900">{title}</h4>
            <p className="relative mb-4 text-xs leading-relaxed text-gray-500">{description}</p>

            <div className="relative space-y-1.5">
                {details.map((d) => (
                    <div key={d.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                        <span className="text-gray-500">{d.label}</span>
                        <span className="font-bold text-gray-900">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FaqAccordion({ faq, defaultOpen = false }: { faq: FaqItem; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-2xl border bg-white transition-all duration-200 ${open ? 'border-primary/20 shadow-sm' : 'border-gray-100'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            >
                <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${open ? 'bg-primary text-white rotate-45' : 'bg-gray-100 text-gray-500'}`}>
                    <LucideIcons.Plus className="h-3.5 w-3.5" />
                </span>
            </button>
            {open && (
                <div className="border-t border-gray-50 px-6 py-4">
                    <p className="text-sm leading-relaxed text-gray-500">{faq.answer}</p>
                </div>
            )}
        </div>
    );
}

function TestimonialCard({ testimonial: t }: { testimonial: TestimonialItem }) {
    const initials = t.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('');

    return (
        <div className="w-[300px] shrink-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            {/* Stars */}
            <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Content */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600">"{t.content}"</p>

            {/* Author */}
            <div className="flex items-center gap-3">
                {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {initials}
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    {t.role && <p className="text-xs text-gray-400">{t.role}</p>}
                </div>
            </div>
        </div>
    );
}
