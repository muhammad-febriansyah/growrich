import { Head, router, usePage } from '@inertiajs/react';
import { Minus, Plus, Save, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
    ro_price: number;
    unit: string | null;
    image_url: string | null;
    stock: number | null;
}

interface Preference {
    id: number;
    product_id: number;
    quantity: number;
    product: Product;
}

interface Props {
    products: Product[];
    preferences: Preference[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Repeat Order', href: '/member/ro' },
    { title: 'Template Auto RO', href: '/member/ro-preference' },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const isOutOfStock = (p: Product) => p.stock !== null && p.stock === 0;

export default function RoPreference({ products, preferences }: Props) {
    const { props } = usePage<{
        flash?: { success?: string; error?: string };
    }>();
    const flash = props.flash;

    const [cart, setCart] = useState<
        { product_id: number; quantity: number }[]
    >(
        preferences.map((p) => ({
            product_id: p.product_id,
            quantity: p.quantity,
        })),
    );
    const [processing, setProcessing] = useState(false);

    const addToCart = (product: Product) => {
        if (isOutOfStock(product)) return;
        setCart((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i,
                );
            }
            return [...prev, { product_id: product.id, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, q: number) => {
        if (q < 1) {
            setCart((prev) => prev.filter((i) => i.product_id !== productId));
            return;
        }
        setCart((prev) =>
            prev.map((i) =>
                i.product_id === productId ? { ...i, quantity: q } : i,
            ),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((i) => i.product_id !== productId));
    };

    const total = cart.reduce((acc, item) => {
        const product = products.find((p) => p.id === item.product_id);
        return acc + (product?.ro_price ?? 0) * item.quantity;
    }, 0);

    const save = () => {
        if (cart.length === 0) return;
        setProcessing(true);
        router.post(
            '/member/ro-preference',
            { items: cart },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    const clear = () => {
        router.delete('/member/ro-preference', {
            onSuccess: () => setCart([]),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Template Auto RO" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading text-2xl font-bold">
                        Template Auto RO
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pilih produk dan jumlahnya untuk auto-deduct RO bulanan
                        dari e-wallet Anda.
                    </p>
                </div>

                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-700">
                        Template ini digunakan saat auto-deduct RO berjalan
                        setiap bulan. Total minimal Rp 1.000.000 diperlukan
                        untuk memenuhi syarat Global Sharing Bonus.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Product Grid */}
                    <div className="space-y-4 md:col-span-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {products.map((product) => {
                                const outOfStock = isOutOfStock(product);
                                const inCart = cart.find(
                                    (i) => i.product_id === product.id,
                                );
                                return (
                                    <div
                                        key={product.id}
                                        className={`relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-sm ${outOfStock ? 'opacity-60' : ''}`}
                                    >
                                        {inCart && (
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge className="bg-green-600 text-white">
                                                    ✓ {inCart.quantity}x
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="flex gap-3 p-3">
                                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                        <svg
                                                            className="h-6 w-6"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={1}
                                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold">
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.sku}
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-green-700">
                                                    {fmt(product.ro_price)}
                                                </p>
                                                {product.unit && (
                                                    <p className="text-xs text-muted-foreground">
                                                        /{product.unit}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="border-t px-3 py-2">
                                            {outOfStock ? (
                                                <span className="text-xs font-medium text-red-500">
                                                    Stok Habis
                                                </span>
                                            ) : inCart ? (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product.id,
                                                                    inCart.quantity -
                                                                        1,
                                                                )
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-6 text-center text-sm font-bold">
                                                            {inCart.quantity}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    product.id,
                                                                    inCart.quantity +
                                                                        1,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-500 hover:text-red-700"
                                                        onClick={() =>
                                                            removeFromCart(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 w-full text-xs"
                                                    variant="outline"
                                                    onClick={() =>
                                                        addToCart(product)
                                                    }
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />{' '}
                                                    Tambah
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-4">
                        <Card className="sticky top-6">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">
                                    Template Saat Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {cart.length === 0 ? (
                                    <p className="py-4 text-center text-sm text-muted-foreground">
                                        Belum ada produk dipilih.
                                    </p>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            {cart.map((item) => {
                                                const product = products.find(
                                                    (p) =>
                                                        p.id ===
                                                        item.product_id,
                                                );
                                                if (!product) return null;
                                                return (
                                                    <div
                                                        key={item.product_id}
                                                        className="flex items-start justify-between gap-2 text-sm"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {item.quantity}{' '}
                                                                ×{' '}
                                                                {fmt(
                                                                    product.ro_price,
                                                                )}
                                                            </p>
                                                        </div>
                                                        <span className="shrink-0 font-semibold">
                                                            {fmt(
                                                                product.ro_price *
                                                                    item.quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="border-t pt-3">
                                            <div className="flex justify-between font-bold">
                                                <span>Total</span>
                                                <span
                                                    className={
                                                        total >= 1_000_000
                                                            ? 'text-green-700'
                                                            : 'text-amber-600'
                                                    }
                                                >
                                                    {fmt(total)}
                                                </span>
                                            </div>
                                            {total < 1_000_000 && (
                                                <p className="mt-1 text-xs text-amber-600">
                                                    Kurang{' '}
                                                    {fmt(1_000_000 - total)}{' '}
                                                    dari minimum Rp 1.000.000
                                                </p>
                                            )}
                                            {total >= 1_000_000 && (
                                                <p className="mt-1 text-xs text-green-600">
                                                    ✓ Memenuhi syarat Global
                                                    Sharing Bonus
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            className="w-full"
                                            onClick={save}
                                            disabled={
                                                processing || cart.length === 0
                                            }
                                        >
                                            <Save className="mr-1.5 h-4 w-4" />
                                            {processing
                                                ? 'Menyimpan...'
                                                : 'Simpan Template'}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 hover:text-red-700"
                                            onClick={clear}
                                        >
                                            <Trash2 className="mr-1.5 h-4 w-4" />
                                            Hapus Template
                                        </Button>
                                    </>
                                )}

                                {cart.length === 0 &&
                                    preferences.length === 0 && (
                                        <p className="text-center text-xs text-muted-foreground">
                                            Auto RO akan menggunakan jumlah
                                            default Rp 1.000.000 tanpa produk
                                            spesifik.
                                        </p>
                                    )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
