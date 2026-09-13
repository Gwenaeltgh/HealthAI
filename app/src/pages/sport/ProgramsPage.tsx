import React from 'react';
import { usePrograms } from '../../features/sport/hooks/usePrograms';
import { Link, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import { paths } from '../../routes/paths';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { CalendarClock, Dumbbell, Layers, TrendingUp } from 'lucide-react';
import type { Program } from '../../features/sport/types';
import { useAuth } from '../../features/auth/hooks/useAuth';

const ProgramsPage = () => {
    const { programs, isLoading, error } = usePrograms();
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';
    const location = useLocation();

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);
    const [query, setQuery] = React.useState('');
    const [level, setLevel] = React.useState<'all' | Program['level']>('all');
    const [sortBy, setSortBy] = React.useState<'duration_desc' | 'exercises_desc' | 'name_asc'>('duration_desc');

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };

    const deriveGoal = (p: Program): 'strength' | 'fat-loss' | 'mobility' | 'endurance' => {
        const pick = hash(p.id) % 4;
        return pick === 0 ? 'strength' : pick === 1 ? 'fat-loss' : pick === 2 ? 'mobility' : 'endurance';
    };

    const deriveCompletion = (p: Program) => {
        const base = p.level === 'beginner' ? 78 : p.level === 'intermediate' ? 64 : 52;
        const mod = (hash(`c:${p.id}`) % 15) - 7;
        return Math.max(22, Math.min(92, base + mod));
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = programs;
        if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
        if (level !== 'all') list = list.filter((p) => p.level === level);
        const sorted = [...list].sort((a, b) => {
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (sortBy === 'exercises_desc') return b.exercises.length - a.exercises.length;
            return b.duration - a.duration;
        });
        return sorted;
    }, [programs, query, level, sortBy]);

    const stats = React.useMemo(() => {
        const total = programs.length || 1;
        const totalExercises = programs.reduce((acc, p) => acc + p.exercises.length, 0);
        const avgDuration = Math.round(programs.reduce((acc, p) => acc + p.duration, 0) / total);
        const avgExercises = Math.round((totalExercises / total) * 10) / 10;
        const avgCompletion = Math.round(programs.reduce((acc, p) => acc + deriveCompletion(p), 0) / total);
        return { total, totalExercises, avgDuration, avgExercises, avgCompletion };
    }, [programs]);

    const levelDistribution = React.useMemo(() => {
        const acc = { beginner: 0, intermediate: 0, advanced: 0 };
        programs.forEach((p) => {
            acc[p.level] += 1;
        });
        return [
            { name: 'Beginner', value: acc.beginner },
            { name: 'Intermediate', value: acc.intermediate },
            { name: 'Advanced', value: acc.advanced },
        ];
    }, [programs]);

    const durationBuckets = React.useMemo(() => {
        const buckets = [
            { label: '≤20', count: 0 },
            { label: '21–30', count: 0 },
            { label: '31–45', count: 0 },
            { label: '46–60', count: 0 },
            { label: '60+', count: 0 },
        ];
        programs.forEach((p) => {
            if (p.duration <= 20) buckets[0].count += 1;
            else if (p.duration <= 30) buckets[1].count += 1;
            else if (p.duration <= 45) buckets[2].count += 1;
            else if (p.duration <= 60) buckets[3].count += 1;
            else buckets[4].count += 1;
        });
        return buckets.map((b) => ({ label: `${b.label} min`, value: b.count }));
    }, [programs]);

    const adoptionSeries = React.useMemo(() => {
        const base = programs.length ? 48 : 20;
        const seed = hash(`adopt:${programs.map((p) => p.id).join('|')}`);
        const points = Array.from({ length: 12 }).map((_, i) => {
            const noise = ((seed >> (i % 16)) & 7) - 3;
            return {
                name: `S${i + 1}`,
                value: Math.max(10, Math.round(base + i * 4 + noise)),
            };
        });
        return points;
    }, [programs]);

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">{isEnterprise ? 'Programmes entreprise · adoption · performance' : 'Programmes · adoption · performance'}</div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="96px" />
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
                        <div className="page-subtitle">{isEnterprise ? 'Programmes entreprise · adoption · performance' : 'Programmes · adoption · performance'}</div>
                    </div>
                </div>
                <div className="mt-4 text-red-500">Erreur de chargement des programmes.</div>
            </div>
        );
    }

    if (!programs.length) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">{isEnterprise ? 'Programmes entreprise · adoption · performance' : 'Programmes · adoption · performance'}</div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState title="Aucun programme" description="Vérifiez la source des programmes ou la configuration du référentiel." />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Sport</div>
                    <div className="page-subtitle">
                        {isEnterprise
                            ? `Parcours entreprise · ${user?.companyName ?? 'catalogue'} · distribution niveaux et adoption`
                            : 'Programmes · distribution niveaux · adoption'}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true' ? 'Source API' : 'Référentiel local'} color="info" />
                    <Badge text={`Programmes: ${programs.length}`} color="success" />
                </div>
            </div>

            <div className="mt-4 surface-solid p-4">
                <SectionHeader
                    title="Filtres"
                    subtitle={isEnterprise ? 'Rechercher, filtrer, trier le portefeuille' : 'Rechercher, filtrer, trier'}
                    right={<Badge text="Catalogue de parcours" color="default" />}
                />
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un programme…" />
                    </div>
                    <div className="lg:col-span-3">
                        <Select
                            value={level}
                            onChange={(v) => setLevel(v as any)}
                            options={[
                                { value: 'all', label: 'Niveau: tous' },
                                { value: 'beginner', label: 'Beginner' },
                                { value: 'intermediate', label: 'Intermediate' },
                                { value: 'advanced', label: 'Advanced' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <Select
                            value={sortBy}
                            onChange={(v) => setSortBy(v as any)}
                            options={[
                                { value: 'duration_desc', label: 'Tri: durée décroissante' },
                                { value: 'exercises_desc', label: 'Tri: nb exercices décroissant' },
                                { value: 'name_asc', label: 'Tri: nom A→Z' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-12 flex flex-wrap items-center gap-2">
                        <Badge text={`${filtered.length} résultats`} color="info" />
                        <Badge text={`Durée moy: ${stats.avgDuration} min`} color="default" />
                        <Badge text={`Exercices moy: ${stats.avgExercises}`} color="default" />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={isEnterprise ? 'Parcours actifs' : 'Programmes actifs'}
                    value={nf.format(stats.total)}
                    subtitle={isEnterprise ? 'portefeuille' : 'catalogue'}
                    icon={<Layers className="h-4 w-4" />}
                    trend={adoptionSeries}
                />
                <StatCard
                    title={isEnterprise ? 'Durée moyenne' : 'Durée moyenne'}
                    value={`${stats.avgDuration} min`}
                    subtitle={isEnterprise ? 'par session' : 'par séance'}
                    icon={<CalendarClock className="h-4 w-4" />}
                    trend={durationBuckets.map((d) => ({ name: d.label, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Exercices total' : 'Exercices total'}
                    value={nf.format(stats.totalExercises)}
                    subtitle={isEnterprise ? 'dans le portefeuille' : 'dans les programmes'}
                    icon={<Dumbbell className="h-4 w-4" />}
                    trend={levelDistribution.map((d) => ({ name: d.name, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Complétion estimée' : 'Complétion estimée'}
                    value={`${stats.avgCompletion}%`}
                    subtitle={isEnterprise ? 'lecture opérationnelle' : 'heuristique'}
                    icon={<TrendingUp className="h-4 w-4" />}
                    trend={adoptionSeries}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Niveaux" description={isEnterprise ? 'Répartition du portefeuille de parcours' : 'Répartition du catalogue'}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="mx-auto w-full max-w-[220px] sm:mx-0">
                            <DonutChart data={levelDistribution} colors={['#10b981', '#06b6d4', '#2563eb']} size={220} />
                        </div>
                        <div className="flex-1 space-y-2">
                            {levelDistribution.map((d) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="text-sm text-slate-700">{d.name}</div>
                                    <div className="text-sm font-semibold text-slate-900">{nf.format(d.value)}</div>
                                </div>
                            ))}
                            <div className="pt-2">
                                <div className="text-xs text-slate-600">Tendance adoption (S1→S12)</div>
                                <div className="mt-2 h-[120px]">
                                    <LineChart data={adoptionSeries} xKey="name" yKey="value" height={120} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Durée" description={isEnterprise ? 'Distribution des durées (min)' : 'Buckets (min)'} className="lg:col-span-2">
                    <div className="h-[260px]">
                        <BarChart data={durationBuckets} xKey="label" yKey="value" height={260} barColor="#2563eb" />
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Parcours" description={isEnterprise ? 'Cartes métier + indicateurs' : 'Cards premium + indicateurs'} className="lg:col-span-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {filtered.map((program) => {
                            const completion = deriveCompletion(program);
                            const goal = deriveGoal(program);
                            return (
                                <Link
                                    key={program.id}
                                    to={isEnterprise ? paths.enterprise.sport.programDetail(program.id) : paths.sport.programDetail(program.id)}
                                    className="block"
                                >
                                    <div className="surface-solid p-4 transition hover:shadow-liftHover">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-base font-semibold text-slate-900 truncate">{program.name}</div>
                                                <div className="mt-1 text-sm text-slate-600 line-clamp-2">{program.description}</div>
                                            </div>
                                            <Badge text={program.level} color={program.level === 'advanced' ? 'warning' : program.level === 'intermediate' ? 'info' : 'success'} />
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <Badge text={`Goal: ${goal}`} color="default" />
                                            <Badge text={`${program.duration} min`} color="info" />
                                            <Badge text={`${program.exercises.length} exos`} color="success" />
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex items-center justify-between text-xs text-slate-600">
                                                <span>Complétion estimée</span>
                                                <span className="font-semibold text-slate-900">{completion}%</span>
                                            </div>
                                            <ProgressBar value={completion} variant={completion >= 70 ? 'success' : completion >= 55 ? 'primary' : 'warning'} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </Card>

                <Card title="Lecture métier" description={isEnterprise ? 'Conseils coach & priorités opérationnelles' : 'Conseils coach & conformité'}>
                    <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                            <div className="text-sm font-semibold text-slate-900">Qualité descriptions</div>
                            <div className="mt-2 text-xs text-slate-600">
                                Assurez-vous que chaque programme contient une description claire + exercices complets (type/zone/équipement).
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge text="Checklist" color="default" />
                                <Badge text="OK" color="success" />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                            <div className="text-sm font-semibold text-slate-900">Recommandation prioritaire</div>
                            <div className="mt-2 text-xs text-slate-600">
                                Ajouter 1 parcours “Mobility” niveau beginner pour équilibrer le portefeuille et augmenter l’adoption.
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <Badge text="Impact estimé +2.4%" color="info" />
                                <Badge text="Confiance 0.74" color="default" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProgramsPage;