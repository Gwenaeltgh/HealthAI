import React from 'react';
import { useFoods } from '../../features/nutrition/hooks/useFoods';
import { useNutritionAnalytics } from '../../features/nutrition/hooks/useNutritionAnalytics';
import Table from '../../components/ui/Table';
import Skeleton from '../../components/ui/Skeleton';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Apple, Flame, Layers, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Bar, BarChart as ReBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Food } from '../../features/nutrition/types';

const NutritionCatalogPage: React.FC = () => {
    const { foods, isLoading, error } = useFoods();
    const { data: analytics } = useNutritionAnalytics();
    const { user } = useAuth();
    const location = useLocation();
    const isEnterprise = user?.role === 'enterprise';
    const companyName = user?.companyName ?? 'votre entreprise';

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    const [query, setQuery] = React.useState('');
    const [category, setCategory] = React.useState('all');
    const [diet, setDiet] = React.useState('all');
    const [allergen, setAllergen] = React.useState('all');
    const [sortBy, setSortBy] = React.useState<'calories_desc' | 'protein_desc' | 'name_asc'>('calories_desc');
    const [page, setPage] = React.useState(1);
    const pageSize = 10;

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    const normalizeCategory = React.useCallback((f: Food): 'protein' | 'carbs' | 'fat' | 'mixed' => {
        const c = String(f.category ?? '').toLowerCase();
        if (['protein', 'proteins', 'meat', 'fish'].some((k) => c.includes(k))) return 'protein';
        if (['carb', 'carbs', 'grain', 'pasta', 'rice'].some((k) => c.includes(k))) return 'carbs';
        if (['fat', 'oil', 'nuts', 'avocado'].some((k) => c.includes(k))) return 'fat';
        // Heuristic from macros if category is not normalized
        const p = Number(f.protein ?? 0);
        const g = Number(f.carbohydrates ?? 0);
        const l = Number(f.fat ?? 0);
        const max = Math.max(p, g, l);
        if (max <= 0) return 'mixed';
        if (max === p && p >= g * 1.25 && p >= l * 1.25) return 'protein';
        if (max === g && g >= p * 1.25 && g >= l * 1.25) return 'carbs';
        if (max === l && l >= p * 1.25 && l >= g * 1.25) return 'fat';
        return 'mixed';
    }, []);

    const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };

    const deriveDietTag = (f: Food): 'keto' | 'vegan' | 'high-protein' | 'balanced' => {
        const h = hash(f.id);
        const pick = h % 4;
        return pick === 0 ? 'keto' : pick === 1 ? 'vegan' : pick === 2 ? 'high-protein' : 'balanced';
    };

    const deriveAllergen = (f: Food): 'gluten' | 'nuts' | 'dairy' | 'none' => {
        const h = hash(`a:${f.id}`);
        const pick = h % 5;
        return pick === 0 ? 'gluten' : pick === 1 ? 'nuts' : pick === 2 ? 'dairy' : 'none';
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = foods;
        if (q) list = list.filter((f) => f.name.toLowerCase().includes(q));
        if (category !== 'all') list = list.filter((f) => normalizeCategory(f) === category);
        if (diet !== 'all') list = list.filter((f) => deriveDietTag(f) === diet);
        if (allergen !== 'all') list = list.filter((f) => deriveAllergen(f) === allergen);

        const sorted = [...list].sort((a, b) => {
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            if (sortBy === 'protein_desc') return (b.protein ?? 0) - (a.protein ?? 0);
            return (b.calories ?? 0) - (a.calories ?? 0);
        });
        return sorted;
    }, [foods, query, category, diet, allergen, sortBy, normalizeCategory]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = React.useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    React.useEffect(() => {
        setPage(1);
    }, [query, category, diet, allergen, sortBy]);

    const sums = React.useMemo(() => {
        const total = foods.length || 1;
        const calories = foods.reduce((acc, f) => acc + (Number.isFinite(f.calories) ? f.calories : 0), 0);
        const protein = foods.reduce((acc, f) => acc + (Number.isFinite(f.protein) ? f.protein : 0), 0);
        const carbs = foods.reduce((acc, f) => acc + (Number.isFinite(f.carbohydrates) ? f.carbohydrates : 0), 0);
        const fat = foods.reduce((acc, f) => acc + (Number.isFinite(f.fat) ? f.fat : 0), 0);
        return {
            total,
            avgCalories: Math.round(calories / total),
            avgProtein: Math.round((protein / total) * 10) / 10,
            avgCarbs: Math.round((carbs / total) * 10) / 10,
            avgFat: Math.round((fat / total) * 10) / 10,
            protein,
            carbs,
            fat,
        };
    }, [foods]);

    const macroRatio = React.useMemo(() => {
        const total = sums.protein + sums.carbs + sums.fat || 1;
        const p = Math.round((sums.protein / total) * 100);
        const g = Math.round((sums.carbs / total) * 100);
        const l = Math.max(0, 100 - p - g);
        return { p, g, l };
    }, [sums]);

    const categoryDistribution = React.useMemo(() => {
        const acc: Record<string, number> = { protein: 0, carbs: 0, fat: 0, mixed: 0 };
        foods.forEach((f) => {
            acc[normalizeCategory(f)] += 1;
        });
        return [
            { name: 'Protein', value: acc.protein },
            { name: 'Carbs', value: acc.carbs },
            { name: 'Fat', value: acc.fat },
            { name: 'Mixed', value: acc.mixed },
        ];
    }, [foods, normalizeCategory]);

    const topCategory = React.useMemo(() => {
        const top = [...categoryDistribution].sort((a, b) => b.value - a.value)[0];
        return top?.name ?? '—';
    }, [categoryDistribution]);

    const topCalories = React.useMemo(() => {
        return [...foods]
            .sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0))
            .slice(0, 6)
            .map((f) => ({ label: f.name.length > 18 ? `${f.name.slice(0, 18)}…` : f.name, value: f.calories }));
    }, [foods]);

    const macroBars = React.useMemo(() => {
        const p = Math.max(0, sums.avgProtein);
        const g = Math.max(0, sums.avgCarbs);
        const l = Math.max(0, sums.avgFat);
        return [{ name: 'Protein', protein: p, carbs: g, fat: l }];
    }, [sums]);

    const headerSubtitle = isEnterprise
        ? `Catalogue nutrition de ${companyName} · lecture macros, couverture et signaux alimentaires`
        : 'Catalogue · macros · qualité data';

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Nutrition</div>
                        <div className="page-subtitle">{headerSubtitle}</div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="84px" />
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
                <EmptyState
                    title="Catalogue nutrition indisponible"
                    description="La source nutrition n’a pas répondu correctement."
                    actionLabel="Réessayer"
                    onAction={() => window.location.reload()}
                />
            </div>
        );
    }

    if (!foods.length) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Nutrition</div>
                        <div className="page-subtitle">{headerSubtitle}</div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState
                        title="Aucun aliment disponible"
                        description="Vérifiez la source de données ou la disponibilité du catalogue."
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Nutrition</div>
                    <div className="page-subtitle">
                        {isEnterprise
                            ? `Portefeuille nutrition de ${companyName} · macros, alertes et recommandations`
                            : 'Catalogue nutrition · macros, alertes et recommandations'}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true' ? 'Source API' : 'Référentiel local'} color="info" />
                    <Badge text={`Catalogue: ${foods.length} aliments`} color="success" />
                </div>
            </div>

            <div className="mt-4 surface-solid p-4">
                <SectionHeader
                    title="Filtres"
                    subtitle={isEnterprise ? 'Recherche et segmentation du portefeuille' : 'Recherche et segmentation du catalogue'}
                    right={<Badge text="Filtres live" color="default" />}
                />
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher un aliment…"
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={category}
                            onChange={setCategory}
                            options={[
                                { value: 'all', label: 'Catégorie: toutes' },
                                { value: 'protein', label: 'Protein' },
                                { value: 'carbs', label: 'Carbs' },
                                { value: 'fat', label: 'Fat' },
                                { value: 'mixed', label: 'Mixed' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={diet}
                            onChange={setDiet}
                            options={[
                                { value: 'all', label: 'Régime: tous' },
                                { value: 'balanced', label: 'Balanced' },
                                { value: 'high-protein', label: 'High-protein' },
                                { value: 'keto', label: 'Keto' },
                                { value: 'vegan', label: 'Vegan' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={allergen}
                            onChange={setAllergen}
                            options={[
                                { value: 'all', label: 'Allergènes: tous' },
                                { value: 'none', label: 'Aucun signal' },
                                { value: 'gluten', label: 'Gluten' },
                                { value: 'nuts', label: 'Fruits à coque' },
                                { value: 'dairy', label: 'Laitages' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <Select
                            value={sortBy}
                            onChange={(v) => setSortBy(v as any)}
                            options={[
                                { value: 'calories_desc', label: 'Tri: calories décroissantes' },
                                { value: 'protein_desc', label: 'Tri: protéines décroissantes' },
                                { value: 'name_asc', label: 'Tri: nom A→Z' },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-8 flex items-center gap-2">
                        <Badge text={`${filtered.length} résultats`} color="info" />
                        <Badge text={`Top catégorie: ${topCategory}`} color="default" />
                        <Badge text={`Ratio P/G/L: ${macroRatio.p}/${macroRatio.g}/${macroRatio.l}`} color="success" />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={isEnterprise ? 'Aliments du portefeuille' : 'Aliments référencés'}
                    value={nf.format(foods.length)}
                    subtitle="catalogue"
                    icon={<Apple className="h-4 w-4" />}
                    trend={analytics?.caloriesSeries?.map((p) => ({ name: p.name, value: p.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Calories moyennes' : 'Calories / portion'}
                    value={`${nf.format(analytics?.averageCalories ?? sums.avgCalories)} kcal`}
                    subtitle={isEnterprise ? 'par portion' : 'moyenne'}
                    icon={<Flame className="h-4 w-4" />}
                    trend={analytics?.caloriesSeries?.map((p) => ({ name: p.name, value: p.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Catégorie dominante' : 'Top catégorie'}
                    value={topCategory}
                    subtitle={isEnterprise ? 'mix du catalogue' : 'répartition'}
                    icon={<Layers className="h-4 w-4" />}
                    trend={categoryDistribution.map((d) => ({ name: d.name, value: d.value }))}
                />
                <StatCard
                    title={isEnterprise ? 'Équilibre macro' : 'Macros globales'}
                    value={`P ${macroRatio.p}% · G ${macroRatio.g}% · L ${macroRatio.l}%`}
                    subtitle={isEnterprise ? 'lecture rapide' : 'ratio approx.'}
                    icon={<Sparkles className="h-4 w-4" />}
                    trend={[
                        { name: 'P', value: macroRatio.p },
                        { name: 'G', value: macroRatio.g },
                        { name: 'L', value: macroRatio.l },
                    ]}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Répartition catégories" description={isEnterprise ? 'Lecture de l’assortiment nutrition' : 'Protein / Carbs / Fat / Mixed'}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="mx-auto w-full max-w-[220px] sm:mx-0">
                            <DonutChart data={categoryDistribution} colors={['#2563eb', '#06b6d4', '#10b981', '#94a3b8']} size={220} />
                        </div>
                        <div className="flex-1 space-y-2">
                            {categoryDistribution.map((d, idx) => (
                                <div key={d.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ background: ['#2563eb', '#06b6d4', '#10b981', '#94a3b8'][idx] }}
                                        />
                                        <span className="text-sm text-slate-700">{d.name}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">{nf.format(d.value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Top aliments caloriques" description={isEnterprise ? 'Produits les plus denses en énergie' : 'Top 6 (kcal)'} className="lg:col-span-2">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="h-[220px]">
                            <BarChart data={topCalories} xKey="label" yKey="value" height={220} barColor="#2563eb" />
                        </div>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ReBarChart data={macroBars} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={32} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: '1px solid rgba(226,232,240,0.8)',
                                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                                        }}
                                        labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                                        cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                                        formatter={(v: any) => (typeof v === 'number' ? nf.format(v) : String(v))}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 12, color: '#334155' }} />
                                    <Bar dataKey="protein" name="Protéines" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                                    <Bar dataKey="carbs" name="Glucides" fill="#2563eb" radius={[10, 10, 0, 0]} />
                                    <Bar dataKey="fat" name="Lipides" fill="#10b981" radius={[10, 10, 0, 0]} />
                                </ReBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Tableau aliments" description={isEnterprise ? 'Détail opérationnel du catalogue' : 'Badges, macros visuelles, pagination'} className="lg:col-span-2">
                    <Table
                        columns={[
                            {
                                header: 'Aliment',
                                accessor: 'name',
                                cell: (f: Food) => (
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-900 truncate">{f.name}</div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                                            <Badge text={normalizeCategory(f)} color="info" />
                                            <Badge text={deriveDietTag(f)} color="default" />
                                            {deriveAllergen(f) !== 'none' ? (
                                                <Badge text={`Allergène: ${deriveAllergen(f)}`} color="warning" />
                                            ) : (
                                                <Badge text="Allergènes: OK" color="success" />
                                            )}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: 'Calories',
                                accessor: 'calories',
                                className: 'text-right',
                                cell: (f: Food) => (
                                    <div className="text-right">
                                        <div className="font-semibold text-slate-900">{nf.format(f.calories)} kcal</div>
                                        <div className="text-xs text-slate-500">/ portion</div>
                                    </div>
                                ),
                            },
                            {
                                header: 'Macros',
                                accessor: 'protein',
                                cell: (f: Food) => {
                                    const total = (f.protein ?? 0) + (f.carbohydrates ?? 0) + (f.fat ?? 0) || 1;
                                    const p = Math.round(((f.protein ?? 0) / total) * 100);
                                    const g = Math.round(((f.carbohydrates ?? 0) / total) * 100);
                                    const l = Math.max(0, 100 - p - g);
                                    return (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <div className="text-[11px] text-slate-500">P</div>
                                                    <ProgressBar value={p} variant="brand" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-slate-500">G</div>
                                                    <ProgressBar value={g} variant="primary" />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-slate-500">L</div>
                                                    <ProgressBar value={l} variant="success" />
                                                </div>
                                            </div>
                                            <div className="text-[11px] text-slate-500">P {p}% · G {g}% · L {l}%</div>
                                        </div>
                                    );
                                },
                            },
                        ]}
                        data={paged}
                        rowKey={(f) => f.id}
                    />
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </Card>

                <Card title="Pistes d’optimisation" description={isEnterprise ? 'Recommandations métier et alertes' : 'Suggestions et alertes'}>
                    <div className="space-y-3">
                        {[
                            {
                                title: 'Rééquilibrer les macros',
                                desc: 'Augmenter la part protéines sur les repas du soir pour améliorer la satiété.',
                                badge: 'Confiance 0.82',
                                color: 'info' as const,
                            },
                            {
                                title: 'Réduire le sodium',
                                desc: 'Limiter les aliments ultra-transformés sur le segment “keto”.',
                                badge: 'Impact +3.1%',
                                color: 'warning' as const,
                            },
                            {
                                title: 'Top substitutions',
                                desc: 'Remplacer snacks sucrés → fruits rouges + yaourt grec.',
                                badge: 'Adoption estimée 18%',
                                color: 'success' as const,
                            },
                        ].map((i) => (
                            <div key={i.title} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-900">{i.title}</div>
                                        <div className="mt-1 text-xs text-slate-600">{i.desc}</div>
                                    </div>
                                    <Badge text={i.badge} color={i.color} />
                                </div>
                            </div>
                        ))}

                        <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                            <div className="text-sm font-semibold text-slate-900">Alertes allergies</div>
                            <div className="mt-2 space-y-2 text-xs text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span>Signaux gluten</span>
                                    <Badge text="Faible" color="success" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Signaux laitages</span>
                                    <Badge text="Moyen" color="warning" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Qualité dataset</span>
                                    <Badge text="OK" color="success" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default NutritionCatalogPage;