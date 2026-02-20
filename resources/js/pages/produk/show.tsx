import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    Package,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Users,
} from 'lucide-react';
import HomeLayout from '@/layouts/home-layout';
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

export default function ProdukShow({ product }: { product: ProductItem }) {
    const savings = product.regular_price - product.ro_price;
    const inStock = product.stock > 0;

    return (
        <HomeLayout>
            <Head title={`${product.name} — GrowRich`} />

            <div className="bg-white pt-28 pb-4 lg:pt-36">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    <Link
                        href="/produk"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Produk
                    </Link>
                </div>
            </div>

            {/* ── Product Detail ── */}
            <section className="bg-white pb-16 lg:pb-24">
                <div className="mx-auto max-w-6xl px-4 md:px-6">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                        {/* Image */}
                        <div className="relative">
                            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full object-cover"
                                        style={{ maxHeight: '480px', objectPosition: 'center' }}
                                    />
                                ) : (
                                    <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                        <Package className="h-24 w-24 text-gray-200" />
                                    </div>
                                )}
                            </div>

                            {/* Badges overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {product.member_discount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-primary/30">
                                        <Tag className="h-3 w-3" />
                                        Hemat {product.member_discount}%
                                    </span>
                                )}
                                {!inStock && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1.5 text-xs font-bold text-white">
                                        Stok Habis
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                        SKU: {product.sku}
                                    </span>
                                    {product.bpom_number && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                                            <ShieldCheck className="h-3 w-3" />
                                            BPOM Terdaftar
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                        {inStock ? `Stok: ${product.stock} ${product.unit ?? 'pcs'}` : 'Stok Habis'}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                                    {product.name}
                                </h1>

                                {product.unit && (
                                    <p className="mt-1 text-sm text-gray-400">
                                        Satuan: <span className="font-semibold text-gray-600">{product.unit}</span>
                                    </p>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Harga</p>
                                <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-3 mb-3">
                                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        Harga Umum
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">{formatRupiah(product.regular_price)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-primary">
                                        <Users className="h-4 w-4" />
                                        Harga Member (RO)
                                    </span>
                                    <span className="text-2xl font-black text-gray-900">{formatRupiah(product.ro_price)}</span>
                                </div>
                                {savings > 0 && (
                                    <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2">
                                        <span className="text-xs font-semibold text-primary">Hemat sebagai member</span>
                                        <span className="text-sm font-black text-primary">{formatRupiah(savings)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div>
                                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Deskripsi Produk</p>
                                    <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
                                </div>
                            )}

                            {/* BPOM */}
                            {product.bpom_number && (
                                <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                                    <BadgeCheck className="h-8 w-8 shrink-0 text-emerald-500" />
                                    <div>
                                        <p className="text-xs font-bold text-emerald-700">Nomor Izin BPOM</p>
                                        <p className="font-mono text-sm font-bold text-emerald-800">{product.bpom_number}</p>
                                    </div>
                                </div>
                            )}

                            {/* Benefits */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5">
                                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Keuntungan Beli sebagai Member</p>
                                <ul className="space-y-2.5">
                                    {[
                                        'Dapatkan harga member (RO Price) yang lebih hemat',
                                        'Setiap pembelian berkontribusi ke Bonus Repeat Order upline',
                                        'Mendukung pencapaian Bonus Global Sharing bulanan',
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href={register()}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Daftar & Beli dengan Harga Member
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </HomeLayout>
    );
}
