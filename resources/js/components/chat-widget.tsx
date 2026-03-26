import { useState } from 'react';

const menuItems = [
    {
        label: 'Produk',
        href: '/produk',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
        ),
    },
    {
        label: 'Paket Bergabung',
        href: '/paket',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: 'Sistem Bonus',
        href: '/marketing-plan',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        label: 'Cara Daftar',
        href: '/register',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
    },
    {
        label: 'Hubungi Kami',
        href: '/contact',
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
        ),
    },
];

export default function ChatWidget() {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
            {open && (
                <div className="w-64 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 bg-white">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1a5c0e] to-[#2d9e1a] text-white">
                        <div className="relative">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">G</div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sm leading-tight">GrowRich</p>
                            <p className="text-[10px] text-white/70">Informasi & Bantuan</p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu */}
                    <div className="p-2">
                        {menuItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700 group-hover:bg-green-100 transition-colors">
                                    {item.icon}
                                </span>
                                <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-green-800 transition-colors">
                                    {item.label}
                                </span>
                                <svg className="h-4 w-4 text-gray-300 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 py-2 px-4">
                        <p className="text-[10px] text-gray-400 text-center">Powered by GrowRich</p>
                    </div>
                </div>
            )}

            {/* Bubble button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1a5c0e] to-[#2d9e1a] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
                {open ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
