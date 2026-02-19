import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { HelpCircle, Plus } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';
import { register } from '@/routes';

interface FaqItem {
    id: number;
    question: string;
    answer: string;
}

function FaqAccordion({ faq, defaultOpen = false }: { faq: FaqItem; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`rounded-2xl border bg-white transition-all duration-200 ${open ? 'border-primary/20 shadow-sm' : 'border-gray-100'}`}>
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
                <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${open ? 'bg-primary text-white rotate-45' : 'bg-gray-100 text-gray-500'}`}>
                    <Plus className="h-3.5 w-3.5" />
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

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
    return (
        <HomeLayout>
            <Head title="FAQ — GrowRich" />

            <PageHeader
                title="Pertanyaan Umum"
                description="Temukan jawaban atas pertanyaan yang paling sering ditanyakan seputar GrowRich."
            />

            <section className="relative overflow-hidden bg-white py-14 lg:py-20">
                {/* Blur accent */}
                <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />

                <div className="relative mx-auto max-w-3xl px-4 md:px-6">
                    {faqs.length > 0 ? (
                        <>
                            {/* Badge */}
                            <div className="mb-8 flex items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    {faqs.length} Pertanyaan
                                </div>
                            </div>

                            {/* Accordion list */}
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <FaqAccordion key={faq.id} faq={faq} defaultOpen={i === 0} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6 py-14 text-center">
                            <HelpCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm text-gray-500">Belum ada pertanyaan yang tersedia.</p>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="mt-12 rounded-2xl border border-primary/15 bg-primary/5 p-6 text-center">
                        <p className="mb-1 text-sm font-semibold text-gray-900">Tidak menemukan jawaban yang dicari?</p>
                        <p className="mb-4 text-xs text-gray-500">Tim kami siap membantu Anda menjawab pertanyaan lebih lanjut.</p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <a
                                href="/#contact"
                                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-white px-5 py-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                            >
                                Hubungi Kami
                            </a>
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                Bergabung Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
