import React from 'react';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAppPreferences } from '../../../app/providers/AppPreferencesProvider';

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m';

type Props = {
    period?: DashboardPeriod;
    onPeriodChange?: (p: DashboardPeriod) => void;
    onRefresh?: () => void;
    isRefreshing?: boolean;
};

const FiltersBar: React.FC<Props> = ({ period: periodProp, onPeriodChange, onRefresh, isRefreshing }) => {
    const { t } = useAppPreferences();
    const [periodState, setPeriodState] = React.useState<DashboardPeriod>('30d');
    const period = periodProp ?? periodState;

    const setPeriod = (p: DashboardPeriod) => {
        setPeriodState(p);
        onPeriodChange?.(p);
    };

    return (
        <div className="surface-solid flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <Badge text={t('filters.period')} color="default" />
                {(
                    [
                        { value: '7d', label: t('filters.last7Days') },
                        { value: '30d', label: t('filters.last30Days') },
                        { value: '90d', label: t('filters.last90Days') },
                        { value: '12m', label: t('filters.last12Months') },
                    ] as const
                ).map((p) => (
                    <Button
                        key={p.value}
                        type="button"
                        variant={period === p.value ? 'primary' : 'secondary'}
                        size="small"
                        onClick={() => setPeriod(p.value)}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <Button type="button" variant="tertiary" size="small">
                    {t('filters.export')}
                </Button>
                <Button type="button" size="small" onClick={onRefresh} disabled={isRefreshing || !onRefresh}>
                    {t('filters.refresh')}
                </Button>
            </div>
        </div>
    );
};

export default FiltersBar;