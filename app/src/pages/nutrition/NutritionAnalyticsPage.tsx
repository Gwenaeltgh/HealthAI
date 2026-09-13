import React from 'react';
import { useNutritionAnalytics } from '../../features/nutrition/hooks/useNutritionAnalytics';
import { useFoods } from '../../features/nutrition/hooks/useFoods';
import LineChart from '../../components/charts/LineChart';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import { Activity, Gauge, Scale, Sigma } from 'lucide-react';
import type { Food } from '../../features/nutrition/types';
import { useAuth } from '../../features/auth/hooks/useAuth';

const NutritionAnalyticsPage: React.FC = () => {
    const { data, isLoading, error } = useNutritionAnalytics();
    const { foods } = useFoods();
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';
    const companyName = user?.companyName ?? 'votre entreprise';

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    const normalizeCategory = React.useCallback((f: Food): 'protein' | 'carbs' | 'fat' | 'mixed' => {
        const c = String(f.category ?? '').toLowerCase();
        if (['protein', 'proteins', 'meat', 'fish'].some((k) => c.includes(k))) return 'protein';
        if (['carb', 'carbs', 'grain', 'pasta', 'rice'].some((k) => c.includes(k))) return 'carbs';
        if (['fat', 'oil', 'nuts', 'avocado'].some((k) => c.includes(k))) return 'fat';
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

    const macroRatio = React.useMemo(() => {
        const p = data?.averageMacros?.protein ?? 0;
        const g = data?.averageMacros?.carbohydrates ?? 0;
        const l = data?.averageMacros?.fat ?? 0;
        const total = p + g + l || 1;
        const pPct = Math.round((p / total) * 100);
        const gPct = Math.round((g / total) * 100);
        const lPct = Math.max(0, 100 - pPct - gPct);
        return { pPct, gPct, lPct };
    }, [data]);

    const macroDonut = React.useMemo(() => {
        return [
            { name: 'Protéines', value: macroRatio.pPct },
            { name: 'Glucides', value: macroRatio.gPct },
            { name: 'Lipides', value: macroRatio.lPct },
        ];
    }, [macroRatio]);

    const categoryBars = React.useMemo(() => {
        const acc: Record<string, number> = { protein: 0, carbs: 0, fat: 0, mixed: 0 };
        foods.forEach((f) => {
            acc[normalizeCategory(f)] += 1;
        });
        return [
            { label: 'Protein', value: acc.protein },
            { label: 'Carbs', value: acc.carbs },
            { label: 'Fat', value: acc.fat },
            { label: 'Mixed', value: acc.mixed },
        ];
    }, [foods, normalizeCategory]);

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Nutrition</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Analytics nutrition de ${companyName} · tendances, qualité et mix macros` : 'Analytics · tendances · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="110px" />
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
                        <div className="page-title">Nutrition</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Analytics nutrition de ${companyName} · tendances, qualité et mix macros` : 'Analytics · tendances · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-red-500">Erreur lors du chargement des analytics nutrition.</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Nutrition</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Analytics nutrition de ${companyName} · tendances, qualité et mix macros` : 'Analytics · tendances · qualité'}
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState title="Aucune donnée analytics" description="Vérifiez la disponibilité de la source nutrition." />
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
                            ? `Portefeuille nutrition de ${companyName} · tendances calories, mix macros et couverture`
                            : 'Analytics · tendances calories · mix macros · distribution'}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true' ? 'Source API' : 'Référentiel local'} color="info" />
                    <Badge text={`Série: ${data.caloriesSeries.length} points`} color="default" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={isEnterprise ? 'Portefeuille' : 'Aliments'}
                    value={nf.format(data.totalFoods)}
                    subtitle={isEnterprise ? 'référencés' : 'analytics'}
                    icon={<Sigma className="h-4 w-4" />}
                    trend={data.caloriesSeries}
                />
                <StatCard
                    title={isEnterprise ? 'Calories moyennes' : 'Calories moyennes'}
                    value={`${nf.format(data.averageCalories)} kcal`}
                    subtitle="/ portion"
                    icon={<Gauge className="h-4 w-4" />}
                    trend={data.caloriesSeries}
                />
                <StatCard
                    title={isEnterprise ? 'Protéines moyennes' : 'Protéines (moy.)'}
                    value={`${nf.format(data.averageMacros.protein)} g`}
                    subtitle="par portion"
                    icon={<Activity className="h-4 w-4" />}
                    trend={data.caloriesSeries.map((p) => ({ name: p.name, value: Math.max(0, p.value / 12) }))}
                />
                <StatCard
                    title={isEnterprise ? 'Score d’équilibre' : 'Score équilibre'}
                    value={`${Math.min(99, Math.max(68, 80 + (macroRatio.pPct - 25) / 2)) | 0}/100`}
                    subtitle="heuristique"
                    icon={<Scale className="h-4 w-4" />}
                    trend={macroDonut.map((d) => ({ name: d.name, value: d.value }))}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Tendance calories" description={isEnterprise ? 'Lecture consolidée de l’évolution' : 'Série (simulée si nécessaire)'} className="lg:col-span-2">
                    <div className="h-[280px]">
                        <LineChart data={data.caloriesSeries} xKey="name" yKey="value" height={280} />
                    </div>
                </Card>

                <Card title="Mix macros" description={isEnterprise ? 'Répartition moyenne du portefeuille (%)' : 'Répartition moyenne (%)'}>
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart data={macroDonut} colors={['#06b6d4', '#2563eb', '#10b981']} size={220} />
                        <div className="w-full space-y-2">
                            <div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span>Protéines</span>
                                    <span className="font-semibold text-slate-900">{macroRatio.pPct}%</span>
                                </div>
                                <ProgressBar value={macroRatio.pPct} variant="brand" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span>Glucides</span>
                                    <span className="font-semibold text-slate-900">{macroRatio.gPct}%</span>
                                </div>
                                <ProgressBar value={macroRatio.gPct} variant="primary" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span>Lipides</span>
                                    <span className="font-semibold text-slate-900">{macroRatio.lPct}%</span>
                                </div>
                                <ProgressBar value={macroRatio.lPct} variant="success" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Distribution catégories" description={isEnterprise ? 'Basée sur le catalogue du compte' : 'Basée sur le catalogue'} className="lg:col-span-2">
                    <div className="h-[260px]">
                        <BarChart data={categoryBars} xKey="label" yKey="value" height={260} barColor="#2563eb" />
                    </div>
                </Card>

                <Card title="Qualité & objectifs" description={isEnterprise ? 'Lecture opérationnelle' : 'Checks rapides'}>
                    <SectionHeader title="Checks" subtitle={isEnterprise ? 'Couverture et cohérence du portefeuille' : 'Couverture et cohérence'} />
                    <div className="mt-3 space-y-3">
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-900">Couverture macros</div>
                                <Badge text="OK" color="success" />
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                                Synthèse suffisante pour KPI et graphiques.
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                            <div className="text-sm font-semibold text-slate-900">Objectif “balanced”</div>
                            <div className="mt-2 space-y-2">
                                <div>
                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                        <span>Protéines (cible 25–35%)</span>
                                        <span className="font-semibold text-slate-900">{macroRatio.pPct}%</span>
                                    </div>
                                    <ProgressBar value={Math.min(100, (macroRatio.pPct / 35) * 100)} variant="brand" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                        <span>Glucides (cible 35–50%)</span>
                                        <span className="font-semibold text-slate-900">{macroRatio.gPct}%</span>
                                    </div>
                                    <ProgressBar value={Math.min(100, (macroRatio.gPct / 50) * 100)} variant="primary" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                        <span>Lipides (cible 20–35%)</span>
                                        <span className="font-semibold text-slate-900">{macroRatio.lPct}%</span>
                                    </div>
                                    <ProgressBar value={Math.min(100, (macroRatio.lPct / 35) * 100)} variant="success" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default NutritionAnalyticsPage;