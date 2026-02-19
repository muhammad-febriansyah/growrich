import { Head } from '@inertiajs/react';
import { CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';

interface LegalPage {
    title: string;
    content: string;
    updated_at: string;
}

export default function Privacy({ page }: { page: LegalPage }) {
    const updatedAt = new Date(page.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <HomeLayout>
            <Head title={`${page.title} — GrowRich`} />

            <PageHeader
                title={page.title}
                description="Kebijakan privasi dan perlindungan data pengguna GrowRich."
            />

            <section className="bg-white py-12 lg:py-16">
                <div className="mx-auto max-w-3xl px-4 md:px-6">

                    {/* Info card */}
                    <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <Sparkles className="h-3 w-3" />
                                    Penting
                                </div>
                                <p className="text-sm font-semibold text-gray-900">Dokumen Legal</p>
                                <p className="text-xs text-gray-500">Harap baca dengan saksama sebelum menggunakan layanan kami</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Diperbarui: {updatedAt}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mb-10 h-1 w-full rounded-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />

                    {/* Content */}
                    <div
                        className="text-gray-600 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-gray-800"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />

                    <div className="mt-14 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500">
                        Masih ada pertanyaan?{' '}
                        <a href="/#contact" className="font-semibold text-primary hover:underline">
                            Hubungi kami
                        </a>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
