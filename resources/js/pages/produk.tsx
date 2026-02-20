import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Boxes,
    ExternalLink,
    Package,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Users,
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
import PageHeader from '@/components/page-header';
import { register } from '@/routes';

interface ProductItem {
    id: number;
    name: string;
    description: string | null;
    sku: string;
    unit: string | null;
    image_url: string | null;
    regular_price: number;
    ro_price: number;
    member_discount: number;
    stock: number;
    bpom_number: string | null;
}

function formatRupiah(value: number): string {
    return 'Rp ' + value.toLocaleString('id-ID');
}

function ProductCard({ product }: { product: ProductItem }) {
    const savings = product.regular_price - product.ro_price;
    const inStock = product.stock > 0;

    return (
        <div className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl">
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-50">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <Package className="h-16 w-16 text-gray-200" />
                    </div>
                )}

                {/* Discount badge */}
                {product.member_discount > 0 && (
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-md shadow-primary/30">
                            <Tag className="h-3 w-3" />
                            Hemat {product.member_discount}%
                        </span>
                    </div>
                )}

                {/* Stock badge */}
                {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-gray-700">
                            Stok Habis
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
                {/* SKU + BPOM */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {product.sku}
                    </span>
                    {product.bpom_number && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            <ShieldCheck className="h-3 w-3" />
                            BPOM
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="mb-2 text-base font-extrabold tracking-tight text-gray-900">{product.name}</h3>

                {/* Description */}
                {product.description && (
                    <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-3">{product.description}</p>
                )}

                <div className="mt-auto">
                    {/* Prices */}
                    <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Harga Umum</span>
                            <span className="text-sm text-gray-400 line-through">
                                {formatRupiah(product.regular_price)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                <Users className="h-3 w-3" />
                                Harga Member
                            </span>
                            <span className="text-lg font-black text-gray-900">
                                {formatRupiah(product.ro_price)}
                            </span>
                        </div>
                        {savings > 0 && (
                            <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-2">
                                <span className="text-[10px] text-gray-400">Hemat</span>
                                <span className="text-xs font-bold text-primary">
                                    {formatRupiah(savings)} / {product.unit ?? 'pcs'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Unit info */}
                    {product.unit && (
                        <p className="mb-3 text-xs text-gray-400">
                            Satuan: <span className="font-semibold text-gray-600">{product.unit}</span>
                        </p>
                    )}

                    <Link
                        href={`/produk/${product.id}`}
                        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 py-3 text-sm font-bold text-primary transition-all hover:border-primary hover:bg-primary hover:text-white"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Lihat Detail
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Produk({ products }: { products: ProductItem[] }) {
    return (
        <HomeLayout>
            <Head title="Produk — GrowRich" />

            <PageHeader
                title="Produk Kami"
                description="Produk berkualitas tinggi dengan harga eksklusif untuk member GrowRich."
            />

            {/* ── Info Banner ─────────────────────────────────────── */}
            <section className="border-b border-gray-100 bg-white py-8">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        {[
                            {
                                icon: <Tag className="h-5 w-5" />,
                                color: 'bg-primary/10 text-primary',
                                title: 'Harga Member Lebih Murah',
                                desc: 'Dapatkan harga spesial member (RO Price) yang jauh lebih hemat dari harga umum.',
                            },
                            {
                                icon: <BadgeCheck className="h-5 w-5" />,
                                color: 'bg-emerald-50 text-emerald-600',
                                title: 'Produk Terdaftar BPOM',
                                desc: 'Seluruh produk telah terdaftar dan memenuhi standar keamanan BPOM.',
                            },
                            {
                                icon: <ShoppingBag className="h-5 w-5" />,
                                color: 'bg-violet-50 text-violet-600',
                                title: 'Repeat Order Bonus',
                                desc: 'Setiap pembelian RO oleh member aktif menghasilkan bonus bulanan untuk upline.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Product Grid ────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gray-50/40 py-14 lg:py-20">
                <div className="pointer-events-none absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="pointer-events-none absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />

                <div className="relative mx-auto max-w-6xl px-4 md:px-6">
                    {/* Section header */}
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                <Boxes className="h-3.5 w-3.5" />
                                {products.length} Produk
                            </div>
                        </div>
                        <p className="hidden text-sm text-gray-400 sm:block">
                            Harga member berlaku untuk pembelian melalui sistem RO
                        </p>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-gray-100 bg-white py-20 text-center">
                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-200" />
                            <p className="text-sm font-semibold text-gray-400">Belum ada produk tersedia saat ini.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ── RO Info ─────────────────────────────────────────── */}
            <section className="bg-white py-14 lg:py-20">
                <div className="mx-auto max-w-5xl px-4 md:px-6">
                    <div className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-white">
                        <div className="grid gap-0 lg:grid-cols-2">
                            {/* Left */}
                            <div className="p-8 lg:p-10">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                                    <ShoppingBag className="h-3.5 w-3.5" />
                                    Tentang Repeat Order
                                </div>
                                <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                                    Apa itu <span className="text-primary">Repeat Order (RO)?</span>
                                </h2>
                                <p className="mb-4 text-sm leading-relaxed text-gray-600">
                                    Repeat Order adalah pembelian produk ulang yang dilakukan member aktif setiap bulan. RO memberikan dua manfaat sekaligus:
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        { title: 'Harga Member', desc: 'Anda membeli produk dengan harga lebih murah dibanding harga umum.' },
                                        { title: 'Bonus Upline', desc: 'RO Anda menghasilkan Bonus Repeat Order (5%) untuk upline G1–G7.' },
                                        { title: 'Bonus Global Sharing', desc: 'RO berkontribusi ke pool omset nasional yang dibagi ke semua member berkarir.' },
                                    ].map((item) => (
                                        <li key={item.title} className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900">{item.title}</span>
                                                <span className="text-sm text-gray-500"> — {item.desc}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Right */}
                            <div className="flex flex-col justify-center gap-4 border-t border-primary/10 bg-primary/5 p-8 lg:border-t-0 lg:border-l lg:p-10">
                                <p className="text-sm font-semibold text-gray-700">
                                    Ingin mendapatkan harga member dan ikut berkontribusi di ekosistem GrowRich?
                                </p>
                                <p className="text-sm leading-relaxed text-gray-500">
                                    Bergabunglah sebagai member dan nikmati harga eksklusif serta peluang bonus dari setiap transaksi Anda.
                                </p>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                                    >
                                        Daftar Jadi Member
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/marketing-plan"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
                                    >
                                        Lihat Marketing Plan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
