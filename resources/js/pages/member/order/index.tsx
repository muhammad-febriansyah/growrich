import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Package, Plus, ShoppingBag, ShoppingCart } from 'lucide-react';
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
    image_url: string | null;
}

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

export default function OrderIndex({ products, orders }: Props) {
    const [cart, setCart] = useState<{ product_id: number; quantity: number }[]>([]);

    const { post, processing, setData } = useForm({
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
                <Badge variant={
                    row.original.status === 'completed' ? 'default' :
                        row.original.status === 'pending' ? 'secondary' : 'destructive'
                }>
                    {row.original.status === 'completed' ? 'Selesai' :
                        row.original.status === 'pending' ? 'Diproses' : 'Dibatalkan'}
                </Badge>
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
        setData('items', cart);
        post('/member/ro', {
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
                            {products.map(product => (
                                <Card key={product.id} className="overflow-hidden shadow-premium border-none transition-all hover:ring-2 hover:ring-primary/20">
                                    <div className="p-4 flex gap-4">
                                        <div className="rounded-lg overflow-hidden flex items-center justify-center h-16 w-16 bg-slate-100 shrink-0">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Package className="h-8 w-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold">{product.name}</h4>
                                            <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-primary">
                                                    Rp {new Intl.NumberFormat('id-ID').format(product.ro_price)}
                                                </p>
                                                <Button size="sm" variant="outline" onClick={() => addToCart(product)} className="bg-white">
                                                    <Plus className="h-3 w-3 mr-1" /> Pilih
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
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
                                        <Button className="w-full h-11 font-bold" onClick={submitOrder} disabled={processing}>
                                            <ShoppingBag className="mr-2 h-4 w-4" /> Proses Pesanan
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
