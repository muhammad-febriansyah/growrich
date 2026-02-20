import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';
import { register } from '@/routes';

interface CaraBergabungItem {
    title: string;
    desc: string;
    image_url: string | null;
}

interface CompensationItem {
    title: string;
    description: string;
}

interface CompensationColumn {
    title: string;
    description: string;
    items: CompensationItem[];
}

interface ResellerProgramSettingsData {
    cara_bergabung: CaraBergabungItem[];
    compensation_title: string;
    compensation_description: string;
    compensation_columns: CompensationColumn[];
    trip_title: string;
    trip_description: string;
    trip_images_urls: string[];
}

interface Props {
    settings: ResellerProgramSettingsData;
}

export default function ResellerProgram({ settings }: Props) {
    const caraBergabung = settings.cara_bergabung || [];
    const compensationColumns = settings.compensation_columns || [];

    return (
        <HomeLayout>
            <Head title="Reseller Program - GrowRich" />

            <PageHeader
                title="Reseller Program"
                description="Bergabunglah sebagai reseller dan raih penghasilan tak terbatas bersama GrowRich."
            />

            <div className="pt-16 pb-24">
                <div className="mx-auto max-w-7xl px-4 md:px-6">
                    {/* ── Cara Bergabung ── */}
                    <section className="mb-24">
                        <div className="mb-12 text-center">
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl font-outfit uppercase">
                                Cara Bergabung
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {caraBergabung.map((item, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col items-center rounded-[2rem] border-2 border-pink-100 bg-white p-10 text-center transition-all hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 group"
                                >
                                    <div className="mb-8 h-48 w-full flex items-center justify-center p-4">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="h-40 w-40 bg-gray-50 flex items-center justify-center rounded-2xl">
                                                <div className="h-20 w-20 bg-gray-100 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mb-6 text-2xl font-black text-primary font-outfit uppercase tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-lg leading-relaxed text-gray-600">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Compensation Plan ── */}
                    <section>
                        <div className="mb-12 text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl font-outfit uppercase mb-6">
                                {settings.compensation_title}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                {settings.compensation_description}
                            </p>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-3">
                            {compensationColumns.map((column, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col rounded-[2rem] border border-pink-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="p-8 pb-4 text-center">
                                        <h3 className="text-xl font-black text-primary mb-4 font-outfit uppercase tracking-widest border-b-2 border-primary/10 pb-4 inline-block px-6">
                                            {column.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed mt-4 text-left">
                                            {column.description}
                                        </p>
                                    </div>

                                    <div className="flex-1 p-8 pt-0">
                                        <div className="space-y-8 mt-6">
                                            {column.items.map((item, j) => (
                                                <div key={j} className="relative pl-6">
                                                    {/* Custom bullet */}
                                                    <div className="absolute left-0 top-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-primary" />

                                                    <h4 className="text-lg font-black text-primary mb-2 font-outfit uppercase tracking-tight leading-none">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Trip Program ── */}
                    <section className="mt-24">
                        <div className="mb-12 text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl font-outfit uppercase mb-6">
                                {settings.trip_title}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                {settings.trip_description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {settings.trip_images_urls?.map((url, i) => (
                                <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                                    <img
                                        src={url}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Global Register CTA ── */}
                    <div className="mt-20 text-center">
                        <Link
                            href={register()}
                            className="inline-flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-lg font-black text-white shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 font-outfit uppercase tracking-wider"
                        >
                            Daftar Sekarang
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
