import React from 'react';
import apiClient from '../../api/client';
import { useDashboard } from '../../features/dashboard/hooks/useDashboard';
import { useAuth } from '../../features/auth/hooks/useAuth';
import KpiGrid from '../../features/dashboard/components/KpiGrid';
import FiltersBar from '../../features/dashboard/components/FiltersBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';
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
import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { data, isLoading, error, refetch, isFetching } = useDashboard();
    const { user } = useAuth();
    const { t } = useAppPreferences();
    const isEnterprise = user?.role === 'enterprise';
    const companyName = user?.companyName ?? 'votre entreprise';

    const [period, setPeriod] = React.useState<'7d' | '30d' | '90d' | '12m'>('30d');
    const [apiHealth, setApiHealth] = React.useState<'checking' | 'ok' | 'error'>('checking');
    const [healthCheckedAt, setHealthCheckedAt] = React.useState<string | null>(null);

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    React.useEffect(() => {
        let active = true;

        apiClient
            .get<{ ok: boolean }>('/health')
            .then((result) => {
                if (!active) return;
                setApiHealth(result?.ok ? 'ok' : 'error');
                setHealthCheckedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            })
            .catch(() => {
                if (!active) return;
                setApiHealth('error');
                setHealthCheckedAt(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            });

        return () => {
            active = false;
        };
    }, []);

    const series = React.useMemo(() => {
        if (!data) return [];

        const points = period === '7d' ? 7 : period === '30d' ? 14 : period === '90d' ? 18 : 24;
        const totalDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;

        const now = Date.now();
        const start = now - totalDays * 86_400_000;
        const bucketMs = Math.max(1, Math.floor((now - start) / points));

        const events = (data.activityEvents ?? []).map((e) => {
            const ts = new Date(e.timestamp).getTime();
            return { ...e, ts };
        }).filter((e) => Number.isFinite(e.ts) && e.ts >= start && e.ts <= now);

        return Array.from({ length: points }).map((_, idx) => {
            const bucketStart = start + idx * bucketMs;
            const bucketEnd = idx === points - 1 ? now : bucketStart + bucketMs;
            const label = new Date(bucketStart).toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });

            const bucket = events.filter((e) => e.ts >= bucketStart && e.ts < bucketEnd);
            const activeUsers = new Set(bucket.map((e) => String(e.userId))).size;
            const nutrition = bucket.filter((e) => String(e.activityType).startsWith('meal:')).length;
            const sport = bucket.filter((e) => String(e.activityType).startsWith('exercise:')).length;

            return { label, activeUsers, nutrition, sport };
        });
    }, [data, period]);

    const subs = React.useMemo(() => {
        const total = data?.kpis.activeUsers ?? 0;
        const premiumRate = data?.kpis.premiumConversionRate ?? 0;
        const premium = Math.max(0, Math.round(total * premiumRate));
        const premiumPlus = 0;
        const free = Math.max(0, total - premium - premiumPlus);
        return [
            { name: 'Free', value: free },
            { name: 'Premium', value: premium },
            { name: 'Premium+', value: premiumPlus },
        ];
    }, [data?.kpis.activeUsers, data?.kpis.premiumConversionRate]);

    const subsColors = ['#93c5fd', '#2563eb', '#06b6d4'];

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('dashboard.title')}</div>
                        <div className="page-subtitle">{t('dashboard.subtitleAdmin')}</div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4">
                    <Skeleton height="80px" />
                    <Skeleton height="220px" />
                    <Skeleton height="220px" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <EmptyState
                    title={t('dashboard.unavailableTitle')}
                    description={t('dashboard.unavailableDescription')}
                    actionLabel={t('common.retry')}
                    onAction={() => refetch()}
                />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="page">
                <EmptyState
                    title={t('dashboard.noDataTitle')}
                    description={t('dashboard.noDataDescription')}
                    actionLabel={t('common.refresh')}
                    onAction={() => refetch()}
                />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">{t('dashboard.title')}</div>
                    <div className="page-subtitle">
                        {isEnterprise
                            ? t('dashboard.subtitleEnterprise', { companyName })
                            : t('dashboard.subtitleAdmin')}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge text={String(import.meta.env.VITE_USE_REAL_API).toLowerCase() === 'true' ? t('dashboard.sourceApi') : t('dashboard.sourceLocal')} color="info" />
                    <Badge text={isEnterprise ? t('dashboard.isolatedScope') : t('dashboard.sla')} color="success" />
                </div>
            </div>

            <div className="mt-4">
                <FiltersBar period={period} onPeriodChange={setPeriod} onRefresh={() => refetch()} isRefreshing={isFetching} />
            </div>

            <div className="mt-4">
                <KpiGrid kpis={data.kpis} variant={isEnterprise ? 'enterprise' : 'admin'} />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card
                    title={isEnterprise ? t('dashboard.usersEvolutionEnterprise') : t('dashboard.usersEvolutionAdmin')}
                    description={isEnterprise ? t('dashboard.usersEvolutionEnterpriseDescription') : t('dashboard.usersEvolutionAdminDescription')}
                    className="lg:col-span-2"
                    action={<Badge text={isEnterprise ? t('users.portfolioActive') : 'Live'} color="success" />}
                >
                    <div className="h-[280px]">
                        {!series.length ? (
                            <div className="grid h-full place-items-center text-sm text-slate-600">
                                {t('dashboard.noSeries')}
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="activeUsersFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.8} />
                                        <stop offset="70%" stopColor="#93c5fd" stopOpacity={0.12} />
                                        <stop offset="100%" stopColor="#93c5fd" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
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
                                <Area type="monotone" dataKey="activeUsers" stroke="#2563eb" fill="url(#activeUsersFill)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card title={isEnterprise ? t('dashboard.subscriptionsEnterprise') : t('dashboard.subscriptionsAdmin')} description={isEnterprise ? t('dashboard.subscriptionsEnterpriseDescription') : t('dashboard.subscriptionsAdminDescription')}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                <Card
                    title={isEnterprise ? t('dashboard.engagementEnterprise') : t('dashboard.engagementAdmin')}
                    description={isEnterprise ? t('dashboard.engagementEnterpriseDescription') : t('dashboard.engagementAdminDescription')}
                    className="lg:col-span-2"
                >
                    <div className="h-[260px]">
                        {!series.length ? (
                            <div className="grid h-full place-items-center text-sm text-slate-600">
                                {t('dashboard.noSeries')}
                            </div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={series} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
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

                <Card title={t('dashboard.modelHealthTitle')} description={isEnterprise ? t('dashboard.modelHealthEnterpriseDescription') : t('dashboard.modelHealthAdminDescription')} action={<Sparkles className="h-4 w-4 text-primary-700" />}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-700">{t('dashboard.recommendationQuality')}</div>
                            <Badge text={t('dashboard.good')} color="success" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-700">{t('dashboard.driftDetected')}</div>
                            <Badge text={t('dashboard.low')} color="info" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-700">{t('dashboard.guardrails')}</div>
                            <Badge text={t('dashboard.active')} color="success" />
                        </div>
                        <div className="mt-2 rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
                            {t('dashboard.modelHealthHint')}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card
                    title={t('dashboard.alertsTitle')}
                    description={isEnterprise ? t('dashboard.alertsEnterpriseDescription') : t('dashboard.alertsAdminDescription')}
                    className="lg:col-span-2"
                    action={<ShieldAlert className="h-4 w-4 text-warning-700" />}
                >
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
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-success-600" />
                            {t('dashboard.noCriticalSignal')}
                        </div>
                    )}
                </Card>

                <Card title={t('dashboard.systemTitle')} description={isEnterprise ? t('dashboard.systemEnterpriseDescription') : t('dashboard.systemAdminDescription')}>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">API</span>
                            <Badge
                                text={apiHealth === 'checking' ? t('dashboard.checking') : apiHealth === 'ok' ? t('dashboard.ok') : t('dashboard.incident')}
                                color={apiHealth === 'ok' ? 'success' : apiHealth === 'checking' ? 'info' : 'warning'}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">DB</span>
                            <Badge text={data ? t('dashboard.ok') : 'N/A'} color={data ? 'success' : 'default'} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{t('dashboard.sync')}</span>
                            <Badge text={data.generatedNutritionPlans || data.generatedWorkoutPrograms ? t('dashboard.active') : t('dashboard.emptyQueue')} color="info" />
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 text-xs text-slate-600">
                            {t('dashboard.healthcheck')} {healthCheckedAt ? `• ${t('dashboard.checkedAt')} ${healthCheckedAt}` : `• ${t('dashboard.awaitingCheck')}`}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;