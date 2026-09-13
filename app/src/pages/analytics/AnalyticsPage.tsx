import React from 'react';
import { useAnalytics } from '../../features/analytics/hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Activity, ArrowUpRight, Gauge, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

const AnalyticsPage: React.FC = () => {
    const { data, isLoading, error } = useAnalytics();
    const { user } = useAuth();
    const isEnterprise = user?.role === 'enterprise';
    const companyName = user?.companyName ?? 'votre entreprise';

    const engagementSeries = React.useMemo(() => {
        if (!data) return [];
        if (data.userEngagement?.length) {
            return data.userEngagement.map((p) => ({
                label: p.date,
                nutrition: p.nutritionEngagement,
                sport: p.sportEngagement,
                total: p.nutritionEngagement + p.sportEngagement,
            }));
        }
        return [];
    }, [data]);

    const subs = React.useMemo(() => {
        if (!data) return [];
        const dist = data.subscriptionDistribution ?? [];
        return dist.map((d) => ({ name: String(d.subscriptionType), value: d.count }));
    }, [data]);

    const subsColors = ['#93c5fd', '#2563eb', '#06b6d4'];

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    const kpis = React.useMemo(() => {
        if (!data) return [];
        return [
            {
                label: 'Utilisateurs actifs',
                value: data.kpi.activeUsers,
                icon: <Users className="h-4 w-4" />,
                badge: null,
            },
            {
                label: 'Conversion premium',
                value: `${Math.round(data.kpi.premiumConversionRate * 100)}%`,
                icon: <Sparkles className="h-4 w-4" />,
                badge: null,
            },
            {
                label: 'Rétention',
                value: `${Math.round(data.kpi.retentionRate * 100)}%`,
                icon: <Gauge className="h-4 w-4" />,
                badge: null,
            },
            {
                label: 'Sessions moyennes',
                value: data.kpi.averageSessions,
                icon: <Activity className="h-4 w-4" />,
                badge: null,
            },
        ];
    }, [data]);

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">Analytics</div>
                        <div className="page-subtitle">
                            {isEnterprise ? `Conversion, rétention et engagement de ${companyName}` : 'Conversion, rétention, engagement'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4">
                    <Skeleton height="96px" />
                    <Skeleton height="280px" />
                    <Skeleton height="260px" />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Erreur lors du chargement des données.</div>;
    }

    if (!data) {
        return <div>Aucune donnée analytics.</div>;
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Analytics</div>
                    <div className="page-subtitle">
                        {isEnterprise
                            ? `Conversion · rétention · engagement · performance IA de ${companyName}`
                            : 'Conversion · rétention · engagement · performance IA'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge text="Insights" color="info" />
                    <Badge text="Lecture consolidée" color="default" />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                {kpis.map((k) => (
                    <div key={k.label} className="surface-solid p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-700">
                                    {k.icon}
                                </div>
                                <div>
                                    <div className="text-xs font-semibold text-slate-700">{k.label}</div>
                                    <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{k.value}</div>
                                </div>
                            </div>
                            {k.badge}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card
                    title="Engagement global"
                    description={isEnterprise ? 'Nutrition + Sport du périmètre entreprise' : 'Nutrition + Sport'}
                    className="lg:col-span-2"
                    action={
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                            <ArrowUpRight className="h-4 w-4 text-success-600" /> tendance
                        </div>
                    }
                >
                    <div className="h-[280px]">
                        {!engagementSeries.length ? (
                            <div className="grid h-full place-items-center text-sm text-slate-600">
                                Pas de données d’engagement.
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={engagementSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={32} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid rgba(226,232,240,0.8)',
                                        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                                    }}
                                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                                    cursor={{ stroke: '#e2e8f0', strokeDasharray: '4 4' }}
                                    formatter={(v: any) => (typeof v === 'number' ? nf.format(v) : String(v))}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, color: '#334155' }} />
                                <Area type="monotone" dataKey="nutrition" name="Nutrition" stroke="#06b6d4" fill="#cffafe" strokeWidth={2} />
                                <Area type="monotone" dataKey="sport" name="Sport" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card title="Abonnements" description={isEnterprise ? 'Mix de parcours du compte' : 'Distribution free/premium/premium+'}>
                    <div className="flex items-center gap-4">
                        <div className="mx-auto h-[200px] w-full max-w-[220px] sm:mx-0 sm:h-[220px] sm:w-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={subs} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>
                                        {subs.map((_, idx) => (
                                            <Cell key={idx} fill={subsColors[idx % subsColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: '1px solid rgba(226,232,240,0.8)',
                                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
                                        }}
                                        formatter={(v: any) => (typeof v === 'number' ? nf.format(v) : String(v))}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-2">
                            {subs.map((s, idx) => (
                                <div key={s.name} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: subsColors[idx % subsColors.length] }} />
                                        <span className="text-sm text-slate-700">{s.name}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-900">{s.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Nutrition vs Sport" description={isEnterprise ? 'Comparatif d’usage consolidé' : 'Comparatif (bar)'}>
                    <div className="h-[240px]">
                        {!engagementSeries.length ? (
                            <div className="grid h-full place-items-center text-sm text-slate-600">
                                Pas de données d’engagement.
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagementSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
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
                                <Bar dataKey="nutrition" name="Nutrition" fill="#06b6d4" radius={[10, 10, 0, 0]} />
                                <Bar dataKey="sport" name="Sport" fill="#10b981" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card title="Conversion funnel" description={isEnterprise ? 'Lecture du parcours de conversion' : 'Aperçu freemium → premium'}>
                    <div className="space-y-3">
                        {(() => {
                            const steps = [
                                { label: 'Inscrits', value: data.kpi.newSignUps, color: 'bg-primary-200' },
                                { label: 'Actifs', value: data.kpi.activeUsers, color: 'bg-primary-400' },
                                { label: 'Premium', value: Math.max(0, Math.round(data.kpi.activeUsers * data.kpi.premiumConversionRate)), color: 'bg-brand-400' },
                            ];
                            const maxValue = Math.max(1, ...steps.map((s) => s.value));
                            return steps.map((s) => (
                            <div key={s.label}>
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                    <span>{s.label}</span>
                                    <span className="font-semibold text-slate-900">{s.value}</span>
                                </div>
                                <div className="mt-1 h-2 rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
                                    <div
                                        className={`h-full ${s.color}`}
                                        style={{ width: `${Math.min(100, (s.value / maxValue) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            ));
                        })()}
                    </div>
                </Card>

                <Card title="Cohortes (rétention)" description="Lecture visuelle des cohortes">
                    <div className="grid h-[120px] place-items-center text-sm text-slate-600">
                        Données cohortes non disponibles.
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card title="Performance recommandations IA" description="Latence, confiance, adoption">
                    <div className="grid h-[120px] place-items-center text-sm text-slate-600">
                        Indicateurs IA non disponibles.
                    </div>
                </Card>

                <Card title="Top segments" description={isEnterprise ? 'Segments les plus actifs du compte' : 'Segments les plus actifs'}>
                    <div className="space-y-2">
                        {(data.topSegments.length ? data.topSegments : []).map((s) => (
                            <div key={s} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2">
                                <div className="text-sm text-slate-800">{s}</div>
                                <Badge text="Actif" color="info" />
                            </div>
                        ))}
                        {!data.topSegments.length ? (
                            <div className="text-sm text-slate-600">Aucun segment.</div>
                        ) : null}
                    </div>
                </Card>

                <Card title="Alertes" description={isEnterprise ? 'Qualité data & anomalies du périmètre' : 'Qualité data & anomalies'}>
                    {data.alerts.length ? (
                        <ul className="space-y-2">
                            {data.alerts.map((a) => (
                                <li key={a} className="flex items-start gap-2 text-sm text-slate-800">
                                    <span className="mt-0.5 h-2 w-2 rounded-full bg-warning-400" />
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-sm text-slate-600">Aucune alerte.</div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;