import React from 'react';
import { useParams } from 'react-router-dom';
import { usePartner } from '../../features/partners/hooks/usePartner';
import Skeleton from '../../components/ui/Skeleton';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressBar from '../../components/ui/ProgressBar';
import EmptyState from '../../components/ui/EmptyState';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import { Building2, CreditCard, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import type { Partner } from '../../features/partners/types';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

const PartnerDetailPage: React.FC = () => {
    const { partnerId } = useParams<{ partnerId: string }>();
    const { partner, isLoading, error } = usePartner(partnerId);
    const { t } = useAppPreferences();

    const nf = React.useMemo(() => new Intl.NumberFormat('fr-FR'), []);

    const perfScore = (p: Partner) => {
        const v = p.performance.toLowerCase();
        if (v.includes('excellent')) return 92;
        if (v.includes('très bon') || v.includes('tres bon')) return 84;
        if (v.includes('bon')) return 76;
        if (v.includes('moyen')) return 62;
        if (v.includes('relancer')) return 48;
        return 70;
    };

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

    const hash = (s: string) => {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        return h;
    };

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('partners.detailTitle')}</div>
                        <div className="page-subtitle">{t('partners.detailSubtitle')}</div>
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
                        <div className="page-title">{t('partners.detailTitle')}</div>
                        <div className="page-subtitle">{t('partners.detailSubtitle')}</div>
                    </div>
                </div>
                <EmptyState
                    title={t('partners.detailUnavailableTitle')}
                    description={error.message}
                    actionLabel={t('common.retry')}
                    onAction={() => window.location.reload()}
                />
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('partners.detailTitle')}</div>
                        <div className="page-subtitle">{t('partners.detailSubtitle')}</div>
                    </div>
                </div>
                <div className="mt-4">
                    <EmptyState title={t('partners.detailNotFoundTitle')} description={t('partners.detailNotFoundDescription')} />
                </div>
            </div>
        );
    }

    const score = perfScore(partner);
    const adoptionSeries = (() => {
        const seed = hash(`adopt:${partner.id}`);
        const base = Math.max(12, Math.round(partner.usersManaged * 0.22));
        return Array.from({ length: 12 }).map((_, i) => {
            const noise = ((seed >> (i % 16)) & 7) - 3;
            return { name: `S${i + 1}`, value: Math.max(0, Math.round(base + i * (partner.status === 'active' ? 3 : 1) + noise)) };
        });
    })();

    const moduleUsage = (() => {
        const seed = hash(`modules:${partner.id}`);
        const modules = [
            { label: 'Nutrition', w: 1.0 },
            { label: 'Sport', w: 0.9 },
            { label: 'IA', w: 0.7 },
            { label: 'Analytics', w: 0.6 },
            { label: 'Reporting', w: 0.5 },
        ];
        return modules
            .map((m, i) => {
                const n = ((seed >> (i % 16)) & 7) - 3;
                const v = Math.max(8, Math.min(100, Math.round((score - 35) * m.w + n * 2)));
                return { label: m.label, value: v };
            })
            .sort((a, b) => b.value - a.value);
    })();

    const wlReadiness = Math.min(98, Math.max(55, Math.round(62 + (score - 60) * 0.7 + (partner.status === 'active' ? 6 : -6))));
    const renewalRisk = Math.min(92, Math.max(6, Math.round(100 - (score * 0.9 + (partner.status === 'active' ? 8 : -8)))));

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">{t('partners.detailTitle')}</div>
                    <div className="page-subtitle">{t('partners.detailTopSubtitle')}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge text={formatStatus(partner.status)} color={partner.status === 'active' ? 'success' : 'default'} />
                    <Badge text={`${t('partners.contract')} ${formatContract(partner.contractType)}`} color="info" />
                    <Badge text={`${nf.format(partner.usersManaged)} ${t('users.title').toLowerCase()}`} color="default" />
                </div>
            </div>

            <div className="surface-solid p-5">
                <div className="text-xl font-semibold text-slate-900">{partner.name}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge text={`${t('partners.sector')} ${partner.activity}`} color="info" />
                    <Badge text={`${t('partners.performance')} : ${formatPerformance(partner.performance)}`} color={score >= 80 ? 'success' : score >= 65 ? 'info' : 'warning'} />
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{t('partners.readiness')}</span>
                        <span className="font-semibold text-slate-900">{wlReadiness}%</span>
                    </div>
                    <ProgressBar value={wlReadiness} variant={wlReadiness >= 80 ? 'success' : wlReadiness >= 65 ? 'primary' : 'warning'} />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title={t('partners.managedUsers')}
                    value={nf.format(partner.usersManaged)}
                    subtitle={t('partners.portfolioAccount')}
                    icon={<Users className="h-4 w-4" />}
                    trend={adoptionSeries}
                />
                <StatCard
                    title={t('partners.averagePerformance')}
                    value={`${score}/100`}
                    subtitle={formatPerformance(partner.performance)}
                    icon={<TrendingUp className="h-4 w-4" />}
                    trend={moduleUsage.map((m) => ({ name: m.label, value: m.value }))}
                />
                <StatCard
                    title={t('partners.renewalEstimate')}
                    value={`${Math.max(0, 100 - renewalRisk)}%`}
                    subtitle={t('partners.probability')}
                    icon={<CreditCard className="h-4 w-4" />}
                    trend={adoptionSeries.map((p) => ({ name: p.name, value: Math.max(0, Math.round(p.value * 0.8)) }))}
                />
                <StatCard
                    title={t('partners.churnRisk')}
                    value={`${renewalRisk}%`}
                    subtitle={t('partners.alertSignal')}
                    icon={<ShieldCheck className="h-4 w-4" />}
                    trend={adoptionSeries.map((p) => ({ name: p.name, value: Math.max(0, 100 - p.value) }))}
                />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title={t('partners.adoptionTitle')} description={t('partners.adoptionDescription')} className="lg:col-span-2">
                    <div className="h-[280px]">
                        <LineChart data={adoptionSeries} xKey="name" yKey="value" height={280} />
                    </div>
                </Card>

                <Card title={t('partners.modulesTitle')} description={t('partners.modulesDescription')}>
                    <div className="h-[220px]">
                        <BarChart data={moduleUsage} xKey="label" yKey="value" height={220} barColor="#2563eb" />
                    </div>
                    <div className="mt-3 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                        <div className="text-sm font-semibold text-slate-900">{t('partners.businessReadout')}</div>
                        <div className="mt-1 text-xs text-slate-600">
                            {t('partners.reportingRecommendation', { contract: formatContract(partner.contractType) })}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title={t('partners.readiness')} description={t('partners.readinessVisualDescription')} className="lg:col-span-1">
                    <div className="flex flex-col items-center gap-3">
                        <DonutChart
                            data={[
                                { name: t('partners.ready'), value: wlReadiness },
                                { name: t('partners.toComplete'), value: Math.max(0, 100 - wlReadiness) },
                            ]}
                            colors={['#10b981', '#94a3b8']}
                            size={220}
                        />
                        <div className="w-full">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                                <span>{t('partners.maturity')}</span>
                                <span className="font-semibold text-slate-900">{wlReadiness}%</span>
                            </div>
                            <div className="mt-2">
                                <ProgressBar value={wlReadiness} variant={wlReadiness >= 80 ? 'success' : wlReadiness >= 65 ? 'primary' : 'warning'} />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title={t('partners.contractAndSla')} description={t('partners.operationalDetails')} className="lg:col-span-2">
                    <SectionHeader title={t('partners.sla')} subtitle={t('partners.supportAndSecurity')} />
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-900">{t('partners.support')}</div>
                                <Badge text={partner.contractType === 'Enterprise' ? '24/7' : t('partners.businessHours')} color="info" />
                            </div>
                            <div className="mt-2 text-xs text-slate-600">{partner.contractType === 'Enterprise' ? t('partners.firstResponseEnterprise') : t('partners.firstResponseStandard')}</div>
                            <div className="mt-3">
                                <ProgressBar value={partner.contractType === 'Enterprise' ? 88 : 72} variant="primary" />
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200/70 bg-white p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-semibold text-slate-900">{t('partners.security')}</div>
                                <Badge text={partner.contractType === 'Enterprise' ? t('partners.ssoReady') : t('partners.standard')} color="success" />
                            </div>
                            <div className="mt-2 text-xs text-slate-600">{t('partners.securityRecommendation')}</div>
                            <div className="mt-3">
                                <ProgressBar value={partner.contractType === 'Enterprise' ? 86 : 68} variant="success" />
                            </div>
                        </div>
                    </div>

                    <SectionHeader title={t('partners.whiteLabel')} subtitle={t('partners.configuration')} />
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {[
                            { label: t('partners.brandKit'), value: Math.min(100, wlReadiness + 6) },
                            { label: t('partners.domainDns'), value: Math.min(100, wlReadiness - 8) },
                            { label: t('partners.emailTemplates'), value: Math.min(100, wlReadiness - 4) },
                            { label: t('partners.customReports'), value: Math.min(100, wlReadiness - 10) },
                        ].map((i) => (
                            <div key={i.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-slate-900">{i.label}</span>
                                    <span className="text-slate-700">{Math.round(i.value)}%</span>
                                </div>
                                <div className="mt-2">
                                    <ProgressBar value={i.value} variant={i.value >= 80 ? 'success' : i.value >= 65 ? 'primary' : 'warning'} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PartnerDetailPage;