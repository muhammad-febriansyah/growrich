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
    Trophy,
    Hash
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CareerLevel {
    id: number;
    key: string;
    label: string;
    required_pp: number;
    global_share_percent: number;
    sort_order: number;
    dot_color: string | null;
    text_color: string | null;
    is_active: boolean;
}

interface Props {
    levels: CareerLevel[];
}

export default function CareerLevelsIndex({ levels }: Props) {
    const [editingLevel, setEditingLevel] = useState<CareerLevel | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        key: '',
        label: '',
        required_pp: 0,
        global_share_percent: 0,
        sort_order: 0,
        dot_color: 'bg-gray-300',
        text_color: 'text-gray-600',
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingLevel(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (level: CareerLevel) => {
        setEditingLevel(level);
        setData({
            key: level.key,
            label: level.label,
            required_pp: level.required_pp,
            global_share_percent: level.global_share_percent,
            sort_order: level.sort_order,
            dot_color: level.dot_color || 'bg-gray-300',
            text_color: level.text_color || 'text-gray-600',
            is_active: level.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLevel) {
            put(`/admin/career-levels/${editingLevel.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Jenjang karir berhasil diperbarui.');
                },
            });
        } else {
            post('/admin/career-levels', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Jenjang karir berhasil ditambahkan.');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jenjang karir ini?')) {
            destroy(`/admin/career-levels/${id}`, {
                onSuccess: () => toast.success('Jenjang karir berhasil dihapus.'),
            });
        }
    };

    const columns: ColumnDef<CareerLevel>[] = [
        {
            accessorKey: 'sort_order',
            header: '#',
            cell: ({ row }) => <span className="text-xs font-mono text-slate-500">{row.original.sort_order}</span>,
        },
        {
            accessorKey: 'label',
            header: 'Jenjang Karir',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${row.original.dot_color || 'bg-gray-300'}`} />
                    <span className={`font-bold ${row.original.text_color || 'text-slate-900'}`}>{row.original.label}</span>
                </div>
            ),
        },
        {
            accessorKey: 'required_pp',
            header: 'Syarat PP',
            cell: ({ row }) => <span className="font-medium">{row.original.required_pp.toLocaleString('id')} PP</span>,
        },
        {
            accessorKey: 'global_share_percent',
            header: 'Global Share',
            cell: ({ row }) => <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">{row.original.global_share_percent}%</Badge>,
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
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Manajemen Jenjang Karir', href: '/admin/career-levels' }]}>
            <Head title="Kelola Jenjang Karir" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" /> Jenjang Karir
                        </h1>
                        <p className="text-sm text-muted-foreground">Atur syarat Pairing Point (PP) dan bagi hasil global untuk setiap peringkat.</p>
                    </div>
                    <Button onClick={openCreateDialog} className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Jenjang Karir
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={levels}
                        emptyTitle="Belum ada jenjang karir"
                        emptyDescription="Klik tombol 'Tambah Jenjang Karir' untuk membuat data baru."
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingLevel ? 'Edit Jenjang Karir' : 'Tambah Jenjang Karir Baru'}</DialogTitle>
                            <DialogDescription>
                                Sesuaikan parameter karir untuk member GrowRich.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="key">Unique Key (ID)</Label>
                                    <Input
                                        id="key"
                                        value={data.key}
                                        onChange={(e) => setData('key', e.target.value)}
                                        placeholder="SapphireManager"
                                        disabled={!!editingLevel}
                                    />
                                    {errors.key && <p className="text-xs text-destructive">{errors.key}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Urutan Tampil</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="label">Nama Jenjang Karir</Label>
                                <Input
                                    id="label"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    placeholder="Contoh: Sapphire Manager"
                                />
                                {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="required_pp">Minimal PP</Label>
                                    <Input
                                        id="required_pp"
                                        type="number"
                                        value={data.required_pp}
                                        onChange={(e) => setData('required_pp', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="global_share_percent">Global Share (%)</Label>
                                    <Input
                                        id="global_share_percent"
                                        type="number"
                                        step="0.01"
                                        value={data.global_share_percent}
                                        onChange={(e) => setData('global_share_percent', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dot_color">Warna Bulat (Tailwind Class)</Label>
                                    <Input
                                        id="dot_color"
                                        value={data.dot_color}
                                        onChange={(e) => setData('dot_color', e.target.value)}
                                        placeholder="bg-cyan-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="text_color">Warna Teks (Tailwind Class)</Label>
                                    <Input
                                        id="text_color"
                                        value={data.text_color}
                                        onChange={(e) => setData('text_color', e.target.value)}
                                        placeholder="text-cyan-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Label htmlFor="is_active">Aktifkan Jenjang Karir</Label>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
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
