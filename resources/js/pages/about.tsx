import { Head } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
import { Eye, LucideIcon, Target } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';

interface LegalPage {
    title: string;
    content: string | null;
    vision: string | null;
    mission: string | null;
    image_url: string | null;
}

interface FeatureItem {
    id: number;
    icon: string;
    title: string;
    description: string;
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

const richTextClass =
    'text-gray-600 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:mb-4 [&_ul]:space-y-2 [&_ul]:pl-0 [&_ul]:list-none [&_li]:flex [&_li]:items-start [&_li]:gap-2 [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-800';

export default function About({ page, features }: { page: LegalPage; features: FeatureItem[] }) {
    return (
        <HomeLayout>
            <Head title={`${page.title} — GrowRich`} />

            <PageHeader
                title={page.title}
                description="Kenali lebih dekat GrowRich — platform ekosistem MLM modern untuk kebebasan finansial Anda."
            />

            {/* About + Image */}
            <section className="bg-white py-14 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    <div className={`gap-12 ${page.image_url ? 'grid lg:grid-cols-2 lg:items-center' : 'max-w-3xl mx-auto'}`}>
                        {/* Text */}
                        <div>
                            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                                Siapa Kami
                            </span>
                            <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                                Tentang <span className="text-primary">GrowRich</span>
                            </h2>
                            {page.content && (
                                <div
                                    className="text-gray-600 [&_p]:mb-4 [&_p]:leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            )}
                        </div>

                        {/* Image */}
                        {page.image_url && (
                            <div className="relative">
                                <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
                                <img
                                    src={page.image_url}
                                    alt="Tentang GrowRich"
                                    className="relative w-full rounded-2xl object-cover shadow-xl"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Visi & Misi */}
            {(page.vision || page.mission) && (
                <section className="bg-gray-50/60 py-14 lg:py-20">
                    <div className="mx-auto max-w-7xl px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Visi */}
                            {page.vision && (
                                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/8 blur-2xl" />
                                    <div className="relative">
                                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Eye className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Visi Kami</h3>
                                        <div
                                            className={richTextClass}
                                            dangerouslySetInnerHTML={{ __html: page.vision }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Misi */}
                            {page.mission && (
                                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/8 blur-2xl" />
                                    <div className="relative">
                                        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                            <Target className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-4 text-xl font-bold text-gray-900">Misi Kami</h3>
                                        <div
                                            className="text-gray-600 [&_ul]:space-y-3 [&_ul]:pl-0 [&_ul]:list-none [&_li]:flex [&_li]:items-start [&_li]:gap-2.5 [&_li]:leading-relaxed [&_p]:mb-3 [&_p]:leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: page.mission }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* Fitur Unggulan */}
            {features.length > 0 && (
                <section className="bg-white py-14 lg:py-20">
                    <div className="mx-auto max-w-7xl px-4 md:px-6">
                        <div className="mb-12 text-center">
                            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                                Keunggulan Platform
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                                Mengapa Memilih <span className="text-primary">GrowRich?</span>
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-base text-gray-500">
                                Fitur-fitur unggulan yang dirancang untuk mendukung pertumbuhan bisnis dan jaringan Anda.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, i) => (
                                <div
                                    key={feature.id}
                                    className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-xl"
                                >
                                    <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/8 blur-2xl transition-all duration-300 group-hover:bg-primary/14" />
                                    <div className={`relative mb-6 inline-flex h-13 w-13 items-center justify-center rounded-2xl ${iconColors[i % iconColors.length]}`}>
                                        <DynamicIcon name={feature.icon} className="h-6 w-6" />
                                    </div>
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
            )}
        </HomeLayout>
    );
}
