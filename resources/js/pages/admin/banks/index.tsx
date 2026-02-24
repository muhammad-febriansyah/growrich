import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Banknote,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Bank {
    id: number;
    name: string;
    account_number: string;
    account_name: string;
    image: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    banks: Bank[];
}

export default function BanksIndex({ banks }: Props) {
    const [editingBank, setEditingBank] = useState<Bank | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        account_number: '',
        account_name: '',
        image: null as File | null,
        is_active: true,
        sort_order: 0,
        _method: 'POST', // For file uploads with put
    });

    const openCreateDialog = () => {
        setEditingBank(null);
        setPreviewImage(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (bank: Bank) => {
        setEditingBank(bank);
        setPreviewImage(bank.image ? `/storage/${bank.image}` : null);
        setData({
            name: bank.name,
            account_number: bank.account_number,
            account_name: bank.account_name,
            image: null,
            is_active: bank.is_active,
            sort_order: bank.sort_order,
            _method: 'PUT',
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBank) {
            post(`/admin/banks/${editingBank.id}`, {
                onSuccess: () => setIsDialogOpen(false),
            });
        } else {
            post('/admin/banks', {
                onSuccess: () => setIsDialogOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus rekening ini?')) {
            destroy(`/admin/banks/${id}`);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const columns: ColumnDef<Bank>[] = [
        {
            accessorKey: 'sort_order',
            header: '#',
            cell: ({ row }) => <span className="text-xs font-mono text-slate-500">{row.original.sort_order}</span>,
        },
        {
            accessorKey: 'image',
            header: 'Logo',
            cell: ({ row }) => (
                <div className="h-10 w-16 rounded border bg-slate-50 flex items-center justify-center overflow-hidden">
                    {row.original.image ? (
                        <img src={`/storage/${row.original.image}`} alt={row.original.name} className="h-full w-full object-contain" />
                    ) : (
                        <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Bank & Rekening',
            cell: ({ row }) => (
                <div className="max-w-[250px]">
                    <div className="font-bold text-slate-900 leading-none mb-1">{row.original.name}</div>
                    <div className="text-xs text-slate-500 font-mono tracking-wider">{row.original.account_number}</div>
                    <div className="text-xs text-slate-400 mt-0.5">a.n. {row.original.account_name}</div>
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'} className={row.original.is_active ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : ''}>
                    {row.original.is_active ? 'Aktif' : 'Non-Aktif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={() => openEditDialog(row.original)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive" onClick={() => handleDelete(row.original.id)}>
                        < Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Manajemen Bank', href: '/admin/banks' }]}>
            <Head title="Kelola Rekening Bank" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" /> Manajemen Bank
                        </h1>
                        <p className="text-sm text-muted-foreground">Kelola daftar rekening bank untuk metode pembayaran Transfer Manual.</p>
                    </div>
                    <Button onClick={openCreateDialog} className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Rekening
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={banks}
                        emptyTitle="Belum ada rekening"
                        emptyDescription="Klik tombol 'Tambah Rekening' untuk membuat data baru."
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingBank ? 'Edit Rekening' : 'Tambah Rekening Baru'}</DialogTitle>
                            <DialogDescription>
                                Masukkan detail rekening bank tujuan transfer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="image">Logo Bank</Label>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-24 rounded border-2 border-dashed flex items-center justify-center bg-slate-50 overflow-hidden">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" className="h-full w-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Input
                                                id="image"
                                                type="file"
                                                className="hidden"
                                                onChange={handleImageChange}
                                                accept="image/*"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => document.getElementById('image')?.click()}
                                            >
                                                <Upload className="h-4 w-4 mr-2" /> Upload Logo
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Bank</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: BCA, Mandiri, BRI"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account_number">Nomor Rekening</Label>
                                <Input
                                    id="account_number"
                                    value={data.account_number}
                                    onChange={(e) => setData('account_number', e.target.value)}
                                    placeholder="Nomor rekening tanpa spasi/simbol"
                                />
                                {errors.account_number && <p className="text-xs text-destructive">{errors.account_number}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="account_name">Atas Nama (Pemilik)</Label>
                                <Input
                                    id="account_name"
                                    value={data.account_name}
                                    onChange={(e) => setData('account_name', e.target.value)}
                                    placeholder="Nama lengkap pemilik rekening"
                                />
                                {errors.account_name && <p className="text-xs text-destructive">{errors.account_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan Tampil</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Status</Label>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active" className="text-xs font-normal text-slate-500">
                                            {data.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
