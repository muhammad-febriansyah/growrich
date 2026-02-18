import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Package, RefreshCw, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { update } from '@/actions/App/Http/Controllers/Admin/ProductController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputRupiah } from '@/components/ui/input-rupiah';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
}

interface Props {
    product: Product;
}

export default function ProductEdit({ product }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Manajemen Produk', href: '/admin/products' },
        { title: product.name, href: `/admin/products/${product.id}` },
        { title: 'Edit', href: `/admin/products/${product.id}/edit` },
    ];

    const [preview, setPreview] = useState<string | null>(product.image_url);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        sku: string;
        unit: string;
        image: File | null;
        regular_price: number;
        ro_price: number;
        member_discount: number;
        is_active: boolean;
        stock: number;
        bpom_number: string;
        _method: string;
    }>({
        name: product.name,
        description: product.description ?? '',
        sku: product.sku,
        unit: product.unit ?? '',
        image: null,
        regular_price: product.regular_price,
        ro_price: product.ro_price,
        member_discount: product.member_discount,
        is_active: product.is_active,
        stock: product.stock,
        bpom_number: product.bpom_number ?? '',
        _method: 'PUT',
    });

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setData('image', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const removeImage = () => {
        setData('image', null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const generateSku = () => {
        if (!data.name.trim()) return;
        const words = data.name.trim().toUpperCase().split(/\s+/);
        const prefix = words.length === 1
            ? words[0].slice(0, 6)
            : words.map((w) => w.slice(0, 3)).join('-');
        const suffix = String(Math.floor(Math.random() * 900) + 100);
        setData('sku', `${prefix}-${suffix}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update(product.id).url, { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${product.name}`} />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={`/admin/products/${product.id}`}>
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Edit Produk</h1>
                            <p className="font-mono text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left: form fields */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Informasi Produk</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Produk</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi singkat produk..."
                                            rows={3}
                                        />
                                        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="sku">SKU / Kode Unit</Label>
                                                <button
                                                    type="button"
                                                    onClick={generateSku}
                                                    className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 disabled:opacity-40"
                                                    disabled={!data.name.trim()}
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    Generate
                                                </button>
                                            </div>
                                            <Input
                                                id="sku"
                                                value={data.sku}
                                                onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                                className="font-mono"
                                            />
                                            {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="unit">Satuan</Label>
                                            <Input
                                                id="unit"
                                                value={data.unit}
                                                onChange={(e) => setData('unit', e.target.value)}
                                                placeholder="Contoh: botol, sachet, pcs"
                                            />
                                            {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="regular_price">Harga Reguler</Label>
                                            <InputRupiah
                                                id="regular_price"
                                                value={data.regular_price}
                                                onChange={(v) => setData('regular_price', v)}
                                            />
                                            {errors.regular_price && <p className="text-xs text-destructive">{errors.regular_price}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="ro_price">Harga RO</Label>
                                            <InputRupiah
                                                id="ro_price"
                                                value={data.ro_price}
                                                onChange={(v) => setData('ro_price', v)}
                                            />
                                            {errors.ro_price && <p className="text-xs text-destructive">{errors.ro_price}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="member_discount">
                                            Diskon Member (%)
                                            <span className="ml-1 text-xs text-muted-foreground">0–100</span>
                                        </Label>
                                        <div className="relative w-40">
                                            <Input
                                                id="member_discount"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={data.member_discount}
                                                onChange={(e) => setData('member_discount', parseInt(e.target.value) || 0)}
                                                className="pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                        </div>
                                        {errors.member_discount && <p className="text-xs text-destructive">{errors.member_discount}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="stock">Stok</Label>
                                            <Input
                                                id="stock"
                                                type="number"
                                                min="0"
                                                value={data.stock}
                                                onChange={(e) => setData('stock', parseInt(e.target.value) || 0)}
                                            />
                                            {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="bpom_number">No. BPOM</Label>
                                            <Input
                                                id="bpom_number"
                                                value={data.bpom_number}
                                                onChange={(e) => setData('bpom_number', e.target.value)}
                                                placeholder="Contoh: BPOM RI MD 123456789"
                                                className="font-mono"
                                            />
                                            {errors.bpom_number && <p className="text-xs text-destructive">{errors.bpom_number}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(v) => setData('is_active', v)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                            Produk Aktif
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                (tampil di halaman Repeat Order)
                                            </span>
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: image */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Foto Produk</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <div
                                        className="relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-50 transition-colors hover:border-brand/50 hover:bg-brand-50/30"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        {preview ? (
                                            <>
                                                <img src={preview} alt="Preview" className="size-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                    className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <ImagePlus className="size-10 text-gray-300" />
                                                <p className="text-sm text-muted-foreground">Klik untuk upload foto</p>
                                                <p className="text-xs text-muted-foreground">JPG, PNG, WebP · Maks. 2MB</p>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImage}
                                    />

                                    {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <ImagePlus className="mr-2 h-4 w-4" />
                                        {preview ? 'Ganti Foto' : 'Pilih Foto'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Button type="submit" disabled={processing}>
                            Simpan Perubahan
                        </Button>
                        <Link href={`/admin/products/${product.id}`}>
                            <Button type="button" variant="outline">Batal</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
