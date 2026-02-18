import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Key, Plus, Search, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Pin {
    id: number;
    pin_code: string;
    package_type: string;
    price: number;
    status: string;
    purchased_by?: { name: string };
    assigned_to?: { name: string };
    used_by?: { name: string };
    created_at: string;
}

interface Member {
    id: number;
    name: string;
    email: string;
}

interface Props {
    pins: {
        data: Pin[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    members: Member[];
    filters: {
        status?: string;
        package?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen PIN', href: '/admin/pins' },
];

export default function PinIndex({ pins, members, filters }: Props) {
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const { data: generateData, setData: setGenerateData, post: postGenerate, processing: generateProcessing, reset: resetGenerate, errors: generateErrors } = useForm({
        package_type: 'Silver',
        amount: 10,
    });

    const { data: assignData, setData: setAssignData, post: postAssign, processing: assignProcessing, reset: resetAssign, errors: assignErrors } = useForm({
        user_id: '',
    });

    const columns: ColumnDef<Pin>[] = [
        {
            accessorKey: 'pin_code',
            header: 'Kode PIN',
            cell: ({ row }) => <div className="font-mono font-medium text-slate-900">{row.original.pin_code}</div>,
        },
        {
            accessorKey: 'package_type',
            header: 'Paket',
            cell: ({ row }) => {
                const styles: Record<string, string> = {
                    Silver: 'bg-slate-100 text-slate-700 border-slate-300',
                    Gold: 'bg-amber-100 text-amber-700 border-amber-300',
                    Platinum: 'bg-violet-100 text-violet-700 border-violet-300',
                };
                const t = row.original.package_type;
                return (
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[t] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {t}
                    </span>
                );
            },
        },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ row }) => <div>Rp {new Intl.NumberFormat('id-ID').format(row.original.price)}</div>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const styles: Record<string, string> = {
                    available: 'bg-green-100 text-green-700 border-green-300',
                    used: 'bg-blue-100 text-blue-700 border-blue-300',
                    expired: 'bg-red-100 text-red-700 border-red-300',
                };
                const labels: Record<string, string> = {
                    available: 'Tersedia',
                    used: 'Digunakan',
                    expired: 'Kedaluwarsa',
                };
                const s = row.original.status;
                return (
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${styles[s] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {labels[s] ?? s}
                    </span>
                );
            },
        },
        {
            id: 'assigned_to',
            header: 'Ditugaskan Ke',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{row.original.assigned_to?.name || '-'}</span>
                </div>
            ),
        },
        {
            id: 'used_by',
            header: 'Digunakan Oleh',
            cell: ({ row }) => row.original.used_by?.name || '-',
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Buat',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {row.original.status === 'available' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => {
                                    setSelectedPin(row.original);
                                    setIsAssignOpen(true);
                                }}
                            >
                                <UserPlus className="h-3.5 w-3.5" />
                                Tugaskan
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive font-medium h-8"
                                onClick={() => {
                                    if (confirm('Nonaktifkan PIN ini?')) {
                                        router.post(`/admin/pins/${row.original.id}/expire`);
                                    }
                                }}
                            >
                                Nonaktifkan
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        postGenerate('/admin/pins', {
            onSuccess: () => {
                setIsGenerateOpen(false);
                resetGenerate();
            },
        });
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPin) return;
        postAssign(`/admin/pins/${selectedPin.id}/assign`, {
            onSuccess: () => {
                setIsAssignOpen(false);
                resetAssign();
                setSelectedPin(null);
                setSelectedMember(null);
            },
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters: Record<string, string> = { ...filters };
        if (value === 'all' || value === '') {
            delete newFilters[key];
        } else {
            newFilters[key] = value;
        }
        router.get('/admin/pins', newFilters, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen PIN" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold font-heading">Registration PIN</h1>
                        <p className="text-muted-foreground">Monitor dan buat PIN untuk aktivasi member.</p>
                    </div>

                    <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                        <DialogTrigger asChild>
                            <Button className="font-semibold shadow-sm text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Generate PIN Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleGenerate}>
                                <DialogHeader>
                                    <DialogTitle>Generate PIN</DialogTitle>
                                    <DialogDescription>
                                        Buat PIN registrasi secara massal untuk paket member tertentu.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="package_type">Pilih Paket</Label>
                                        <Select
                                            value={generateData.package_type}
                                            onValueChange={(v) => setGenerateData('package_type', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Silver">Silver (Rp 2.450.000)</SelectItem>
                                                <SelectItem value="Gold">Gold (Rp 4.900.000)</SelectItem>
                                                <SelectItem value="Platinum">Platinum (Rp 7.350.000)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Jumlah PIN</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={generateData.amount}
                                            onChange={(e) => setGenerateData('amount', parseInt(e.target.value))}
                                            className="font-medium"
                                        />
                                        {generateErrors.amount && <p className="text-xs text-destructive">{generateErrors.amount}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full sm:w-auto text-white" disabled={generateProcessing}>
                                        Generate {generateData.amount} PIN
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari kode PIN..."
                            className="pl-9 bg-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </form>

                    <div className="flex gap-2">
                        <Select
                            defaultValue={filters.status ?? 'all'}
                            onValueChange={(v) => handleFilterChange('status', v)}
                        >
                            <SelectTrigger className="w-[160px] bg-white">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="available">Tersedia</SelectItem>
                                <SelectItem value="used">Digunakan</SelectItem>
                                <SelectItem value="expired">Kedaluwarsa</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            defaultValue={filters.package ?? 'all'}
                            onValueChange={(v) => handleFilterChange('package', v)}
                        >
                            <SelectTrigger className="w-[140px] bg-white">
                                <SelectValue placeholder="Semua Paket" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Paket</SelectItem>
                                <SelectItem value="Silver">Silver</SelectItem>
                                <SelectItem value="Gold">Gold</SelectItem>
                                <SelectItem value="Platinum">Platinum</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={pins.data}
                    emptyTitle="PIN tidak ditemukan"
                    emptyDescription="Belum ada PIN yang dibuat atau tidak ditemukan yang sesuai dengan filter."
                />

                {/* Pagination */}
                <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        Halaman {pins.current_page} dari {pins.last_page} · {pins.total} total PIN
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pins.current_page === 1}
                            onClick={() => {
                                const prev = pins.links[pins.current_page - 1];
                                if (prev?.url) router.get(prev.url);
                            }}
                            className="bg-white"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pins.current_page === pins.last_page}
                            onClick={() => {
                                const next = pins.links[pins.current_page + 1];
                                if (next?.url) router.get(next.url);
                            }}
                            className="bg-white"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </div>

            {/* Assign Dialog */}
            <Dialog open={isAssignOpen} onOpenChange={(open) => {
                setIsAssignOpen(open);
                if (!open) {
                    resetAssign();
                    setSelectedMember(null);
                    setSelectedPin(null);
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleAssign}>
                        <DialogHeader>
                            <DialogTitle>Tugaskan PIN</DialogTitle>
                            <DialogDescription>
                                Pilih member yang akan diberikan hak untuk menggunakan PIN <span className="font-mono font-bold">{selectedPin?.pin_code}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label>Pilih Member</Label>
                                {selectedMember ? (
                                    <div className="flex items-center justify-between rounded-md border bg-accent/50 px-3 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{selectedMember.name}</span>
                                            <span className="text-xs text-muted-foreground">{selectedMember.email}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={() => {
                                                setSelectedMember(null);
                                                setAssignData('user_id', '');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Command className="rounded-md border shadow-sm">
                                        <CommandInput placeholder="Ketik nama atau email member..." />
                                        <CommandList className="max-h-[200px]">
                                            <CommandEmpty>Member tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {members.map((member) => (
                                                    <CommandItem
                                                        key={member.id}
                                                        value={`${member.name} ${member.email}`}
                                                        className="group"
                                                        onSelect={() => {
                                                            setSelectedMember(member);
                                                            setAssignData('user_id', member.id.toString());
                                                        }}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{member.name}</span>
                                                            <span className="text-xs text-muted-foreground group-data-[selected=true]:text-white/80">{member.email}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                )}
                                {assignErrors.user_id && <p className="text-xs text-destructive">{assignErrors.user_id}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full sm:w-auto text-white" disabled={assignProcessing || !assignData.user_id}>
                                Tugaskan PIN
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
