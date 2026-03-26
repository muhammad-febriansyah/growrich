import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    Banknote,
    CreditCard,
    Eye,
    Package,
    Plus,
    Settings,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Product {
    id: number;
    name: string;
    sku: string;
    ro_price: number;
    stock: number | null;
    image_url: string | null;
}

const isOutOfStock = (p: Product) => p.stock !== null && p.stock === 0;

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: {
        id: number;
        product: Product;
        quantity: number;
        unit_price: number;
    }[];
    payment_method: string | null;
    payment_receipt: string | null;
    paid_at: string | null;
}

interface DuitkuMethod {
    paymentMethod: string;
    paymentName: string;
    paymentImage: string;
    totalFee: string;
}

interface Props {
    products: Product[];
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
    duitkuMethods: DuitkuMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Repeat Order', href: '/member/ro' },
];

export default function OrderIndex({ products, orders, duitkuMethods }: Props) {
    const [cart, setCart] = useState<
        { product_id: number; quantity: number }[]
    >([]);
    const [paymentMethod, setPaymentMethod] = useState<
        'manual_transfer' | 'duitku'
    >('manual_transfer');
    const [duitkuMethod, setDuitkuMethod] = useState<string>(
        duitkuMethods[0]?.paymentMethod ?? '',
    );

    const { post, processing } = useForm({
        items: [] as { product_id: number; quantity: number }[],
    });

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'order_number',
            header: 'No. Order',
            cell: ({ row }) => (
                <span className="font-mono text-xs font-bold text-slate-600">
                    #{row.original.order_number || row.original.id}
                </span>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => (
                <span className="text-xs">
                    {new Date(row.original.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'items',
            header: 'Produk',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.items.map((item) => (
                        <span
                            key={item.id}
                            className="text-xs text-muted-foreground"
                        >
                            {item.product?.name} ({item.quantity}x)
                        </span>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'total_amount',
            header: 'Total',
            cell: ({ row }) => (
                <div className="font-bold text-slate-900">
                    Rp{' '}
                    {new Intl.NumberFormat('id-ID').format(
                        row.original.total_amount,
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        variant={
                            row.original.status === 'completed'
                                ? 'default'
                                : row.original.status === 'paid'
                                  ? 'outline'
                                  : row.original.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                        }
                        className={
                            row.original.status === 'paid'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : ''
                        }
                    >
                        {row.original.status === 'completed'
                            ? 'Selesai'
                            : row.original.status === 'paid'
                              ? 'Sudah Bayar'
                              : row.original.status === 'pending'
                                ? 'Diproses'
                                : 'Dibatalkan'}
                    </Badge>
                    {row.original.payment_receipt && (
                        <div className="mt-1">
                            <a
                                href={`/storage/${row.original.payment_receipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                <Package className="h-3 w-3" />
                                Lihat Bukti
                            </a>
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="h-8">
                        <Link href={`/member/ro/${row.original.id}`}>
                            <Eye className="mr-1 h-3.5 w-3.5" />
                            Detail
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    const addToCart = (product: Product) => {
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

    const submitOrder = () => {
        if (cart.length === 0) return;
        router.post(
            '/member/ro',
            {
                items: cart,
                payment_method: paymentMethod,
                duitku_method:
                    paymentMethod === 'duitku' ? duitkuMethod : undefined,
            },
            {
                onSuccess: () => setCart([]),
            },
        );
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const product = products.find((p) => p.id === item.product_id);
            return acc + (product?.ro_price || 0) * item.quantity;
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Repeat Order" />

            <div className="flex flex-col gap-6 p-4 text-foreground md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-heading text-2xl font-bold">
                            Repeat Order (RO)
                        </h1>
                        <p className="text-muted-foreground">
                            Pilih produk untuk melakukan pembelanjaan ulang.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/member/ro-preference">
                            <Settings className="mr-1 h-4 w-4" />
                            Template Auto RO
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Product List */}
                    <div className="space-y-4 md:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {products.map((product) => {
                                const outOfStock = isOutOfStock(product);
                                return (
                                    <Card
                                        key={product.id}
                                        className={`shadow-premium overflow-hidden border-none transition-all ${outOfStock ? 'opacity-60' : 'hover:ring-2 hover:ring-primary/20'}`}
                                    >
                                        <div className="flex gap-4 p-4">
                                            {/* Image */}
                                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className={`h-full w-full object-cover ${outOfStock ? 'grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <Package className="h-8 w-8 text-slate-400" />
                                                )}
                                                {outOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40">
                                                        <span className="px-1 text-center text-[9px] leading-tight font-bold text-white">
                                                            STOK HABIS
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="mb-0.5 flex items-start justify-between gap-2">
                                                    <h4 className="text-sm leading-tight font-bold">
                                                        {product.name}
                                                    </h4>
                                                    {outOfStock && (
                                                        <span className="inline-flex shrink-0 items-center rounded-md border border-red-200 bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                                            Stok Habis
                                                        </span>
                                                    )}
                                                    {!outOfStock &&
                                                        product.stock !==
                                                            null && (
                                                            <span className="inline-flex shrink-0 items-center rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                                                Stok:{' '}
                                                                {product.stock}
                                                            </span>
                                                        )}
                                                </div>
                                                <p className="mb-2 text-xs text-muted-foreground">
                                                    {product.sku}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-primary">
                                                        Rp{' '}
                                                        {new Intl.NumberFormat(
                                                            'id-ID',
                                                        ).format(
                                                            product.ro_price,
                                                        )}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            addToCart(product)
                                                        }
                                                        className="bg-white"
                                                        disabled={outOfStock}
                                                    >
                                                        <Plus className="mr-1 h-3 w-3" />
                                                        {outOfStock
                                                            ? 'Habis'
                                                            : 'Pilih'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cart / Summary */}
                    <div className="space-y-4">
                        <Card className="shadow-premium sticky top-6 border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />{' '}
                                    Ringkasan Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-muted-foreground italic">
                                        Keranjang belanja masih kosong.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item) => {
                                            const product = products.find(
                                                (p) => p.id === item.product_id,
                                            );
                                            return (
                                                <div
                                                    key={item.product_id}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <p className="truncate font-medium">
                                                            {product?.name}
                                                        </p>
                                                        <p className="text-xs font-bold text-muted-foreground text-primary">
                                                            Rp{' '}
                                                            {new Intl.NumberFormat(
                                                                'id-ID',
                                                            ).format(
                                                                product?.ro_price ||
                                                                    0,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="h-9 w-16 px-1 text-center font-bold"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.product_id,
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="flex justify-between border-t pt-3 font-bold">
                                            <span>Total Estimasi</span>
                                            <span className="text-lg text-primary">
                                                Rp{' '}
                                                {new Intl.NumberFormat(
                                                    'id-ID',
                                                ).format(calculateTotal())}
                                            </span>
                                        </div>

                                        <div className="space-y-4 border-t pt-4">
                                            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Metode Pembayaran
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPaymentMethod(
                                                            'manual_transfer',
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                                                        paymentMethod ===
                                                        'manual_transfer'
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-muted hover:border-primary/30'
                                                    }`}
                                                >
                                                    <Banknote className="h-5 w-5 shrink-0 text-emerald-600" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs leading-none font-bold">
                                                            Transfer Manual
                                                        </p>
                                                        <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                                                            Konfirmasi admin
                                                        </p>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPaymentMethod(
                                                            'duitku',
                                                        )
                                                    }
                                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                                                        paymentMethod ===
                                                        'duitku'
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-muted hover:border-primary/30'
                                                    }`}
                                                >
                                                    <CreditCard className="h-5 w-5 shrink-0 text-blue-500" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs leading-none font-bold">
                                                            Duitku (Otomatis)
                                                        </p>
                                                        <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                                                            QRIS, VA, E-Wallet
                                                        </p>
                                                    </div>
                                                </button>

                                                {paymentMethod === 'duitku' &&
                                                    duitkuMethods.length >
                                                        0 && (
                                                        <div className="mt-1 space-y-2 rounded-lg border bg-slate-50 p-3">
                                                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                                Pilih Metode
                                                                Pembayaran
                                                            </p>
                                                            <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                                                                {duitkuMethods.map(
                                                                    (m) => (
                                                                        <button
                                                                            key={
                                                                                m.paymentMethod
                                                                            }
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setDuitkuMethod(
                                                                                    m.paymentMethod,
                                                                                )
                                                                            }
                                                                            className={`flex items-center gap-2 rounded-md border p-2 text-left transition-all ${
                                                                                duitkuMethod ===
                                                                                m.paymentMethod
                                                                                    ? 'border-primary bg-primary/10'
                                                                                    : 'border-slate-200 bg-white hover:border-primary/40'
                                                                            }`}
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    m.paymentImage
                                                                                }
                                                                                alt={
                                                                                    m.paymentName
                                                                                }
                                                                                className="h-5 w-8 shrink-0 object-contain"
                                                                            />
                                                                            <div className="min-w-0">
                                                                                <span className="block truncate text-[10px] leading-none font-bold">
                                                                                    {
                                                                                        m.paymentName
                                                                                    }
                                                                                </span>
                                                                                {m.totalFee !==
                                                                                    '0' && (
                                                                                    <span className="text-[9px] text-muted-foreground">
                                                                                        +Rp{' '}
                                                                                        {parseInt(
                                                                                            m.totalFee,
                                                                                        ).toLocaleString(
                                                                                            'id-ID',
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <Button
                                            className="mt-2 h-11 w-full font-bold"
                                            onClick={submitOrder}
                                            disabled={processing}
                                        >
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            {paymentMethod === 'duitku'
                                                ? 'Bayar Sekarang'
                                                : 'Buat Pesanan'}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Order History */}
                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Riwayat Repeat Order</CardTitle>
                        <CardDescription>
                            Status pesanan produk Anda.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={orders.data}
                            emptyTitle="Belum ada riwayat"
                            emptyDescription="Anda belum pernah melakukan pembelanjaan ulang."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
