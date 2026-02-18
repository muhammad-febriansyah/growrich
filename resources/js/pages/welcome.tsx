import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ArrowRight, Smartphone, TrendingUp, Users } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-white selection:bg-primary selection:text-white">
            <Head title="GrowRich - Accelerate Your Growth" />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-4 md:px-6">
                    <AppLogo />
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                                <Link href={dashboard()}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Link href={login()} className="hidden sm:block text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                                    Masuk
                                </Link>
                                {canRegister && (
                                    <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                                        <Link href={register()}>Daftar Sekarang</Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32">
                <div className="absolute top-0 right-0 -z-10 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent blur-3xl" />
                <div className="mx-auto max-w-7xl px-4 md:px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left duration-700">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                            </span>
                            Solusi Pertumbuhan Akurat
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 md:text-7xl lg:text-8xl leading-tight">
                            Wujudkan <br /><span className="text-primary italic">Kebebasan Finansial</span> Bersama Kami
                        </h1>
                        <p className="max-w-xl text-lg text-gray-600 leading-relaxed mx-auto lg:mx-0 md:text-xl">
                            Platform ekosistem MLM modern yang dirancang untuk mempercepat karir dan pendapatan Anda dengan transparansi dan teknologi terkini.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
                            <Button size="lg" asChild className="h-16 px-10 bg-primary hover:bg-primary/90 text-lg rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                                <Link href={register()}>Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" /></Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-10 border-gray-200 hover:bg-gray-50 text-lg rounded-full">
                                Pelajari Lebih Lanjut
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 relative animate-in fade-in slide-in-from-right duration-1000 delay-200 w-full max-w-2xl">
                        <div className="relative rounded-3xl border border-gray-100 bg-white p-3 shadow-2xl overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-50" />
                            <img
                                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                                alt="Analytics Dashboard"
                                className="rounded-2xl object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -bottom-8 -left-8 rounded-2xl bg-white p-6 shadow-2xl border border-gray-50 flex items-center gap-4 animate-bounce-subtle hidden md:flex">
                            <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pertumbuhan</p>
                                <p className="text-2xl font-black text-gray-900">+128%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-24 lg:py-32">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className="text-center space-y-4 mb-20 animate-in fade-in slide-in-from-bottom duration-700">
                        <h2 className="text-sm font-bold tracking-widest text-primary uppercase">Fitur Unggulan</h2>
                        <h3 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Mengapa Memilih GrowRich?</h3>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">Alat bantu lengkap yang dirancang khusus untuk mempercepat langkah sukses Anda.</p>
                    </div>

                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <Smartphone />,
                                title: "Kemudahan Mobile",
                                desc: "Kelola jaringan dan bonus Anda kapan saja, di mana saja dengan antarmuka yang responsif dan sangat cepat."
                            },
                            {
                                icon: <TrendingUp />,
                                title: "Sistem Bonus Transparan",
                                desc: "Lacak setiap komisi dan bonus Anda secara real-time. Tidak ada potongan tersembunyi, semua transparan."
                            },
                            {
                                icon: <Users />,
                                title: "Jaringan Tanpa Batas",
                                desc: "Bangun tim impian Anda dengan alat manajemen downline yang intuitif untuk hasil duplikasi maksimal."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="group relative rounded-3xl bg-white p-10 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 flex flex-col items-start text-left">
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{feature.title}</h4>
                                <p className="text-gray-600 leading-relaxed text-lg">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 lg:py-40 bg-gray-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(34,122,19,0.5),transparent)] pointer-events-none" />
                <div className="mx-auto max-w-5xl px-4 md:px-6 relative flex flex-col items-center text-center space-y-10">
                    <h2 className="text-5xl font-black tracking-tight md:text-7xl leading-tight">Siap untuk Mengubah <br /><span className="text-primary">Hidup Anda?</span></h2>
                    <p className="text-gray-400 max-w-2xl text-lg md:text-xl leading-relaxed">
                        Bergabunglah dengan ribuan member sukses lainnya yang telah membuktikan potensi nyata GrowRich. Masa depan Anda dimulai dari satu klik di bawah ini.
                    </p>
                    <Button size="lg" asChild className="h-20 px-14 bg-primary hover:bg-primary/90 text-2xl font-black rounded-full shadow-[0_0_50px_rgba(35,122,19,0.3)] transition-all hover:scale-105 active:scale-95 group">
                        <Link href={register()}>Daftar Member Sekarang <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform" /></Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 py-16 bg-white">
                <div className="mx-auto max-w-7xl px-4 md:px-6 flex flex-col items-center gap-10">
                    <AppLogo showName={true} className="scale-125" />
                    <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
                        <Link href="/about" className="text-base font-medium text-gray-500 hover:text-primary transition-colors">Tentang Kami</Link>
                        <Link href="/marketing-plan" className="text-base font-medium text-gray-500 hover:text-primary transition-colors">Marketing Plan</Link>
                        <Link href="/products" className="text-base font-medium text-gray-500 hover:text-primary transition-colors">Produk</Link>
                        <Link href="/contact" className="text-base font-medium text-gray-500 hover:text-primary transition-colors">Hubungi Kami</Link>
                    </nav>
                    <div className="h-px w-full bg-gray-100" />
                    <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} GrowRich. Seluruh hak cipta dilindungi.
                        </p>
                        <div className="flex gap-8">
                            <Link href="/terms" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors underline underline-offset-4">Syarat & Ketentuan</Link>
                            <Link href="/privacy" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors underline underline-offset-4">Kebijakan Privasi</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
