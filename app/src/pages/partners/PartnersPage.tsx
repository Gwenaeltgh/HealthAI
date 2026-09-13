import React from 'react';
import { usePartners } from '../../features/partners/hooks/usePartners';
import Table from '../../components/ui/Table';
import { Link, useLocation } from 'react-router-dom';
import { paths } from '../../routes/paths';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import SectionHeader from '../../components/ui/SectionHeader';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import { Building2, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { Partner } from '../../features/partners/types';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

const PartnersPage = () => {
    const { partners, isLoading, error } = usePartners();
    const location = useLocation();
    const { t } = useAppPreferences();

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);
    const [query, setQuery] = React.useState('');
    const [status, setStatus] = React.useState<'all' | Partner['status']>('all');
    const [contract, setContract] = React.useState<'all' | string>('all');
    const [sortBy, setSortBy] = React.useState<'users_desc' | 'name_asc'>('users_desc');

    const formatStatus = (value: Partner['status']) => (value === 'active' ? t('partners.active') : t('partners.inactive'));

    const formatContract = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'annual' || normalized === 'annuel' || normalized === 'yearly') return t('partners.annual');
        if (normalized === 'monthly' || normalized === 'mensuel') return t('partners.monthly');
        if (normalized === 'trial' || normalized === 'essai') return t('partners.trial');
        if (normalized === 'enterprise') return t('partners.enterprise');
        if (normalized === 'standard') return t('partners.standard');
        return value;
    };

    const formatPerformance = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (normalized.includes('excellent')) return t('partners.performanceExcellent');
        if (normalized.includes('très bon') || normalized.includes('tres bon')) return t('partners.performanceVeryGood');
        if (normalized.includes('bon')) return t('partners.performanceGood');
        if (normalized.includes('moyen')) return t('partners.performanceAverage');
        if (normalized.includes('relancer')) return t('partners.performanceFollowUp');
        return value;
    };

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    const distinctContracts = React.useMemo(() => {
        return Array.from(new Set(partners.map((p) => p.contractType))).sort();
    }, [partners]);

    const perfScore = (p: Partner) => {
        const v = p.performance.toLowerCase();
        if (v.includes('excellent')) return 92;
        if (v.includes('très bon') || v.includes('tres bon')) return 84;
        if (v.includes('bon')) return 76;
        if (v.includes('moyen')) return 62;
        if (v.includes('relancer')) return 48;
        return 70;
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = partners;
        if (q) list = list.filter((p) => p.name.toLowerCase().includes(q));
        if (status !== 'all') list = list.filter((p) => p.status === status);
        if (contract !== 'all') list = list.filter((p) => p.contractType === contract);
        const sorted = [...list].sort((a, b) => {
            if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
            return b.usersManaged - a.usersManaged;
        });
        return sorted;
    }, [partners, query, status, contract, sortBy]);

    const stats = React.useMemo(() => {
        const total = partners.length || 1;
        const active = partners.filter((p) => p.status === 'active').length;
        const users = partners.reduce((acc, p) => acc + p.usersManaged, 0);
        const avgUsers = Math.round(users / total);
        const avgPerf = Math.round(partners.reduce((acc, p) => acc + perfScore(p), 0) / total);
        const readiness = Math.min(98, Math.max(60, Math.round(68 + avgPerf * 0.28 + Math.min(10, avgUsers / 4))));
        return { total, active, users, avgUsers, avgPerf, readiness };
    }, [partners]);

    const contractDistribution = React.useMemo(() => {
        const acc: Record<string, number> = {};
        partners.forEach((p) => {
            const label = formatContract(p.contractType);
            acc[label] = (acc[label] ?? 0) + 1;
        });
        return Object.entries(acc)
            .map(([k, v]) => ({ name: k, value: v }))
            .sort((a, b) => b.value - a.value);
    }, [partners]);

    const usersByContract = React.useMemo(() => {
        const acc: Record<string, number> = {};
        partners.forEach((p) => {
            const label = formatContract(p.contractType);
            acc[label] = (acc[label] ?? 0) + p.usersManaged;
        });
        return Object.entries(acc)
            .map(([k, v]) => ({ label: k, value: v }))
            .sort((a, b) => b.value - a.value);
    }, [partners]);

    const columns = [
        {
            header: 'Partenaire',
            accessor: 'name',
            cell: (p: Partner) => (
                <div className="min-w-0">
                    <Link to={paths.partners.detail(p.id)} className="font-semibold text-slate-900 hover:underline">
                        {p.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <Badge text={`Contrat ${formatContract(p.contractType)}`} color="default" />
                        <Badge text={`Secteur ${p.activity}`} color="info" />
                    </div>
                </div>
            ),
        },
        {
            header: 'État',
            accessor: 'status',
            cell: (p: Partner) => (
                <Badge text={formatStatus(p.status)} color={p.status === 'active' ? 'success' : 'default'} />
            ),
        },
        {
            header: 'Utilisateurs gérés',
            accessor: 'usersManaged',
            className: 'text-right',
            cell: (p: Partner) => <div className="text-right font-semibold text-slate-900">{nf.format(p.usersManaged)}</div>,
        },
        {
            header: 'Performance',
            accessor: 'performance',
            cell: (p: Partner) => {
                const s = perfScore(p);
                return (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>{formatPerformance(p.performance)}</span>
                            <span className="font-semibold text-slate-900">{s}/100</span>
                        </div>
                        <ProgressBar value={s} variant={s >= 80 ? 'success' : s >= 65 ? 'primary' : 'warning'} />
                    </div>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('partners.title')}</div>
                        <div className="page-subtitle">{t('partners.subtitleAdmin')}</div>
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
                <EmptyState
                    title={t('partners.unavailableTitle')}
                    description={error.message}
                    actionLabel={t('common.retry')}
                    onAction={() => window.location.reload()}
                />
            </div>
        );
    }

    if (!partners.length) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('partners.title')}</div>
                        <div className="page-subtitle">{t('partners.subtitleAdmin')}</div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState
                        title={t('partners.emptyTitle')}
                        description={t('partners.emptyDescription')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                        <div className="page-title">{t('partners.title')}</div>
                        <div className="page-subtitle">{t('partners.subtitleAdmin')}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={t('partners.sourceRealData')} color="info" />
                    <Badge text={`${t('users.portfolioActive')} : ${stats.active}/${stats.total}`} color={stats.active === stats.total ? 'success' : 'default'} />
                </div>
            </div>

            <div className="mt-4 surface-solid p-4">
                <SectionHeader
                    title={t('partners.filters')}
                    subtitle={t('partners.filtersSubtitle')}
                    right={<Badge text={t('partners.sourceApi')} color="default" />}
                />
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un partenaire…" />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={status}
                            onChange={(v) => setStatus(v as any)}
                            options={[
                                { value: 'all', label: t('partners.statusAll') },
                                { value: 'active', label: t('partners.active') },
                                { value: 'inactive', label: t('partners.inactive') },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={contract}
                            onChange={setContract}
                            options={[
                                { value: 'all', label: t('partners.contractAll') },
                                ...distinctContracts.map((c) => ({ value: c, label: c })),
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Select
                            value={sortBy}
                            onChange={(v) => setSortBy(v as any)}
                            options={[
                                { value: 'users_desc', label: t('partners.sortUsersDesc') },
                                { value: 'name_asc', label: t('partners.sortNameAsc') },
                            ]}
                        />
                    </div>
                    <div className="lg:col-span-12 flex flex-wrap items-center gap-2">
                        <Badge text={`${filtered.length} ${t('users.results')}`} color="info" />
                        <Badge text={`${t('partners.managedUsers')} : ${nf.format(stats.users)}`} color="default" />
                        <Badge text={`${t('partners.averagePerformance')} : ${stats.avgPerf}/100`} color={stats.avgPerf >= 80 ? 'success' : stats.avgPerf >= 65 ? 'info' : 'warning'} />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={t('partners.partnerPortfolio')}
                    value={nf.format(stats.total)}
                    subtitle={t('partners.partnerPortfolioSubtitle')}
                    icon={<Building2 className="h-4 w-4" />}
                />
                <StatCard
                    title={t('partners.activePartners')}
                    value={nf.format(stats.active)}
                    subtitle={stats.active === stats.total ? t('partners.allActive') : t('partners.contractsInProgress')}
                    icon={<TrendingUp className="h-4 w-4" />}
                />
                <StatCard
                    title={t('partners.managedUsers')}
                    value={nf.format(stats.users)}
                    subtitle={t('partners.managedUsersSubtitle', { avg: nf.format(stats.avgUsers) })}
                    icon={<Users className="h-4 w-4" />}
                    trend={usersByContract.map((d) => ({ name: d.label, value: d.value }))}
                />
                <StatCard
                    title={t('partners.readiness')}
                    value={`${stats.readiness}%`}
                    subtitle={t('partners.readinessSubtitle')}
                    icon={<Sparkles className="h-4 w-4" />}
                    trend={contractDistribution.map((d) => ({ name: d.name, value: d.value }))}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title={t('partners.contractDistributionTitle')} description={t('partners.contractDistributionDescription')}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="mx-auto w-full max-w-[220px] sm:mx-0">
                            <DonutChart data={contractDistribution} colors={['#2563eb', '#10b981', '#06b6d4', '#f59e0b']} size={220} />
                        </div>
                        <div className="flex-1 space-y-2">
                            {contractDistribution.map((d) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="text-sm text-slate-700">{d.name}</div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {nf.format(d.value)} · {Math.round((d.value / Math.max(1, stats.total)) * 100)}%
                                    </div>
                                </div>
                            ))}
                            <div className="pt-2">
                                <div className="text-xs text-slate-600">{t('partners.portfolioPerformance')}</div>
                                <div className="mt-1 text-sm font-semibold text-slate-900">{stats.avgPerf}/100</div>
                                <div className="mt-2 h-[120px]">
                                    <ProgressBar value={stats.readiness} variant={stats.readiness >= 80 ? 'success' : stats.readiness >= 65 ? 'primary' : 'warning'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title={t('partners.usersByContractTitle')} description={t('partners.usersByContractDescription')} className="lg:col-span-2">
                    <div className="h-[260px]">
                        <BarChart data={usersByContract} xKey="label" yKey="value" height={260} barColor="#2563eb" />
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title={t('partners.table')} description={t('partners.tableSubtitle')} className="lg:col-span-2">
                    <Table columns={columns} data={filtered} rowKey={(p) => p.id} />
                </Card>

                <Card title={t('partners.readyForWhiteLabel')} description={t('partners.readinessVisual')}>
                    <div className="space-y-3">
                        {[
                            { label: t('partners.branding'), value: Math.min(100, 72 + (stats.avgPerf - 60) / 2) },
                            { label: t('partners.ssoSecurity'), value: Math.min(100, 68 + (stats.avgPerf - 60) / 2) },
                            { label: t('partners.reporting'), value: Math.min(100, 64 + (stats.avgPerf - 60) / 2) },
                            { label: t('partners.slaSupport'), value: Math.min(100, 70 + (stats.avgPerf - 60) / 2) },
                        ].map((i) => (
                            <div key={i.label} className="rounded-2xl border border-slate-200/70 bg-white p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-900">{i.label}</span>
                                    <span className="text-slate-700">{Math.round(i.value)}%</span>
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={i.value} variant={i.value >= 80 ? 'success' : i.value >= 65 ? 'primary' : 'warning'} />
                                </div>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                            <div className="text-sm font-semibold text-slate-900">{t('partners.nextAction')}</div>
                            <div className="mt-1 text-xs text-slate-600">{t('partners.nextActionBody')}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PartnersPage;