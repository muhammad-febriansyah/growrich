import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpCircle,
    CheckCircle2,
    HelpCircle,
    Package,
    Plus,
    Shield,
    Star,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';
import { register } from '@/routes';

interface PackageItem {
    name: string;
    price: number;
    pairing_point: number;
    max_pairing: number;
    sponsor_bonus: number;
    reward_point: number;
    upgrade_price: number | null;
    next_package: string | null;
    is_popular: boolean;
}

const packageColors: Record<string, { badge: string; border: string; icon: string; glow: string; heading: string }> = {
    Silver: {
        badge: 'bg-gray-100 text-gray-600',
        border: 'border-gray-200 hover:border-gray-300',
        icon: 'bg-gray-100 text-gray-500',
        glow: '',
        heading: 'text-gray-700',
    },
    Gold: {
        badge: 'bg-primary text-white',
        border: 'border-primary/40 ring-2 ring-primary/20',
        icon: 'bg-primary/10 text-primary',
        glow: 'shadow-xl shadow-primary/10',
        heading: 'text-primary',
    },
    Platinum: {
        badge: 'bg-violet-100 text-violet-700',
        border: 'border-violet-200 hover:border-violet-300',
        icon: 'bg-violet-50 text-violet-600',
        glow: '',
        heading: 'text-violet-600',
    },
};

const packageBenefits: Record<string, string[]> = {
    Silver: [
        'Bonus Sponsor hingga Rp 200.000',
        'Pairing Bonus 1 PP per aktivasi',
        'Maks. 10 pasang/hari',
        'Maks. bonus pairing Rp 1.000.000/hari',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
    Gold: [
        'Bonus Sponsor hingga Rp 400.000',
        'Pairing Bonus 2 PP per aktivasi',
        'Maks. 20 pasang/hari',
        'Maks. bonus pairing Rp 2.000.000/hari',
        'Reward Point 1 poin per aktivasi',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
    Platinum: [
        'Bonus Sponsor hingga Rp 600.000',
        'Pairing Bonus 3 PP per aktivasi',
        'Maks. 30 pasang/hari',
        'Maks. bonus pairing Rp 3.000.000/hari',
        'Reward Point 2 poin per aktivasi',
        'Prioritas dukungan admin',
        'Akses dashboard member',
        'Support komunitas aktif',
    ],
};

const comparisonRows: { label: string; key: (pkg: PackageItem) => React.ReactNode }[] = [
    {
        label: 'Harga Registrasi',
        key: (pkg) => `Rp ${(pkg.price / 1_000_000).toFixed(2).replace('.', ',')} jt`,
    },
    {
        label: 'Pairing Point per Aktivasi',
        key: (pkg) => `${pkg.pairing_point} PP`,
    },
    {
        label: 'Maks. Pairing per Hari',
        key: (pkg) => `${pkg.max_pairing} pasang`,
    },
    {
        label: 'Maks. Bonus Pairing/Hari',
        key: (pkg) => `Rp ${(pkg.max_pairing * 100_000).toLocaleString('id')}`,
    },
    {
        label: 'Bonus Sponsor (maks.)',
        key: (pkg) => `Rp ${pkg.sponsor_bonus.toLocaleString('id')}`,
    },
    {
        label: 'Reward Point per Aktivasi',
        key: (pkg) => (pkg.reward_point > 0 ? `${pkg.reward_point} poin` : <X className="mx-auto h-4 w-4 text-gray-300" />),
    },
    {
        label: 'Prioritas Dukungan Admin',
        key: (pkg) =>
            pkg.name === 'Platinum' ? (
                <CheckCircle2 className="mx-auto h-4 w-4 text-primary" />
            ) : (
                <X className="mx-auto h-4 w-4 text-gray-300" />
            ),
    },
    {
        label: 'Harga Upgrade ke Paket Berikut',
        key: (pkg) =>
            pkg.upgrade_price
                ? `Rp ${(pkg.upgrade_price / 1_000_000).toFixed(2).replace('.', ',')} jt`
                : <span className="text-gray-300">—</span>,
    },
];

const faqs = [
    {
        q: 'Apakah ada biaya bulanan atau tahunan?',
        a: 'Tidak ada. Harga registrasi adalah biaya satu kali. Setelah aktif, tidak ada biaya langganan tambahan.',
    },
    {
        q: 'Bisakah saya upgrade paket setelah bergabung?',
        a: 'Ya, bisa. Anda dapat upgrade dari Silver → Gold atau Gold → Platinum kapan saja dengan membayar selisih harga melalui fitur upgrade di dashboard member.',
    },
    {
        q: 'Apa bedanya Pairing Point dengan paket berbeda?',
        a: 'Pairing Point (PP) yang Anda hasilkan per aktivasi menentukan kecepatan pertumbuhan jaringan Anda. Silver = 1 PP, Gold = 2 PP, Platinum = 3 PP per aktivasi member baru.',
    },
    {
        q: 'Apakah Reward Point bisa ditukar hadiah?',
        a: 'Ya. Reward Point dikumpulkan dan dapat ditukar dengan berbagai hadiah fisik (misalnya motor, mobil, umroh, dll.) yang tersedia di program reward GrowRich.',
    },
    {
        q: 'Bagaimana cara mendapatkan PIN aktivasi?',
        a: 'PIN aktivasi bisa didapat dari sponsor Anda atau dibeli langsung melalui sistem. Setelah memiliki PIN, masukkan saat proses registrasi untuk mengaktifkan paket.',
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`rounded-2xl border bg-white transition-all duration-200 ${open ? 'border-primary/20 shadow-sm' : 'border-gray-100'}`}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
            >
                <span className="text-sm font-semibold text-gray-900">{q}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${open ? 'rotate-45 bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Plus className="h-3.5 w-3.5" />
                </span>
            </button>
            {open && (
                <div className="border-t border-gray-50 px-6 py-4">
                    <p className="text-sm leading-relaxed text-gray-500">{a}</p>
                </div>
            )}
        </div>
    );
}

export default function Paket({
    packages,
    canRegister = true,
}: {
    packages: PackageItem[];
    canRegister?: boolean;
}) {
    return (
        <HomeLayout>
            <Head title="Paket Bergabung — GrowRich" />

            <PageHeader
                title="Paket Bergabung"
                description="Pilih paket yang sesuai dengan target Anda dan mulai membangun jaringan GrowRich hari ini."
            />

            {/* ── Package Cards ──────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white py-16 lg:py-24">
                <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
                <div className="pointer-events-none absolute top-10 -right-32 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    <div className="mb-12 text-center space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <Package className="h-3.5 w-3.5" />
                            3 Pilihan Paket
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                            Mulai dari Paket <span className="text-primary">yang Tepat</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Setiap paket memberikan akses penuh ke dashboard dan semua jenis bonus. Perbedaannya hanya pada batas pairing harian dan reward point.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
                        {packages.map((pkg) => {
                            const colors = packageColors[pkg.name] ?? packageColors.Silver;
                            const benefits = packageBenefits[pkg.name] ?? [];

                            return (
                                <div
                                    key={pkg.name}
                                    className={`relative flex flex-col rounded-3xl border bg-white p-8 transition-all duration-300 ${colors.border} ${colors.glow}`}
                                >
                                    {pkg.is_popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg shadow-primary/30">
                                                <Star className="h-3 w-3 fill-white" />
                                                Paling Populer
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6 flex items-center justify-between">
                                        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${colors.icon}`}>
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                                            {pkg.name}
                                        </span>
                                    </div>

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

                                    <div className="mb-6 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                                            <p className="text-lg font-black text-gray-900">{pkg.pairing_point} PP</p>
                                            <p className="text-[10px] font-medium text-gray-400">Per Aktivasi</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 p-3 text-center">
                                            <p className="text-lg font-black text-gray-900">{pkg.max_pairing}x</p>
                                            <p className="text-[10px] font-medium text-gray-400">Maks/Hari</p>
                                        </div>
                                    </div>

                                    <ul className="mb-8 flex-1 space-y-2.5">
                                        {benefits.map((b) => (
                                            <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600">
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>

                                    {canRegister ? (
                                        <Link
                                            href={register()}
                                            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                                pkg.is_popular
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90'
                                                    : 'border-2 border-gray-200 text-gray-700 hover:border-primary/40 hover:text-primary'
                                            }`}
                                        >
                                            Daftar Paket {pkg.name}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <div className={`flex items-center justify-center rounded-2xl py-3.5 text-sm font-bold ${pkg.is_popular ? 'bg-primary/10 text-primary' : 'bg-gray-50 text-gray-400'}`}>
                                            Registrasi Ditutup
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Semua paket dapat di-upgrade kapan saja. Harga sudah termasuk produk starter kit.
                    </p>
                </div>
            </section>

            {/* ── Comparison Table ──────────────────────────────────── */}
            <section className="bg-gray-50/60 py-16 lg:py-20">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="mb-10 text-center space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <Zap className="h-3.5 w-3.5" />
                            Perbandingan Lengkap
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                            Bandingkan Semua <span className="text-primary">Paket</span>
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        {/* Header */}
                        <div className="grid grid-cols-4 border-b border-gray-100 bg-gray-50">
                            <div className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Fitur</div>
                            {packages.map((pkg) => {
                                const colors = packageColors[pkg.name] ?? packageColors.Silver;
                                return (
                                    <div key={pkg.name} className={`px-4 py-4 text-center ${pkg.is_popular ? 'bg-primary/5' : ''}`}>
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                                            {pkg.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Rows */}
                        {comparisonRows.map((row, i) => (
                            <div
                                key={row.label}
                                className={`grid grid-cols-4 items-center border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                            >
                                <div className="px-5 py-3.5 text-sm text-gray-500">{row.label}</div>
                                {packages.map((pkg) => (
                                    <div key={pkg.name} className={`px-4 py-3.5 text-center text-sm font-semibold text-gray-800 ${pkg.is_popular ? 'bg-primary/5' : ''}`}>
                                        {row.key(pkg)}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* CTA row */}
                        {canRegister && (
                            <div className="grid grid-cols-4 items-center border-t border-gray-100 bg-white px-0 py-4">
                                <div className="px-5 text-sm font-semibold text-gray-500" />
                                {packages.map((pkg) => (
                                    <div key={pkg.name} className={`px-4 text-center ${pkg.is_popular ? 'bg-primary/5' : ''}`}>
                                        <Link
                                            href={register()}
                                            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-105 ${
                                                pkg.is_popular
                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                    : 'border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary'
                                            }`}
                                        >
                                            Pilih {pkg.name}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Upgrade Path ──────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white py-16 lg:py-20">
                <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-4xl px-4 md:px-6">
                    <div className="mb-10 text-center space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Upgrade Paket
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                            Mulai Kecil, <span className="text-primary">Tumbuh Besar</span>
                        </h2>
                        <p className="mx-auto max-w-xl text-gray-500">
                            Anda tidak harus langsung memilih paket tertinggi. Mulai dari Silver dan upgrade kapan saja seiring pertumbuhan bisnis Anda.
                        </p>
                    </div>

                    {/* Upgrade steps */}
                    <div className="relative flex flex-col items-center gap-0">
                        {packages.map((pkg, i) => {
                            const colors = packageColors[pkg.name] ?? packageColors.Silver;
                            const isLast = i === packages.length - 1;

                            return (
                                <div key={pkg.name} className="flex w-full flex-col items-center">
                                    {/* Card */}
                                    <div className={`w-full max-w-md rounded-2xl border bg-white p-5 ${colors.border} ${colors.glow}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors.icon}`}>
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-black ${colors.heading}`}>
                                                        Paket {pkg.name}
                                                    </span>
                                                    {pkg.is_popular && (
                                                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                                                            Populer
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Rp {(pkg.price / 1_000_000).toFixed(2).replace('.', ',')} jt · {pkg.pairing_point} PP · Maks. {pkg.max_pairing} pasang/hari
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Maks. bonus</p>
                                                <p className="text-sm font-black text-gray-900">
                                                    Rp {(pkg.max_pairing * 100_000).toLocaleString('id')}
                                                </p>
                                                <p className="text-[10px] text-gray-400">per hari</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upgrade arrow */}
                                    {!isLast && pkg.upgrade_price && (
                                        <div className="my-3 flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-2 rounded-full border border-dashed border-primary/30 bg-primary/5 px-4 py-1.5">
                                                <ArrowUpCircle className="h-4 w-4 text-primary" />
                                                <span className="text-xs font-semibold text-primary">
                                                    Upgrade ke {pkg.next_package}: Rp {(pkg.upgrade_price / 1_000_000).toFixed(2).replace('.', ',')} jt
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        Harga upgrade adalah selisih harga paket — tidak perlu bayar penuh harga paket baru.
                    </p>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────── */}
            <section className="bg-gray-50/60 py-16 lg:py-20">
                <div className="mx-auto max-w-3xl px-4 md:px-6">
                    <div className="mb-10 text-center space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <HelpCircle className="h-3.5 w-3.5" />
                            Pertanyaan Umum
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                            Tentang <span className="text-primary">Paket</span>
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            {canRegister && (
                <section className="relative overflow-hidden bg-primary py-16 lg:py-20">
                    <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.06%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

                    <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                            </span>
                            Daftar Sekarang
                        </div>

                        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
                            Pilih Paket &amp; Mulai Sekarang
                        </h2>
                        <p className="mx-auto mb-8 max-w-xl text-base text-white/80">
                            Bergabung dengan ribuan member aktif GrowRich. Aktivasi akun Anda dalam hitungan menit.
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
            )}
        </HomeLayout>
    );
}
