import React from 'react';
import { useExercises } from '../../features/sport/hooks/useExercises';
import Table from '../../components/ui/Table';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import Card from '../../components/ui/Card';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Dumbbell, Hand, Layers, Target } from 'lucide-react';
import type { Exercise } from '../../features/sport/types';
import { useLocation } from 'react-router-dom';

const ExercisesPage = () => {
    const { exercises, isLoading, error } = useExercises();
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';
    const companyName = user?.companyName ?? 'votre entreprise';
    const location = useLocation();

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);
    const [query, setQuery] = React.useState('');
    const [type, setType] = React.useState('all');
    const [bodyPart, setBodyPart] = React.useState('all');
    const [equipment, setEquipment] = React.useState('all');
    const [sortBy, setSortBy] = React.useState<'name_asc' | 'type_asc'>('name_asc');

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    const distinct = React.useMemo(() => {
        const types = new Set<string>();
        const bodyParts = new Set<string>();
        const equipments = new Set<string>();
        exercises.forEach((e) => {
            if (e.exerciseType) types.add(e.exerciseType);
            if (e.bodyPart) bodyParts.add(e.bodyPart);
            if (e.equipment) equipments.add(e.equipment);
        });
        return {
            types: Array.from(types).sort(),
            bodyParts: Array.from(bodyParts).sort(),
            equipments: Array.from(equipments).sort(),
        };
    }, [exercises]);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = exercises;
        if (q) list = list.filter((e) => e.name.toLowerCase().includes(q));
        if (type !== 'all') list = list.filter((e) => (e.exerciseType ?? '—') === type);
        if (bodyPart !== 'all') list = list.filter((e) => (e.bodyPart ?? '—') === bodyPart);
        if (equipment !== 'all') list = list.filter((e) => (e.equipment ?? '—') === equipment);
        const sorted = [...list].sort((a, b) => {
            if (sortBy === 'type_asc') return String(a.exerciseType ?? '').localeCompare(String(b.exerciseType ?? ''));
            return a.name.localeCompare(b.name);
        });
        return sorted;
    }, [exercises, query, type, bodyPart, equipment, sortBy]);

    const distributions = React.useMemo(() => {
        const typeCount: Record<string, number> = {};
        const bodyCount: Record<string, number> = {};
        const eqCount: Record<string, number> = {};
        exercises.forEach((e) => {
            const t = e.exerciseType ?? 'Other';
            const b = e.bodyPart ?? 'Other';
            const q = e.equipment ?? 'No equipment';
            typeCount[t] = (typeCount[t] ?? 0) + 1;
            bodyCount[b] = (bodyCount[b] ?? 0) + 1;
            eqCount[q] = (eqCount[q] ?? 0) + 1;
        });

        const topN = (obj: Record<string, number>, n: number) =>
            Object.entries(obj)
                .map(([k, v]) => ({ label: k, value: v }))
                .sort((a, b) => b.value - a.value)
                .slice(0, n);

        const donut = topN(typeCount, 5).map((d) => ({ name: d.label, value: d.value }));
        return {
            donut,
            bodyBars: topN(bodyCount, 8),
            equipBars: topN(eqCount, 8),
        };
    }, [exercises]);

    const coverage = React.useMemo(() => {
        const withType = exercises.filter((e) => !!e.exerciseType).length;
        const withBody = exercises.filter((e) => !!e.bodyPart).length;
        const withEquip = exercises.filter((e) => !!e.equipment).length;
        const total = exercises.length || 1;
        return {
            withTypePct: Math.round((withType / total) * 100),
            withBodyPct: Math.round((withBody / total) * 100),
            withEquipPct: Math.round((withEquip / total) * 100),
        };
    }, [exercises]);

    const columns = [
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
        {
            header: 'Type',
            accessor: 'exerciseType',
            cell: (e: Exercise) => <span className="text-slate-700">{e.exerciseType ?? '—'}</span>,
        },
        {
            header: 'Zone',
            accessor: 'bodyPart',
            cell: (e: Exercise) => <span className="text-slate-700">{e.bodyPart ?? '—'}</span>,
        },
        {
            header: 'Équipement',
            accessor: 'equipment',
            cell: (e: Exercise) => <span className="text-slate-700">{e.equipment ?? '—'}</span>,
        },
    ];

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Bibliothèque d’exercices de ${companyName} · distribution et qualité` : 'Exercices · distribution · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="90px" />
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
                        <div className="page-subtitle">
                            {isEnterprise ? `Bibliothèque d’exercices de ${companyName} · distribution et qualité` : 'Exercices · distribution · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-red-500">Erreur de chargement des exercices.</div>
            </div>
        );
    }

    if (!exercises.length) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Sport</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Bibliothèque d’exercices de ${companyName} · distribution et qualité` : 'Exercices · distribution · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState title="Aucun exercice" description="Vérifiez la source de données ou le référentiel d’exercices." />
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
                            ? `Référentiel sport de ${companyName} · typologies, équipements et couverture`
                            : 'Exercices · typologies · équipements'}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true' ? 'Source API' : 'Référentiel local'} color="info" />
                    <Badge text={`Exercices: ${exercises.length}`} color="success" />
                </div>
            </div>

            <div className="mt-4 surface-solid p-4">
                <SectionHeader title="Filtres" subtitle={isEnterprise ? 'Recherche + facettes du référentiel' : 'Recherche + facettes'} right={<Badge text="Référentiel" color="default" />} />
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un exercice…" />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={type}
                            onChange={setType}
                            options={[{ value: 'all', label: 'Type: tous' }, ...distinct.types.map((t) => ({ value: t, label: t }))]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={bodyPart}
                            onChange={setBodyPart}
                            options={[{ value: 'all', label: 'Zone: toutes' }, ...distinct.bodyParts.map((b) => ({ value: b, label: b }))]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={equipment}
                            onChange={setEquipment}
                            options={[{ value: 'all', label: 'Équipement: tous' }, ...distinct.equipments.map((q) => ({ value: q, label: q }))]}
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <Select
                            value={sortBy}
                            onChange={(v) => setSortBy(v as any)}
                            options={[
                                { value: 'name_asc', label: 'Tri: nom A→Z' },
                                { value: 'type_asc', label: 'Tri: type A→Z' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-9 flex flex-wrap items-center gap-2">
                        <Badge text={`${filtered.length} résultats`} color="info" />
                        <Badge text={`Couverture type: ${coverage.withTypePct}%`} color="default" />
                        <Badge text={`Couverture zone: ${coverage.withBodyPct}%`} color="default" />
                        <Badge text={`Couverture équipement: ${coverage.withEquipPct}%`} color="default" />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={isEnterprise ? 'Exercices référencés' : 'Exercices'}
                    value={nf.format(exercises.length)}
                    subtitle={isEnterprise ? 'catalogue' : 'library'}
                    icon={<Dumbbell className="h-4 w-4" />}
                    trend={distributions.bodyBars.map((d) => ({ name: d.label, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Typologies' : 'Types distincts'}
                    value={nf.format(distinct.types.length)}
                    subtitle={isEnterprise ? 'variété utile' : 'variété'}
                    icon={<Layers className="h-4 w-4" />}
                    trend={distributions.donut.map((d) => ({ name: d.name, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Zones couvertes' : 'Zones couvertes'}
                    value={nf.format(distinct.bodyParts.length)}
                    subtitle={isEnterprise ? 'groupes musculaires' : 'body parts'}
                    icon={<Target className="h-4 w-4" />}
                    trend={distributions.bodyBars.map((d) => ({ name: d.label, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Équipements' : 'Équipements'}
                    value={nf.format(distinct.equipments.length)}
                    subtitle={isEnterprise ? 'matériel disponible' : 'matériel'}
                    icon={<Hand className="h-4 w-4" />}
                    trend={distributions.equipBars.map((d) => ({ name: d.label, value: d.value }))}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Répartition types" description={isEnterprise ? 'Top 5 des typologies utiles au compte' : 'Top 5'}>
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
                </Card>

                <Card title="Zones" description={isEnterprise ? 'Top 8 des zones couvertes' : 'Top 8'} className="lg:col-span-2">
                    <div className="h-[260px]">
                        <BarChart data={distributions.bodyBars} xKey="label" yKey="value" height={260} barColor="#2563eb" />
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Tableau exercices" description={isEnterprise ? 'Détail opérationnel du référentiel' : 'Badges + données'} className="lg:col-span-2">
                    <Table columns={columns} data={filtered} rowKey={(e) => e.id} />
                </Card>

                <Card title="Équipement" description={isEnterprise ? 'Top 8 des équipements présents' : 'Top 8'}>
                    <div className="h-[220px]">
                        <BarChart data={distributions.equipBars} xKey="label" yKey="value" height={220} barColor="#06b6d4" />
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                        <div className="text-sm font-semibold text-slate-900">Action rapide</div>
                        <div className="mt-1 text-xs text-slate-600">
                            Standardiser les valeurs “equipment” (ex: &quot;bodyweight&quot; vs &quot;none&quot;) pour améliorer les filtres et la recherche.
                        </div>
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>Normalisation</span>
                                <span className="font-semibold text-slate-900">{Math.min(100, coverage.withEquipPct + 8)}%</span>
                            </div>
                            <div className="mt-2">
                                <ProgressBar value={Math.min(100, coverage.withEquipPct + 8)} variant="primary" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ExercisesPage;