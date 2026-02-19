import { Head } from '@inertiajs/react';
import { Trophy, TrendingUp, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface Level {
    value: string;
    label: string;
    requiredPp: number;
    isCurrent: boolean;
    isAchieved: boolean;
    sortOrder: number;
}

interface Props {
    currentLevel: { value: string; label: string; requiredPp: number };
    nextLevel: { value: string; label: string; requiredPp: number } | null;
    leftPp: number;
    rightPp: number;
    smallerLeg: number;
    levels: Level[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Jenjang Karir', href: '/member/career' },
];

const levelColors: Record<string, string> = {
    Member: 'bg-gray-100 text-gray-700 border-gray-300',
    CoreLoader: 'bg-blue-100 text-blue-700 border-blue-300',
    SapphireManager: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    RubyManager: 'bg-red-100 text-red-700 border-red-300',
    EmeraldManager: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DiamondManager: 'bg-sky-100 text-sky-700 border-sky-300',
    BlueDiamondManager: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    EliteTeamGlobal: 'bg-amber-100 text-amber-700 border-amber-300',
};

export default function CareerPage({ currentLevel, nextLevel, leftPp, rightPp, smallerLeg, levels }: Props) {
    const progressToNext = nextLevel
        ? Math.min(100, (smallerLeg / nextLevel.requiredPp) * 100)
        : 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jenjang Karir" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Jenjang Karir</h1>
                    <p className="text-sm text-muted-foreground">Pantau progress karir dan Pairing Point Anda.</p>
                </div>

                {/* PP Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0 shadow-md">
                        <CardContent className="p-5">
                            <p className="text-sm opacity-80">PP Kiri</p>
                            <p className="text-3xl font-bold mt-1">{leftPp.toLocaleString('id-ID')}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0 shadow-md">
                        <CardContent className="p-5">
                            <p className="text-sm opacity-80">PP Kanan</p>
                            <p className="text-3xl font-bold mt-1">{rightPp.toLocaleString('id-ID')}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0 shadow-md">
                        <CardContent className="p-5">
                            <p className="text-sm opacity-80">PP Efektif (Leg Terkecil)</p>
                            <p className="text-3xl font-bold mt-1">{smallerLeg.toLocaleString('id-ID')}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Level & Progress */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Trophy className="h-6 w-6 text-amber-500" />
                            <div>
                                <CardTitle>Level Saat Ini: {currentLevel.label}</CardTitle>
                                {nextLevel && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Menuju {nextLevel.label} — butuh {nextLevel.requiredPp.toLocaleString('id-ID')} PP di leg terkecil
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    {nextLevel && (
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress ke {nextLevel.label}</span>
                                    <span className="font-semibold">{smallerLeg.toLocaleString('id-ID')} / {nextLevel.requiredPp.toLocaleString('id-ID')} PP</span>
                                </div>
                                <Progress value={progressToNext} className="h-3" />
                                <p className="text-xs text-muted-foreground">{progressToNext.toFixed(1)}% tercapai</p>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* All Levels Ladder */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Tangga Jenjang Karir
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[...levels].sort((a, b) => b.sortOrder - a.sortOrder).map((level) => (
                                <div
                                    key={level.value}
                                    className={`flex items-center justify-between rounded-lg border p-3 transition-all ${level.isCurrent
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : level.isAchieved
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-gray-100 bg-gray-50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {level.isAchieved ? (
                                            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                        ) : (
                                            <Lock className="h-5 w-5 text-gray-400 shrink-0" />
                                        )}
                                        <div>
                                            <p className={`font-semibold text-sm ${level.isCurrent ? 'text-primary' : ''}`}>
                                                {level.label}
                                                {level.isCurrent && (
                                                    <Badge className="ml-2 text-[10px] bg-primary text-white">Anda di sini</Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {level.requiredPp === 0 ? 'Tidak ada syarat PP' : `Min. ${level.requiredPp.toLocaleString('id-ID')} PP di leg terkecil`}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${levelColors[level.value] ?? 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                                        {level.requiredPp === 0 ? 'Awal' : `${level.requiredPp.toLocaleString('id-ID')} PP`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
