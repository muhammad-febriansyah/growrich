import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays, FileText } from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import { register } from '@/routes';

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
}

interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    published_at: string | null;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function BlogShow({ post, related }: { post: Post; related: RelatedPost[] }) {
    return (
        <HomeLayout>
            <Head title={`${post.title} — GrowRich`} />

            {/* ── Hero / Thumbnail ──────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gray-900 pt-28 pb-0 lg:pt-36">
                {/* Blur background from thumbnail */}
                {post.thumbnail_url && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
                        style={{ backgroundImage: `url(${post.thumbnail_url})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900" />

                <div className="relative mx-auto max-w-3xl px-4 pb-10 md:px-6">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-white/50">
                        <Link href="/" className="transition-colors hover:text-white">Home</Link>
                        <span>/</span>
                        <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
                        <span>/</span>
                        <span className="text-white/80 line-clamp-1">{post.title}</span>
                    </nav>

                    {/* Date */}
                    {post.published_at && (
                        <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-white/60">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(post.published_at)}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white lg:text-4xl">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="mt-4 text-base leading-relaxed text-white/70">{post.excerpt}</p>
                    )}
                </div>

                {/* Thumbnail image */}
                {post.thumbnail_url && (
                    <div className="relative mx-auto mt-8 max-w-3xl px-4 md:px-6">
                        <div className="overflow-hidden rounded-t-2xl">
                            <img
                                src={post.thumbnail_url}
                                alt={post.title}
                                className="h-72 w-full object-cover lg:h-96"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Article Content ───────────────────────────────────── */}
            <section className="bg-white py-12 lg:py-16">
                <div className="mx-auto max-w-3xl px-4 md:px-6">

                    {/* Back button */}
                    <Link
                        href="/blog"
                        className="mb-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-primary/30 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Blog
                    </Link>

                    {/* Content */}
                    <div
                        className="prose prose-sm max-w-none text-gray-600
                            [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900
                            [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800
                            [&_p]:mb-4 [&_p]:leading-relaxed
                            [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                            [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
                            [&_li]:leading-relaxed
                            [&_a]:text-primary [&_a]:underline
                            [&_strong]:font-semibold [&_strong]:text-gray-800
                            [&_img]:rounded-2xl [&_img]:w-full [&_img]:my-6
                            [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Divider + CTA */}
                    <div className="mt-14 rounded-2xl border border-primary/15 bg-primary/5 p-6">
                        <p className="mb-1 text-sm font-bold text-gray-900">Tertarik bergabung dengan GrowRich?</p>
                        <p className="mb-4 text-xs leading-relaxed text-gray-500">
                            Mulai perjalanan finansial Anda bersama ribuan member aktif GrowRich.
                        </p>
                        <Link
                            href={register()}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
                        >
                            Daftar Sekarang
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Related Posts ─────────────────────────────────────── */}
            {related.length > 0 && (
                <section className="border-t border-gray-100 bg-gray-50/50 py-14 lg:py-16">
                    <div className="mx-auto max-w-6xl px-4 md:px-6">
                        <h2 className="mb-8 text-xl font-extrabold text-gray-900">
                            Artikel <span className="text-primary">Lainnya</span>
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/blog/${item.slug}`}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                                >
                                    <div className="overflow-hidden bg-gray-50">
                                        {item.thumbnail_url ? (
                                            <img
                                                src={item.thumbnail_url}
                                                alt={item.title}
                                                className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                                                <FileText className="h-10 w-10 text-primary/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                        {item.published_at && (
                                            <p className="mb-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                                                <CalendarDays className="h-3 w-3" />
                                                {formatDate(item.published_at)}
                                            </p>
                                        )}
                                        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary">
                                            {item.title}
                                        </h3>
                                        {item.excerpt && (
                                            <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                                                {item.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                                            Baca
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </HomeLayout>
    );
}
