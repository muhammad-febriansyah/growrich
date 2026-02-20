import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Save, Plus, Trash2, Image as ImageIcon, MapPin, BarChart3, List } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface CaraBergabungItem {
    title: string;
    desc: string;
    image: File | string | null;
    image_url?: string | null;
}

interface CompensationItem {
    title: string;
    description: string;
}

interface CompensationColumn {
    title: string;
    description: string;
    items: CompensationItem[];
}

interface ResellerProgramSettingsData {
    cara_bergabung: CaraBergabungItem[];
    compensation_title: string;
    compensation_description: string;
    compensation_columns: CompensationColumn[];
    trip_title: string;
    trip_description: string;
    trip_images: string[];
    trip_images_urls: string[];
}

interface Props {
    settings: ResellerProgramSettingsData;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reseller Program',
        href: '/admin/reseller-program',
    },
];

export default function EditResellerProgram({ settings }: Props) {
    // Initialize with default values if empty
    const initialCaraBergabung = (
        settings.cara_bergabung?.length === 2
            ? settings.cara_bergabung
            : [
                  { title: 'Paket Special Customer', desc: 'Paket Special Customer (SC) adalah paket bagi Anda yang ingin...', image: null },
                  { title: 'Paket Bisnis Reseller', desc: 'Paket Bisnis Reseller adalah paket bagi Anda yang ingin menjadi reseller...', image: null },
              ]
    ).map((item) => ({ ...item, image: null })); // existing image path is kept server-side via DB, only send File objects

    const initialColumns = settings.compensation_columns || [
        { title: 'BONUS HARIAN', description: 'Bonus Harian adalah bonus...', items: [{ title: 'Bonus Sponsor', description: '...' }] }
    ];

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        cara_bergabung: initialCaraBergabung,
        compensation_title: settings.compensation_title || 'Compensation Plan',
        compensation_description: settings.compensation_description || 'Compensation Plan kami disiapkan untuk Anda...',
        compensation_columns: initialColumns,
        trip_title: settings.trip_title || 'Trip Program',
        trip_description: settings.trip_description || '',
        trip_images: settings.trip_images || [],
        new_trip_images: [] as File[],
    });

    const [compressing, setCompressing] = React.useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/reseller-program', { forceFormData: true });
    };

    const handleCaraBergabungChange = async (index: number, field: keyof CaraBergabungItem, value: any) => {
        let processed = value;
        if (field === 'image' && value instanceof File) {
            setCompressing(true);
            try {
                processed = await compressImage(value);
            } finally {
                setCompressing(false);
            }
        }
        const newData = [...data.cara_bergabung];
        newData[index] = { ...newData[index], [field]: processed };
        setData('cara_bergabung', newData);
    };

    const addColumn = () => {
        setData('compensation_columns', [
            ...data.compensation_columns,
            { title: 'KOLOM BARU', description: '', items: [] }
        ]);
    };

    const removeColumn = (index: number) => {
        const newData = [...data.compensation_columns];
        newData.splice(index, 1);
        setData('compensation_columns', newData);
    };

    const handleColumnChange = (index: number, field: keyof CompensationColumn, value: any) => {
        const newData = [...data.compensation_columns];
        newData[index] = { ...newData[index], [field]: value };
        setData('compensation_columns', newData);
    };

    const addColumnItem = (columnIndex: number) => {
        const newData = [...data.compensation_columns];
        newData[columnIndex].items.push({ title: '', description: '' });
        setData('compensation_columns', newData);
    };

    const removeColumnItem = (columnIndex: number, itemIndex: number) => {
        const newData = [...data.compensation_columns];
        newData[columnIndex].items.splice(itemIndex, 1);
        setData('compensation_columns', newData);
    };

    const handleColumnItemChange = (columnIndex: number, itemIndex: number, field: keyof CompensationItem, value: string) => {
        const newData = [...data.compensation_columns];
        newData[columnIndex].items[itemIndex] = { ...newData[columnIndex].items[itemIndex], [field]: value };
        setData('compensation_columns', newData);
    };

    const handleNewTripImages = async (files: FileList | null) => {
        if (!files) return;
        setCompressing(true);
        try {
            const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f)));
            setData('new_trip_images', [...data.new_trip_images, ...compressed]);
        } finally {
            setCompressing(false);
        }
    };

    const removeNewTripImage = (index: number) => {
        const newImages = [...data.new_trip_images];
        newImages.splice(index, 1);
        setData('new_trip_images', newImages);
    };

    const removeExistingTripImage = (index: number) => {
        const currentImages = [...data.trip_images];
        currentImages.splice(index, 1);
        setData('trip_images', currentImages);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Reseller Program" />

            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 font-outfit uppercase tracking-tight">Reseller Program Page</h1>
                        <p className="text-sm text-muted-foreground">Kelola konten halaman landing Reseller Program.</p>
                    </div>
                    <Button onClick={submit} disabled={processing || compressing} className="gap-2 shadow-sm font-semibold">
                        <Save className="size-4" />
                        {compressing ? 'Mengompres gambar...' : 'Simpan Perubahan'}
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Cara Bergabung Section */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 py-4 px-6 flex flex-row items-center gap-2">
                            <MapPin className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Cara Bergabung</CardTitle>
                                <CardDescription>Kelola 2 box langkah bergabung.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {data.cara_bergabung.map((item, index) => (
                                    <div key={index} className="space-y-4 p-4 border rounded-xl bg-slate-50/20 shadow-sm transition-all hover:ring-2 hover:ring-primary/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-slate-800">Box #{index + 1}</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor={`cara_title_${index}`}>Judul</Label>
                                                <Input
                                                    id={`cara_title_${index}`}
                                                    value={item.title}
                                                    onChange={(e) => handleCaraBergabungChange(index, 'title', e.target.value)}
                                                    placeholder="Contoh: Paket Special Customer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`cara_desc_${index}`}>Deskripsi</Label>
                                                <Textarea
                                                    id={`cara_desc_${index}`}
                                                    value={item.desc}
                                                    onChange={(e) => handleCaraBergabungChange(index, 'desc', e.target.value)}
                                                    placeholder="Deskripsi singkat..."
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Gambar Ikon</Label>
                                                <div className="flex items-center gap-4">
                                                    {item.image_url ? (
                                                        <div className="size-20 border rounded-lg overflow-hidden bg-white flex items-center justify-center p-2 shrink-0">
                                                            <img src={item.image_url} alt="Icon" className="max-h-full object-contain" />
                                                        </div>
                                                    ) : (
                                                        <div className="size-20 border border-dashed rounded-lg bg-white flex items-center justify-center text-muted-foreground shrink-0">
                                                            <ImageIcon className="size-8 opacity-20" />
                                                        </div>
                                                    )}
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handleCaraBergabungChange(index, 'image', e.target.files?.[0] || null)}
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compensation Plan Section */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 py-4 px-6 flex flex-row items-center gap-2">
                            <BarChart3 className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Compensation Plan</CardTitle>
                                <CardDescription>Kelola kolom dan poin-poin rencana kompensasi.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="comp_title">Judul Seksi</Label>
                                    <Input
                                        id="comp_title"
                                        value={data.compensation_title}
                                        onChange={(e) => setData('compensation_title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="comp_desc">Deskripsi Seksi</Label>
                                    <Textarea
                                        id="comp_desc"
                                        value={data.compensation_description}
                                        onChange={(e) => setData('compensation_description', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <hr className="my-6" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-md font-bold text-slate-900 border-l-4 border-primary pl-3">Kolom Kompensasi</h3>
                                    <Button type="button" variant="outline" size="sm" onClick={addColumn} className="gap-2">
                                        <Plus className="size-4" /> Tambah Kolom
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {data.compensation_columns.map((column, colIndex) => (
                                        <Card key={colIndex} className="border bg-slate-50/30">
                                            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                                                <div className="flex-1 mr-4">
                                                    <Input
                                                        className="h-8 font-bold text-md border-transparent bg-transparent hover:border-slate-200 focus:bg-white"
                                                        value={column.title}
                                                        onChange={(e) => handleColumnChange(colIndex, 'title', e.target.value)}
                                                        placeholder="Judul Kolom (cth: BONUS HARIAN)"
                                                    />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeColumn(colIndex)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-4">
                                                <Textarea
                                                    className="text-sm bg-white"
                                                    value={column.description}
                                                    onChange={(e) => handleColumnChange(colIndex, 'description', e.target.value)}
                                                    placeholder="Deskripsi singkat kolom..."
                                                    rows={2}
                                                />

                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        <List className="size-3" /> Sub-item Kompensasi
                                                    </div>

                                                    {column.items.map((item, itemIndex) => (
                                                        <div key={itemIndex} className="flex gap-3 items-start p-3 bg-white border rounded-lg shadow-sm">
                                                            <div className="flex-1 space-y-3">
                                                                <Input
                                                                    className="h-8 font-semibold text-sm"
                                                                    value={item.title}
                                                                    onChange={(e) => handleColumnItemChange(colIndex, itemIndex, 'title', e.target.value)}
                                                                    placeholder="Sub-item (cth: Bonus Sponsor)"
                                                                />
                                                                <Textarea
                                                                    className="text-xs"
                                                                    value={item.description}
                                                                    onChange={(e) => handleColumnItemChange(colIndex, itemIndex, 'description', e.target.value)}
                                                                    placeholder="Detail sub-item..."
                                                                    rows={2}
                                                                />
                                                            </div>
                                                            <Button type="button" variant="ghost" size="icon" className="text-slate-400 h-8 w-8 hover:text-destructive" onClick={() => removeColumnItem(colIndex, itemIndex)}>
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    ))}

                                                    <Button type="button" variant="ghost" size="sm" onClick={() => addColumnItem(colIndex)} className="w-full border-dashed border-2 hover:bg-white text-xs font-semibold gap-1.5 mt-2">
                                                        <Plus className="size-3" /> Tambah Sub-item
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trip Program Section */}
                    <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50 py-4 px-6 flex flex-row items-center gap-2">
                            <ImageIcon className="size-5 text-primary" />
                            <div>
                                <CardTitle className="text-lg">Trip Program Gallery</CardTitle>
                                <CardDescription>Kelola galeri foto program perjalanan.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="trip_title">Judul Seksi</Label>
                                    <Input
                                        id="trip_title"
                                        value={data.trip_title}
                                        onChange={(e) => setData('trip_title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trip_desc">Deskripsi Seksi</Label>
                                    <Textarea
                                        id="trip_desc"
                                        value={data.trip_description}
                                        onChange={(e) => setData('trip_description', e.target.value)}
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Galeri Foto</Label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {/* Existing Images */}
                                    {data.trip_images.map((path, index) => (
                                        <div key={`existing-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border bg-slate-100">
                                            <img src={settings.trip_images_urls[index]} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingTripImage(index)}
                                                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Images Preview */}
                                    {data.new_trip_images.map((file, index) => (
                                        <div key={`new-${index}`} className="relative group aspect-video rounded-lg overflow-hidden border bg-blue-50 border-blue-200">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-70" />
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-600 bg-blue-50/50">NEW</div>
                                            <button
                                                type="button"
                                                onClick={() => removeNewTripImage(index)}
                                                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="size-3" />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-primary hover:bg-slate-50 cursor-pointer transition-all">
                                        <Plus className="size-6 text-slate-400" />
                                        <span className="text-[10px] font-bold text-slate-500 mt-1">Tambah Foto</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleNewTripImages(e.target.files)}
                                        />
                                    </label>
                                </div>
                                {errors.new_trip_images && <p className="text-sm text-destructive font-semibold">{errors.new_trip_images}</p>}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
