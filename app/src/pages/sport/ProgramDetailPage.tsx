import React from 'react';
import { useParams } from 'react-router-dom';
import { useProgram } from '../../features/sport/hooks/useProgram';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import Table from '../../components/ui/Table';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import EmptyState from '../../components/ui/EmptyState';
import { Activity, CalendarClock, Dumbbell, Layers } from 'lucide-react';
import type { Exercise, Program } from '../../features/sport/types';

const ProgramDetailPage = () => {
    const { programId } = useParams<{ programId: string }>();
    const { program, isLoading, error } = useProgram(programId);

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };

    const deriveCompletion = (p: Program) => {
        const base = p.level === 'beginner' ? 78 : p.level === 'intermediate' ? 64 : 52;
        const mod = (hash(`c:${p.id}`) % 15) - 7;
        return Math.max(22, Math.min(92, base + mod));
    };

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">Programme · détails</div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="92px" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                        <Skeleton height="120px" />
                    </div>
                    <Skeleton height="360px" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">Programme · détails</div>
                    </div>
                </div>
                <div className="mt-4 text-red-500">Erreur lors du chargement du programme.</div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">Programme · détails</div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState title="Programme introuvable" description="Vérifiez l’ID dans l’URL ou la disponibilité du dataset." />
                </div>
            </div>
        );
    }

    const completion = deriveCompletion(program);

    const distributions = (() => {
        const typeCount: Record<string, number> = {};
        const bodyCount: Record<string, number> = {};
        const eqCount: Record<string, number> = {};
        program.exercises.forEach((e) => {
            const t = e.exerciseType ?? 'Other';
            const b = e.bodyPart ?? 'Other';
            const q = e.equipment ?? 'No equipment';
            typeCount[t] = (typeCount[t] ?? 0) + 1;
            bodyCount[b] = (bodyCount[b] ?? 0) + 1;
            eqCount[q] = (eqCount[q] ?? 0) + 1;
        });
        const toTop = (obj: Record<string, number>, n: number) =>
            Object.entries(obj)
                .map(([k, v]) => ({ label: k, value: v }))
                .sort((a, b) => b.value - a.value)
                .slice(0, n);
        const donut = toTop(typeCount, 5).map((d) => ({ name: d.label, value: d.value }));
        return {
            donut,
            bodyBars: toTop(bodyCount, 8),
            equipBars: toTop(eqCount, 8),
        };
    })();

    const exerciseColumns = [
        {
            header: 'Exercice',
            accessor: 'name',
            cell: (e: Exercise) => (
                <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{e.name}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <Badge text={e.exerciseType ?? 'Other'} color="info" />
                        <Badge text={e.bodyPart ?? 'Other'} color="default" />
                        <Badge text={e.equipment ?? 'No equipment'} color={e.equipment ? 'success' : 'default'} />
                    </div>
                </div>
            ),
        },
        { header: 'Type', accessor: 'exerciseType', cell: (e: Exercise) => <span>{e.exerciseType ?? '—'}</span> },
        { header: 'Zone', accessor: 'bodyPart', cell: (e: Exercise) => <span>{e.bodyPart ?? '—'}</span> },
        { header: 'Équipement', accessor: 'equipment', cell: (e: Exercise) => <span>{e.equipment ?? '—'}</span> },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Programme</div>
                    <div className="page-subtitle">Détails · composition · performance</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={program.level} color={program.level === 'advanced' ? 'warning' : program.level === 'intermediate' ? 'info' : 'success'} />
                    <Badge text={`${program.duration} min`} color="info" />
                    <Badge text={`${program.exercises.length} exos`} color="success" />
                </div>
            </div>

            <div className="surface-solid p-5">
                <div className="text-xl font-semibold text-slate-900">{program.name}</div>
                <div className="mt-1 text-sm text-slate-600 max-w-3xl">{program.description}</div>
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Complétion estimée</span>
                        <span className="font-semibold text-slate-900">{completion}%</span>
                    </div>
                    <ProgressBar value={completion} variant={completion >= 70 ? 'success' : completion >= 55 ? 'primary' : 'warning'} />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Durée"
                    value={`${program.duration} min`}
                    subtitle="séance"
                    icon={<CalendarClock className="h-4 w-4" />}
                    trend={[{ name: 'durée', value: program.duration }]}
                />
                <StatCard
                    title="Exercices"
                    value={nf.format(program.exercises.length)}
                    subtitle="composition"
                    icon={<Dumbbell className="h-4 w-4" />}
                    trend={distributions.bodyBars.map((d) => ({ name: d.label, value: d.value }))}
                />
                <StatCard
                    title="Types (top)"
                    value={distributions.donut[0]?.name ?? '—'}
                    subtitle="dominant"
                    icon={<Layers className="h-4 w-4" />}
                    trend={distributions.donut}
                />
                <StatCard
                    title="Intensité"
                    value={`${Math.min(10, Math.max(4, Math.round((program.duration / 8) + program.exercises.length / 3)))} / 10`}
                    subtitle="heuristique"
                    icon={<Activity className="h-4 w-4" />}
                    trend={distributions.equipBars.map((d) => ({ name: d.label, value: d.value }))}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Répartition types" description="Top 5">
                    {program.exercises.length ? (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="mx-auto w-full max-w-[220px] sm:mx-0">
                                <DonutChart
                                    data={distributions.donut}
                                    colors={['#2563eb', '#06b6d4', '#10b981', '#94a3b8', '#f59e0b']}
                                    size={220}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                {distributions.donut.map((d) => (
                                    <div key={d.name} className="flex items-center justify-between">
                                        <div className="text-sm text-slate-700">{d.name}</div>
                                        <div className="text-sm font-semibold text-slate-900">{nf.format(d.value)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-600">Aucun exercice.</div>
                    )}
                </Card>

                <Card title="Zones" description="Top 8" className="lg:col-span-2">
                    <div className="h-[260px]">
                        <BarChart data={distributions.bodyBars} xKey="label" yKey="value" height={260} barColor="#2563eb" />
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Exercices" description="Tableau enrichi" className="lg:col-span-2">
                    <Table columns={exerciseColumns} data={program.exercises} rowKey={(e) => e.id} />
                </Card>

                <Card title="Progression" description="Recommandations coach">
                    <SectionHeader title="Plan" subtitle="Semaine 1 → 4" />
                    <div className="mt-3 space-y-3">
                        {[
                            { week: 'S1', label: 'Onboarding', pct: Math.min(100, completion + 8) },
                            { week: 'S2', label: 'Charge', pct: Math.min(100, completion + 4) },
                            { week: 'S3', label: 'Stabilisation', pct: completion },
                            { week: 'S4', label: 'Intensification', pct: Math.max(20, completion - 6) },
                        ].map((w) => (
                            <div key={w.week} className="rounded-2xl border border-slate-200/70 bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{w.week} · {w.label}</div>
                                        <div className="text-xs text-slate-600">Objectif: complétion</div>
                                    </div>
                                    <Badge text={`${w.pct}%`} color={w.pct >= 70 ? 'success' : w.pct >= 55 ? 'info' : 'warning'} />
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={w.pct} variant={w.pct >= 70 ? 'success' : w.pct >= 55 ? 'primary' : 'warning'} />
                                </div>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                            <div className="text-sm font-semibold text-slate-900">Note IA</div>
                            <div className="mt-1 text-xs text-slate-600">
                                Ajouter 1 exercice &quot;mobility&quot; en fin de séance pour réduire le risque de blessure et améliorer la rétention.
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProgramDetailPage;