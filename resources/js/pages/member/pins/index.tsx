import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Pin {
    id: number;
    pin_code: string;
    package_type: string;
    price: number;
    status: string;
    created_at: string;
}

interface Props {
    pins: {
        data: Pin[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'PIN Saya', href: '/member/pins' },
];

export default function PinIndex({ pins }: Props) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Kode PIN berhasil disalin!');
    };

    const columns: ColumnDef<Pin>[] = [
        {
            accessorKey: 'pin_code',
            header: 'Kode PIN',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-muted rounded font-mono font-bold text-sm">
                        {row.original.pin_code}
                    </code>
                    {row.original.status === 'available' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(row.original.pin_code)}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
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
            cell: ({ row }) => (
                <div className="font-medium">
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.price)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const styles: Record<string, string> = {
                    available: 'bg-green-100 text-green-700 border-green-300',
                    used: 'bg-slate-100 text-slate-500 border-slate-300',
                    expired: 'bg-red-100 text-red-700 border-red-300',
                };
                const labels: Record<string, string> = {
                    available: 'Tersedia',
                    used: 'Terpakai',
                    expired: 'Kedaluwarsa',
                };
                const s = row.original.status;
                return (
                    <Badge variant="outline" className={`${styles[s] ?? ''}`}>
                        {labels[s] ?? s}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Diterima Pada',
            cell: ({ row }) => (
                <div className="text-xs text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PIN Saya" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">PIN Registrasi Saya</h1>
                    <p className="text-muted-foreground">Daftar PIN yang ditugaskan admin kepada Anda untuk registrasi member baru.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="shadow-premium border-none bg-brand/5">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-xs uppercase font-bold tracking-wider opacity-70 text-brand">Total PIN Tersedia</CardDescription>
                            <CardTitle className="text-3xl font-extrabold tracking-tight">
                                {pins.data.filter(p => p.status === 'available').length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-premium border-none">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Daftar PIN</CardTitle>
                            <CardDescription>Gunakan kode PIN di bawah ini pada form registrasi member baru.</CardDescription>
                        </div>
                        <div className="p-2 bg-brand/10 rounded-full text-brand">
                            <Key className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={pins.data}
                            emptyTitle="Belum ada PIN"
                            emptyDescription="Anda belum memiliki PIN yang ditugaskan oleh admin."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
