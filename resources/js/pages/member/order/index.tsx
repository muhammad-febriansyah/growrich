import { Head, Link, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, CreditCard, Eye, Package, Plus, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Props {
    products: Product[];
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Repeat Order', href: '/member/ro' },
];

const DUITKU_METHODS = [
    { code: 'QRIS', label: 'QRIS', desc: 'Semua dompet & bank' },
    { code: 'BC', label: 'VA BCA', desc: 'Virtual Account BCA' },
    { code: 'I1', label: 'VA BNI', desc: 'Virtual Account BNI' },
    { code: 'BR', label: 'VA BRI', desc: 'Virtual Account BRI' },
    { code: 'M2', label: 'VA Mandiri', desc: 'Virtual Account Mandiri' },
    { code: 'OV', label: 'OVO', desc: 'Dompet OVO' },
    { code: 'DA', label: 'DANA', desc: 'Dompet DANA' },
    { code: 'SP', label: 'ShopeePay', desc: 'Dompet ShopeePay' },
];

export default function OrderIndex({ products, orders }: Props) {
    const [cart, setCart] = useState<{ product_id: number; quantity: number }[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'manual_transfer' | 'duitku'>('manual_transfer');
    const [duitkuMethod, setDuitkuMethod] = useState<string>('QRIS');

    const { post, processing } = useForm({
        items: [] as { product_id: number; quantity: number }[],
    });

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'order_number',
            header: 'No. Order',
            cell: ({ row }) => <span className="font-mono text-xs text-slate-600 font-bold">#{row.original.order_number || row.original.id}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: ({ row }) => <span className="text-xs">{new Date(row.original.created_at).toLocaleDateString()}</span>,
        },
        {
            id: 'items',
            header: 'Produk',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.items.map(item => (
                        <span key={item.id} className="text-xs text-muted-foreground">
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
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.total_amount)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant={
                        row.original.status === 'completed' ? 'default' :
                            row.original.status === 'paid' ? 'outline' :
                                row.original.status === 'pending' ? 'secondary' : 'destructive'
                    } className={row.original.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}>
                        {row.original.status === 'completed' ? 'Selesai' :
                            row.original.status === 'paid' ? 'Sudah Bayar' :
                                row.original.status === 'pending' ? 'Diproses' : 'Dibatalkan'}
                    </Badge>
                    {row.original.payment_receipt && (
                        <div className="mt-1">
                            <a
                                href={`/storage/${row.original.payment_receipt}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
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
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Detail
                        </Link>
                    </Button>
                </div>
            ),
        },
    ];

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) {
                return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product_id: product.id, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: number, q: number) => {
        if (q < 1) {
            setCart(prev => prev.filter(i => i.product_id !== productId));
            return;
        }
        setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity: q } : i));
    };

    const submitOrder = () => {
        if (cart.length === 0) return;
        router.post('/member/ro', {
            items: cart,
            payment_method: paymentMethod,
            duitku_method: paymentMethod === 'duitku' ? duitkuMethod : undefined,
        }, {
            onSuccess: () => setCart([]),
        });
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const product = products.find(p => p.id === item.product_id);
            return acc + (product?.ro_price || 0) * item.quantity;
        }, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Repeat Order" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">Repeat Order (RO)</h1>
                    <p className="text-muted-foreground">Pilih produk untuk melakukan pembelanjaan ulang.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Product List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {products.map(product => {
                                const outOfStock = isOutOfStock(product);
                                return (
                                    <Card
                                        key={product.id}
                                        className={`overflow-hidden shadow-premium border-none transition-all ${outOfStock ? 'opacity-60' : 'hover:ring-2 hover:ring-primary/20'}`}
                                    >
                                        <div className="p-4 flex gap-4">
                                            {/* Image */}
                                            <div className="relative rounded-lg overflow-hidden flex items-center justify-center h-16 w-16 bg-slate-100 shrink-0">
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
                                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                                        <span className="text-[9px] font-bold text-white leading-tight text-center px-1">STOK HABIS</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2 mb-0.5">
                                                    <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
                                                    {outOfStock && (
                                                        <span className="shrink-0 inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-200">
                                                            Stok Habis
                                                        </span>
                                                    )}
                                                    {!outOfStock && product.stock !== null && (
                                                        <span className="shrink-0 inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 border border-green-200">
                                                            Stok: {product.stock}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-primary">
                                                        Rp {new Intl.NumberFormat('id-ID').format(product.ro_price)}
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => addToCart(product)}
                                                        className="bg-white"
                                                        disabled={outOfStock}
                                                    >
                                                        <Plus className="h-3 w-3 mr-1" />
                                                        {outOfStock ? 'Habis' : 'Pilih'}
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
                        <Card className="sticky top-6 shadow-premium border-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" /> Ringkasan Order
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic text-center py-8">
                                        Keranjang belanja masih kosong.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map(item => {
                                            const product = products.find(p => p.id === item.product_id);
                                            return (
                                                <div key={item.product_id} className="flex items-center justify-between text-sm">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="font-medium truncate">{product?.name}</p>
                                                        <p className="text-xs text-muted-foreground font-bold text-primary">Rp {new Intl.NumberFormat('id-ID').format(product?.ro_price || 0)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="h-9 w-16 text-center px-1 font-bold"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="pt-3 border-t flex justify-between font-bold">
                                            <span>Total Estimasi</span>
                                            <span className="text-primary text-lg">Rp {new Intl.NumberFormat('id-ID').format(calculateTotal())}</span>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Metode Pembayaran</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('manual_transfer')}
                                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${paymentMethod === 'manual_transfer'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-muted hover:border-primary/30'
                                                        }`}
                                                >
                                                    <Banknote className="h-5 w-5 shrink-0 text-emerald-600" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold leading-none">Transfer Manual</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">Konfirmasi admin</p>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPaymentMethod('duitku')}
                                                    className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${paymentMethod === 'duitku'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-muted hover:border-primary/30'
                                                        }`}
                                                >
                                                    <CreditCard className="h-5 w-5 shrink-0 text-blue-500" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold leading-none">Duitku (Otomatis)</p>
                                                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">QRIS, VA, E-Wallet</p>
                                                    </div>
                                                </button>

                                                {paymentMethod === 'duitku' && (
                                                    <div className="mt-1 rounded-lg border bg-slate-50 p-3 space-y-2">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pilih Metode Duitku</p>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            {DUITKU_METHODS.map(m => (
                                                                <button
                                                                    key={m.code}
                                                                    type="button"
                                                                    onClick={() => setDuitkuMethod(m.code)}
                                                                    className={`flex flex-col rounded-md border p-2 text-left transition-all ${duitkuMethod === m.code
                                                                        ? 'border-primary bg-primary/10 text-primary'
                                                                        : 'border-slate-200 bg-white hover:border-primary/40'
                                                                        }`}
                                                                >
                                                                    <span className="text-[11px] font-bold leading-none">{m.label}</span>
                                                                    <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{m.desc}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button className="w-full h-11 font-bold mt-2" onClick={submitOrder} disabled={processing}>
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            {paymentMethod === 'duitku' ? 'Bayar Sekarang' : 'Buat Pesanan'}
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
                        <CardDescription>Status pesanan produk Anda.</CardDescription>
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
