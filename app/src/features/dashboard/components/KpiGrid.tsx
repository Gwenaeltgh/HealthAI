import React from 'react';
import KpiCard from './KpiCard';
import { DashboardKPI } from '../types';
import { KpiCardData } from './KpiCard';
import { Activity, Flame, TrendingUp, Users, Zap, Dumbbell } from 'lucide-react';
import { useAppPreferences } from '../../../app/providers/AppPreferencesProvider';

interface KpiGridProps {
  kpis: DashboardKPI;
  variant?: 'admin' | 'enterprise';
}

const KpiGrid: React.FC<KpiGridProps> = ({ kpis, variant = 'admin' }) => {
  const { t } = useAppPreferences();

  const labels =
    variant === 'enterprise'
      ? {
          activeUsers: t('dashboard.activeUsersEnterprise'),
          newSignUps: t('dashboard.newSignUpsEnterprise'),
          premiumConversionRate: t('dashboard.premiumConversionEnterprise'),
          retentionRate: t('dashboard.retentionEnterprise'),
          averageCalories: t('dashboard.averageCaloriesEnterprise'),
          workoutSessions: t('dashboard.workoutSessionsEnterprise'),
        }
      : {
          activeUsers: t('dashboard.activeUsersAdmin'),
          newSignUps: t('dashboard.newSignUpsAdmin'),
          premiumConversionRate: t('dashboard.premiumConversionAdmin'),
          retentionRate: t('dashboard.retentionAdmin'),
          averageCalories: t('dashboard.averageCaloriesAdmin'),
          workoutSessions: t('dashboard.workoutSessionsAdmin'),
        };

  const items: KpiCardData[] = [
    {
      id: 'activeUsers',
      title: labels.activeUsers,
      value: kpis.activeUsers,
      description: variant === 'enterprise' ? t('dashboard.activeUsersEnterpriseDescription') : t('dashboard.activeUsersAdminDescription'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'newSignUps',
      title: labels.newSignUps,
      value: kpis.newSignUps,
      description: variant === 'enterprise' ? t('dashboard.newSignUpsEnterpriseDescription') : t('dashboard.newSignUpsAdminDescription'),
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'premiumConversionRate',
      title: labels.premiumConversionRate,
      value: `${Math.round(kpis.premiumConversionRate * 100)}%`,
      description: variant === 'enterprise' ? t('dashboard.premiumConversionEnterpriseDescription') : t('dashboard.premiumConversionAdminDescription'),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: 'retentionRate',
      title: labels.retentionRate,
      value: `${Math.round(kpis.retentionRate * 100)}%`,
      description: variant === 'enterprise' ? t('dashboard.retentionEnterpriseDescription') : t('dashboard.retentionAdminDescription'),
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 'avgCalories',
      title: labels.averageCalories,
      value: kpis.averageCalories,
      description: variant === 'enterprise' ? t('dashboard.averageCaloriesEnterpriseDescription') : t('dashboard.averageCaloriesAdminDescription'),
      icon: <Flame className="h-4 w-4" />,
    },
    {
      id: 'workoutSessions',
      title: labels.workoutSessions,
      value: kpis.workoutSessions,
      description: variant === 'enterprise' ? t('dashboard.workoutSessionsEnterpriseDescription') : t('dashboard.workoutSessionsAdminDescription'),
      icon: <Dumbbell className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {items.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
};

export default KpiGrid;