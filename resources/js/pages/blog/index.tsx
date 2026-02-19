import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, CalendarDays, FileText, Rss } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
}

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function PostCard({ post }: { post: Post }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden bg-gray-50">
                {post.thumbnail_url ? (
                    <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <FileText className="h-12 w-12 text-primary/20" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
                {post.published_at && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(post.published_at)}
                    </div>
                )}

                <h2 className="mb-3 line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-primary">
                    {post.title}
                </h2>

                {post.excerpt && (
                    <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500">
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Baca Selengkapnya
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}

export default function BlogIndex({ posts }: { posts: PaginatedPosts }) {
    const hasPosts = posts.data.length > 0;

    return (
        <HomeLayout>
            <Head title="Blog — GrowRich" />

            <PageHeader
                title="Blog GrowRich"
                description="Tips, inspirasi, dan informasi terbaru seputar bisnis, karir, dan gaya hidup dari GrowRich."
            />

            <section className="relative overflow-hidden bg-gray-50/40 py-14 lg:py-20">
                <div className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    {/* Header row */}
                    <div className="mb-10 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                            <Rss className="h-3.5 w-3.5" />
                            {hasPosts ? `${posts.total} Artikel` : 'Blog'}
                        </div>
                    </div>

                    {hasPosts ? (
                        <>
                            {/* Grid */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {posts.data.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {posts.last_page > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    {posts.links.map((link, i) => {
                                        if (!link.url && !link.active) {
                                            return (
                                                <span
                                                    key={i}
                                                    className="px-3 py-2 text-sm text-gray-300"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                                    link.active
                                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                                        : 'border border-gray-200 text-gray-600 hover:border-primary/30 hover:text-primary'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className="rounded-xl border border-gray-100 px-4 py-2 text-sm text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty state */
                        <div className="rounded-3xl border border-gray-100 bg-white py-24 text-center">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <BookOpen className="h-8 w-8" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-gray-900">
                                Belum Ada Artikel
                            </h3>
                            <p className="mx-auto max-w-xs text-sm text-gray-500">
                                Konten blog sedang dalam persiapan. Kunjungi kembali nanti untuk membaca artikel terbaru dari GrowRich.
                            </p>
                            <Link
                                href="/"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
                            >
                                Kembali ke Home
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </HomeLayout>
    );
}
