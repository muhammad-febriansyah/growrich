import { useState } from 'react';

type Screen = 'menu' | 'produk' | 'paket' | 'bonus' | 'daftar' | 'hubungi';

const PRODUCTS = [
    { id: 1, name: 'MOIREA IONA', sku: 'IONA-001', price: 'Rp 612.500', roPrice: 'Rp 485.000', slug: 1 },
    { id: 2, name: 'MOIREA MACRA', sku: 'MACRA-001', price: 'Rp 612.500', roPrice: 'Rp 465.000', slug: 2 },
    { id: 3, name: 'MOIREA ALCEO', sku: 'ALCEO-001', price: 'Rp 612.500', roPrice: 'Rp 375.000', slug: 3 },
    { id: 4, name: 'MOIREA NICETO', sku: 'NICETO-001', price: 'Rp 612.500', roPrice: 'Rp 415.000', slug: 4 },
    { id: 5, name: 'BEAUTY ACTIVATOR', sku: 'BA-001', price: 'Rp 4.900.000', roPrice: 'Rp 3.500.000', slug: 5 },
];

const PACKAGES = [
    { name: 'Silver', reg: 'Rp 2.450.000', pp: '1 PP/member', maxPairing: '10 pasang/hari', leveling: 'Rp 250.000' },
    { name: 'Gold', reg: 'Rp 4.900.000', upgrade: 'Rp 2.450.000', pp: '2 PP/member', maxPairing: '20 pasang/hari', leveling: 'Rp 500.000' },
    { name: 'Platinum', reg: 'Rp 7.350.000', pp: '3 PP/member', maxPairing: '30 pasang/hari', leveling: 'Rp 750.000' },
];

const BONUSES = [
    { title: 'Bonus Sponsor', desc: 'Diterima langsung saat berhasil merekrut member baru.', details: 'Silver: Rp 200rb • Gold: Rp 400rb • Platinum: Rp 600rb' },
    { title: 'Bonus Pairing', desc: 'Rp 100.000 per pasang dari jaringan binary kiri & kanan.', details: 'Silver: 10 pasang/hari • Gold: 20 • Platinum: 30' },
    { title: 'Bonus Matching', desc: 'Persentase dari pairing bonus downline hingga 10 generasi.', details: 'G1–4: 15% • G5–6: 10% • G7–10: 5%' },
    { title: 'Bonus Leveling', desc: 'Berdasarkan kombinasi paket direct downline kiri & kanan.', details: 'S+S: Rp 250rb • G+G: Rp 500rb • P+P: Rp 750rb' },
    { title: 'Bonus Repeat Order', desc: '5% dari total RO downline G1–G7 per bulan.', details: 'Syarat: RO pribadi ≥ Rp 1 jt/bln' },
    { title: 'Bonus Global Sharing', desc: 'Bagian dari pool omset nasional per level karir.', details: 'Share: 1%–3% • Syarat: RO ≥ Rp 1 jt/bln' },
];

const STEPS = [
    { no: '1', title: 'Hubungi Sponsor', desc: 'Minta referral code dari sponsor atau mentor GrowRich Anda.' },
    { no: '2', title: 'Pilih Paket', desc: 'Pilih paket Silver, Gold, atau Platinum sesuai kemampuan.' },
    { no: '3', title: 'Beli PIN Aktivasi', desc: 'Lakukan pembayaran untuk mendapatkan PIN aktivasi.' },
    { no: '4', title: 'Daftar Akun', desc: 'Daftarkan akun menggunakan PIN dan referral code.' },
    { no: '5', title: 'Mulai Bisnis', desc: 'Akun aktif! Bangun jaringan dan raih bonus Anda.' },
];

const TITLES: Record<Screen, string> = {
    menu: 'Informasi & Bantuan',
    produk: 'Produk',
    paket: 'Paket Bergabung',
    bonus: 'Sistem Bonus',
    daftar: 'Cara Daftar',
    hubungi: 'Hubungi Kami',
};

const ChevronRight = () => (
    <svg className="h-4 w-4 text-gray-300 group-hover:text-green-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const IconBox = ({ children }: { children: React.ReactNode }) => (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors">
        {children}
    </span>
);

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [screen, setScreen] = useState<Screen>('menu');

    const handleOpen = () => {
        setOpen((v) => !v);
        setScreen('menu');
    };

    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
            {open && (
                <div className="w-72 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1a5c0e] to-[#2d9e1a] text-white">
                        {screen !== 'menu' && (
                            <button onClick={() => setScreen('menu')} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 transition-colors shrink-0">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div className="relative shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">G</div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">GrowRich</p>
                            <p className="text-[10px] text-white/70 truncate">{TITLES[screen]}</p>
                        </div>
                        <button onClick={() => setOpen(false)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {/* Main Menu */}
                        {screen === 'menu' && (
                            <div className="p-2">
                                {[
                                    {
                                        id: 'produk' as Screen, label: 'Produk',
                                        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>,
                                    },
                                    {
                                        id: 'paket' as Screen, label: 'Paket Bergabung',
                                        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                                    },
                                    {
                                        id: 'bonus' as Screen, label: 'Sistem Bonus',
                                        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                                    },
                                    {
                                        id: 'daftar' as Screen, label: 'Cara Daftar',
                                        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
                                    },
                                    {
                                        id: 'hubungi' as Screen, label: 'Hubungi Kami',
                                        icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
                                    },
                                ].map((item) => (
                                    <button key={item.id} onClick={() => setScreen(item.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group">
                                        <IconBox>{item.icon}</IconBox>
                                        <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-green-800 text-left transition-colors">{item.label}</span>
                                        <ChevronRight />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Produk */}
                        {screen === 'produk' && (
                            <div className="p-2">
                                {PRODUCTS.map((p) => (
                                    <a key={p.id} href={`/produk/${p.slug}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group">
                                        <IconBox>
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                                        </IconBox>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 group-hover:text-green-800 transition-colors">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.sku} · Member: <span className="text-green-700 font-medium">{p.roPrice}</span></p>
                                        </div>
                                        <ChevronRight />
                                    </a>
                                ))}
                                <div className="px-3 pt-1 pb-2">
                                    <a href="/produk" className="block w-full text-center py-2 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors">
                                        Lihat Semua Produk
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Paket */}
                        {screen === 'paket' && (
                            <div className="p-2">
                                {PACKAGES.map((pkg) => (
                                    <div key={pkg.name} className="px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors mb-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-sm font-semibold text-gray-800">Paket {pkg.name}</span>
                                            <span className="text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">{pkg.reg}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-gray-500">
                                            <span>Pairing Point: <b className="text-gray-700">{pkg.pp}</b></span>
                                            <span>Max Pairing: <b className="text-gray-700">{pkg.maxPairing}</b></span>
                                            <span>Bonus Leveling: <b className="text-gray-700">{pkg.leveling}</b></span>
                                            {pkg.upgrade && <span>Upgrade: <b className="text-gray-700">{pkg.upgrade}</b></span>}
                                        </div>
                                    </div>
                                ))}
                                <div className="px-3 pt-1 pb-2">
                                    <a href="/paket" className="block w-full text-center py-2 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors">
                                        Lihat Detail Paket
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Bonus */}
                        {screen === 'bonus' && (
                            <div className="p-2">
                                {BONUSES.map((b) => (
                                    <div key={b.title} className="px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors mb-1">
                                        <p className="text-sm font-semibold text-gray-800">{b.title}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{b.desc}</p>
                                        <p className="text-xs text-green-700 mt-0.5 font-medium">{b.details}</p>
                                    </div>
                                ))}
                                <div className="px-3 pt-1 pb-2">
                                    <a href="/marketing-plan" className="block w-full text-center py-2 rounded-xl border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors">
                                        Lihat Marketing Plan
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Cara Daftar */}
                        {screen === 'daftar' && (
                            <div className="p-3 space-y-2">
                                {STEPS.map((s) => (
                                    <div key={s.no} className="flex gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1a5c0e] to-[#2d9e1a] text-white text-xs font-bold">{s.no}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                                <a href="/register" className="block w-full text-center py-2 rounded-xl bg-gradient-to-r from-[#1a5c0e] to-[#2d9e1a] text-white text-xs font-semibold hover:opacity-90 transition-opacity mt-1">
                                    Daftar Sekarang
                                </a>
                            </div>
                        )}

                        {/* Hubungi */}
                        {screen === 'hubungi' && (
                            <div className="p-2">
                                {[
                                    { href: 'https://wa.me/6281295916567', label: 'WhatsApp', sub: '0812-9591-6567', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg> },
                                    { href: 'tel:081295916567', label: 'Telepon', sub: '0812-9591-6567', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> },
                                    { href: 'mailto:growrich@gmail.com', label: 'Email', sub: 'growrich@gmail.com', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
                                    { href: '/contact', label: 'Lihat Alamat', sub: 'Jl. Cihampelas No. 201A, Bandung', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group">
                                        <IconBox>{item.icon}</IconBox>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 group-hover:text-green-800 transition-colors">{item.label}</p>
                                            <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                                        </div>
                                        <ChevronRight />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 py-2 px-4">
                        <p className="text-[10px] text-gray-400 text-center">Powered by GrowRich</p>
                    </div>
                </div>
            )}

            {/* Bubble */}
            <button
                onClick={handleOpen}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1a5c0e] to-[#2d9e1a] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
                {open
                    ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                }
            </button>
        </div>
    );
}
