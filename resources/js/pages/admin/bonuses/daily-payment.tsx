import { Head, Link, router } from '@inertiajs/react';
import { dailyPayment, exportDailyPayment, payMember } from '@/actions/App/Http/Controllers/Admin/BonusController';
import { Banknote, Download, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface BonusLine {
    id: number;
    bonus_type: string;
    cash_amount: number;
    status: string;
}

interface MemberPayment {
    member_profile_id: number;
    name: string;
    referral_code: string;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    bonuses: BonusLine[];
    total_cash: number;
    all_paid: boolean;
}

interface Stats {
    total_members: number;
    total_unpaid: number;
    total_cash: number;
    total_unpaid_cash: number;
}

interface Props {
    members: MemberPayment[];
    date: string;
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manajemen Bonus', href: '/admin/bonuses' },
    { title: 'Pembayaran Harian', href: dailyPayment.url() },
];

const fmt = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const BONUS_LABELS: Record<string, string> = {
    Sponsor: 'Sponsor',
    PassUpSponsor: 'Pass Up Sponsor',
    Pairing: 'Pairing',
    Matching: 'Matching',
    Leveling: 'Leveling',
    RepeatOrder: 'Repeat Order',
    GlobalSharing: 'Global Sharing',
};

export default function DailyPayment({ members, date, stats }: Props) {
    const [selectedDate, setSelectedDate] = useState(date);

    const handleDateChange = (value: string) => {
        setSelectedDate(value);
        router.get(dailyPayment.url(), { tanggal: value }, { preserveState: false });
    };

    const handlePayMember = (member: MemberPayment) => {
        if (confirm(`Tandai semua bonus ${member.name} (${fmt(member.total_cash)}) sebagai Sudah Ditransfer?`)) {
            router.post(payMember.url(), {
                member_profile_id: member.member_profile_id,
                date: date,
            });
        }
    };

    const exportUrl = exportDailyPayment.url({ query: { tanggal: date } });

    const formatDateId = (d: string) => {
        const [y, m, day] = d.split('-');
        return `${parseInt(day)}/${parseInt(m)}/${y}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pembayaran Bonus Harian" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pembayaran Bonus Harian</h1>
                        <p className="text-sm text-muted-foreground">
                            Daftar bonus yang perlu ditransfer ke member.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            className="bg-white w-[160px]"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                        />
                        <Button
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => { window.location.href = exportUrl; }}
                        >
                            <Download className="h-4 w-4" />
                            Download Excel
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border bg-slate-50 p-4">
                        <p className="text-xs text-slate-500">Total Member</p>
                        <p className="mt-1 text-2xl font-bold text-slate-700">{stats.total_members}</p>
                    </div>
                    <div className="rounded-xl border bg-amber-50 p-4">
                        <p className="text-xs text-amber-600">Belum Ditransfer</p>
                        <p className="mt-1 text-2xl font-bold text-amber-700">{stats.total_unpaid}</p>
                    </div>
                    <div className="rounded-xl border bg-amber-50 p-4">
                        <p className="text-xs text-amber-600">Total Belum Ditransfer</p>
                        <p className="mt-1 text-lg font-bold text-amber-700">{fmt(stats.total_unpaid_cash)}</p>
                    </div>
                    <div className="rounded-xl border bg-green-50 p-4">
                        <p className="text-xs text-green-600">Total Semua Bonus</p>
                        <p className="mt-1 text-lg font-bold text-green-700">{fmt(stats.total_cash)}</p>
                    </div>
                </div>

                {/* Table */}
                {members.length === 0 ? (
                    <div className="rounded-xl border bg-white py-16 text-center">
                        <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                        <p className="mt-3 font-medium text-slate-700">Tidak ada bonus pada tanggal ini</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Pilih tanggal lain atau tunggu admin menyetujui bonus terlebih dahulu.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <th className="px-4 py-3 text-left">Member</th>
                                    <th className="px-4 py-3 text-left">Info Bank</th>
                                    <th className="px-4 py-3 text-left">Rincian Bonus</th>
                                    <th className="px-4 py-3 text-right">Total Cash</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {members.map((member) => (
                                    <tr key={member.member_profile_id} className={member.all_paid ? 'bg-green-50/40' : ''}>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-slate-900">{member.name}</div>
                                            <div className="font-mono text-xs text-muted-foreground">{member.referral_code}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.bank_name ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{member.bank_name}</span>
                                                    <span className="font-mono text-xs text-slate-600">{member.bank_account_number}</span>
                                                    <span className="text-xs text-muted-foreground">{member.bank_account_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Belum diisi</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                {member.bonuses.map((b) => (
                                                    <div key={b.id} className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-600">
                                                            {BONUS_LABELS[b.bonus_type] ?? b.bonus_type}
                                                        </span>
                                                        <span className="font-medium text-slate-800">{fmt(b.cash_amount)}</span>
                                                        {b.status === 'Paid' && (
                                                            <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">✓</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                                            {fmt(member.total_cash)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {member.all_paid ? (
                                                <span className="inline-flex items-center rounded-full border border-green-300 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                    Sudah Ditransfer
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                                    Belum Ditransfer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!member.all_paid && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 gap-1 border-blue-300 bg-blue-50 px-2 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                                    onClick={() => handlePayMember(member)}
                                                >
                                                    <Banknote className="h-3.5 w-3.5" />
                                                    Tandai Ditransfer
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-slate-200 bg-slate-50">
                                    <td colSpan={3} className="px-4 py-3 font-semibold text-slate-700">
                                        Total — {formatDateId(date)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                                        {fmt(stats.total_cash)}
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
