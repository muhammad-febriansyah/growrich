import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Bonus {
    id: number;
    bonus_type: string;
    amount: number;
    status: string;
    bonus_date: string;
    created_at: string;
}

interface Props {
    bonuses: {
        data: Bonus[];
        current_page: number;
        last_page: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Riwayat Bonus', href: '/member/bonuses' },
];

export default function BonusIndex({ bonuses }: Props) {
    const columns: ColumnDef<Bonus>[] = [
        {
            accessorKey: 'bonus_date',
            header: 'Tanggal',
            cell: ({ row }) => <div>{new Date(row.original.bonus_date || row.original.created_at).toLocaleDateString()}</div>,
        },
        {
            accessorKey: 'bonus_type',
            header: 'Jenis Bonus',
            cell: ({ row }) => (
                <span className="font-semibold text-xs tracking-tight uppercase text-slate-700">
                    {row.original.bonus_type}
                </span>
            ),
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: ({ row }) => (
                <div className="font-bold text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(row.original.amount)}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.status === 'approved' ? 'default' : 'secondary'}>
                    {row.original.status === 'approved' ? 'Diterima' : 'Pending'}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Bonus Anda" />

            <div className="flex flex-col gap-6 p-4 md:p-6 text-foreground">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold font-heading">Bonus & Penghasilan</h1>
                    <p className="text-muted-foreground">Monitor semua bonus yang Anda peroleh dari sistem.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="shadow-premium border-none">
                        <CardHeader className="pb-3">
                            <CardDescription className="text-xs uppercase font-bold tracking-wider opacity-70 text-primary">Total Bonus Disetujui</CardDescription>
                            <CardTitle className="text-3xl font-extrabold tracking-tight">
                                Rp {new Intl.NumberFormat('id-ID').format(bonuses.data.reduce((acc, curr) => acc + (curr.status === 'approved' ? curr.amount : 0), 0))}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-premium border-none">
                    <CardHeader>
                        <CardTitle>Daftar Bonus</CardTitle>
                        <CardDescription>Transaksi bonus harian dan bulanan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={bonuses.data}
                            emptyTitle="Belum ada bonus"
                            emptyDescription="Anda belum memiliki riwayat penghasilan bonus saat ini."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
