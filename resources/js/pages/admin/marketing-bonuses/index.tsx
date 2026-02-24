import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Trash2,
    Edit2,
    Save,
    Sun,
    CalendarDays,
    Sparkles
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface MarketingBonus {
    id: number;
    category: string;
    icon: string;
    icon_color: string | null;
    tag: string | null;
    tag_color: string | null;
    title: string;
    description: string;
    details: { label: string; value: string }[] | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    bonuses: MarketingBonus[];
}

export default function MarketingBonusesIndex({ bonuses }: Props) {
    const [editingBonus, setEditingBonus] = useState<MarketingBonus | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        category: 'daily',
        icon: 'Sparkles',
        icon_color: '',
        tag: '',
        tag_color: '',
        title: '',
        description: '',
        details: [] as { label: string; value: string }[],
        sort_order: 0,
        is_active: true,
    });

    const openCreateDialog = () => {
        setEditingBonus(null);
        reset();
        setIsDialogOpen(true);
    };

    const openEditDialog = (bonus: MarketingBonus) => {
        setEditingBonus(bonus);
        setData({
            category: bonus.category,
            icon: bonus.icon,
            icon_color: bonus.icon_color || '',
            tag: bonus.tag || '',
            tag_color: bonus.tag_color || '',
            title: bonus.title,
            description: bonus.description,
            details: bonus.details || [],
            sort_order: bonus.sort_order,
            is_active: bonus.is_active,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBonus) {
            put(`/admin/marketing-bonuses/${editingBonus.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Bonus berhasil diperbarui.');
                },
            });
        } else {
            post('/admin/marketing-bonuses', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success('Bonus berhasil ditambahkan.');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus bonus ini?')) {
            destroy(`/admin/marketing-bonuses/${id}`, {
                onSuccess: () => toast.success('Bonus berhasil dihapus.'),
            });
        }
    };

    const addDetail = () => {
        setData('details', [...data.details, { label: '', value: '' }]);
    };

    const removeDetail = (index: number) => {
        const newDetails = [...data.details];
        newDetails.splice(index, 1);
        setData('details', newDetails);
    };

    const updateDetail = (index: number, field: 'label' | 'value', value: string) => {
        const newDetails = [...data.details];
        newDetails[index][field] = value;
        setData('details', newDetails);
    };

    const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
        const Icon = (LucideIcons as any)[name];
        if (!Icon) return <LucideIcons.Sparkles className={className} />;
        return <Icon className={className} />;
    };

    const columns: ColumnDef<MarketingBonus>[] = [
        {
            accessorKey: 'sort_order',
            header: '#',
            cell: ({ row }) => <span className="text-xs font-mono text-slate-500">{row.original.sort_order}</span>,
        },
        {
            accessorKey: 'icon',
            header: 'Icon',
            cell: ({ row }) => (
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${row.original.icon_color || 'bg-slate-100 text-slate-600'}`}>
                    <DynamicIcon name={row.original.icon} className="h-5 w-5" />
                </div>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Bonus',
            cell: ({ row }) => (
                <div className="max-w-[300px]">
                    <h3 className="font-bold text-slate-900 leading-none mb-1">{row.original.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{row.original.description}</p>
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => (
                <Badge variant="outline" className={`capitalize ${row.original.category === 'daily' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                    {row.original.category === 'daily' ? (
                        <Sun className="h-3 w-3 mr-1" />
                    ) : (
                        <CalendarDays className="h-3 w-3 mr-1" />
                    )}
                    {row.original.category === 'daily' ? 'Harian' : 'Bulanan'}
                </Badge>
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
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Manajemen Marketing Bonus', href: '/admin/marketing-bonuses' }]}>
            <Head title="Kelola Marketing Bonus" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Marketing Bonus</h1>
                        <p className="text-sm text-muted-foreground">Kelola rincian bonus yang tampil di halaman Landing Page dan Marketing Plan.</p>
                    </div>
                    <Button onClick={openCreateDialog} className="w-full md:w-auto bg-primary hover:bg-primary/90 shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Tambah Bonus
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={bonuses}
                        emptyTitle="Belum ada bonus"
                        emptyDescription="Klik tombol 'Tambah Bonus' untuk membuat bonus baru."
                    />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingBonus ? 'Edit Bonus' : 'Tambah Bonus Baru'}</DialogTitle>
                            <DialogDescription>
                                Isi rincian bonus untuk ditampilkan di card landing page.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(v) => setData('category', v)}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Pilih Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Harian</SelectItem>
                                            <SelectItem value="monthly">Bulanan</SelectItem>
                                        </SelectContent>
                                    </Select>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul Bonus</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Bonus Sponsor"
                                    />
                                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon (Lucide Name)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="icon"
                                            value={data.icon}
                                            onChange={(e) => setData('icon', e.target.value)}
                                            placeholder="UserPlus, GitBranch, dll"
                                        />
                                        <div className="bg-slate-100 p-2 rounded border flex items-center justify-center min-w-[40px]">
                                            <DynamicIcon name={data.icon} className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tag">Tag (Kanan Atas)</Label>
                                    <Input
                                        id="tag"
                                        value={data.tag}
                                        onChange={(e) => setData('tag', e.target.value)}
                                        placeholder="Contoh: Instan, Per Bulan"
                                    />
                                </div>
                                <div className="space-y-2 flex items-center gap-4 pt-6">
                                    <Label htmlFor="is_active">Aktif</Label>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Ringkas</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Rincian Data (List/Tabel)</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                                        <Plus className="h-3 w-3 mr-1" /> Baris Baru
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {data.details.map((detail, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <Input
                                                className="flex-1"
                                                placeholder="Label (kiri)"
                                                value={detail.label}
                                                onChange={(e) => updateDetail(index, 'label', e.target.value)}
                                            />
                                            <Input
                                                className="flex-1"
                                                placeholder="Nilai (kanan)"
                                                value={detail.value}
                                                onChange={(e) => updateDetail(index, 'value', e.target.value)}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeDetail(index)}>
                                                <Trash2 className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                    {data.details.length === 0 && (
                                        <p className="text-center text-xs text-slate-400 py-4 border border-dashed rounded">Belum ada rincian data.</p>
                                    )}
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
