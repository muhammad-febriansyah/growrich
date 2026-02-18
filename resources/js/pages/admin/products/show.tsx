import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit2, Package, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    description: string | null;
    sku: string;
    unit: string | null;
    image_url: string | null;
    regular_price: number;
    ro_price: number;
    member_discount: number;
    is_active: boolean;
    stock: number;
    bpom_number: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    product: Product;
}

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function ProductShow({ product }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Produk', href: '/admin/products' },
        { title: product.name, href: `/admin/products/${product.id}` },
    ];

    const handleDelete = () => {
        if (confirm(`Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/products/${product.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={product.name} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/products">
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                            <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left: detail */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Detail Produk</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="divide-y">
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Nama Produk</dt>
                                        <dd className="font-medium text-gray-900">{product.name}</dd>
                                    </div>
                                    {product.description && (
                                        <div className="py-3 text-sm">
                                            <dt className="text-muted-foreground">Deskripsi</dt>
                                            <dd className="mt-1 text-gray-700 whitespace-pre-line">{product.description}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">SKU</dt>
                                        <dd className="font-mono font-semibold text-gray-900">{product.sku}</dd>
                                    </div>
                                    {product.unit && (
                                        <div className="flex justify-between py-3 text-sm">
                                            <dt className="text-muted-foreground">Satuan</dt>
                                            <dd className="text-gray-900">{product.unit}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Stok</dt>
                                        <dd className={`font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                            {product.stock.toLocaleString('id-ID')} {product.unit ?? 'pcs'}
                                        </dd>
                                    </div>
                                    {product.bpom_number && (
                                        <div className="flex justify-between py-3 text-sm">
                                            <dt className="text-muted-foreground">No. BPOM</dt>
                                            <dd className="font-mono text-gray-900">{product.bpom_number}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Harga Reguler</dt>
                                        <dd className="font-semibold text-gray-900">{fmt(product.regular_price)}</dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Harga Repeat Order</dt>
                                        <dd className="font-semibold text-brand">{fmt(product.ro_price)}</dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Diskon Member</dt>
                                        <dd>
                                            <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                                                {product.member_discount}%
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Status</dt>
                                        <dd>
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${product.is_active ? 'border-green-300 bg-green-100 text-green-700' : 'border-red-300 bg-red-100 text-red-700'}`}>
                                                {product.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Dibuat</dt>
                                        <dd className="text-gray-600">
                                            {new Date(product.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-3 text-sm">
                                        <dt className="text-muted-foreground">Diperbarui</dt>
                                        <dd className="text-gray-600">
                                            {new Date(product.updated_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                        </dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {/* Perbandingan harga */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Perbandingan Harga</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="rounded-lg border bg-gray-50 p-4">
                                        <p className="text-xs text-muted-foreground">Harga Reguler</p>
                                        <p className="mt-1 text-sm font-bold text-gray-900">{fmt(product.regular_price)}</p>
                                    </div>
                                    <div className="rounded-lg border border-brand/20 bg-brand-50 p-4">
                                        <p className="text-xs text-brand/70">Harga RO</p>
                                        <p className="mt-1 text-sm font-bold text-brand">{fmt(product.ro_price)}</p>
                                    </div>
                                    <div className="rounded-lg border border-pink-200 bg-pink-50 p-4">
                                        <p className="text-xs text-pink-500">Hemat</p>
                                        <p className="mt-1 text-sm font-bold text-pink-700">
                                            {fmt(product.regular_price - product.ro_price)}
                                        </p>
                                        <p className="text-[10px] text-pink-500">({product.member_discount}%)</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: foto */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Foto Produk</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-hidden rounded-xl border bg-gray-50 aspect-square flex items-center justify-center">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-center p-6">
                                            <Package className="size-16 text-gray-200" />
                                            <p className="text-sm text-muted-foreground">Belum ada foto</p>
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Button variant="outline" size="sm" className="mt-1">Upload Foto</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
