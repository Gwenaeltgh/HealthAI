import React from 'react';
import Sparkline from '../../../components/charts/Sparkline';
import Badge from '../../../components/ui/Badge';

export type KpiCardData = {
  id: string;
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  trend?: Array<{ name: string; value: number }>;
};

interface KpiCardProps {
  kpi: KpiCardData;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ kpi, className }) => {
  const delta = typeof kpi.delta === 'number' ? kpi.delta : null;
  const deltaText = delta === null ? null : `${delta > 0 ? '+' : ''}${Math.round(delta * 100)}%`;
  const deltaColor =
    delta === null ? 'default' : delta >= 0 ? ('success' as const) : ('warning' as const);

  return (
    <div className={`surface-solid relative overflow-hidden p-4 sm:p-5 transition-shadow hover:shadow-card ${className ?? ''}`}>
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-slate-200/70 text-primary-700 shadow-insetSoft">
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-wide text-slate-700 truncate">{kpi.title}</div>
              {kpi.description && <div className="text-[11px] text-slate-500 truncate">{kpi.description}</div>}
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {kpi.value}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {deltaText && (
            <Badge
              text={kpi.deltaLabel ? `${deltaText} · ${kpi.deltaLabel}` : deltaText}
              color={deltaColor}
            />
          )}
          {kpi.trend && <Sparkline data={kpi.trend} width={112} height={42} strokeColor="#2563eb" />}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;