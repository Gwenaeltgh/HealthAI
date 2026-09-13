import React from 'react';
import Badge from './Badge';
import Sparkline from '../charts/Sparkline';

export type StatCardDelta = {
  value: number; // -1..+1
  label?: string;
};

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  delta?: StatCardDelta;
  trend?: Array<{ name: string; value: number }>;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  delta,
  trend,
  className,
}) => {
  const deltaPct = typeof delta?.value === 'number' ? Math.round(delta.value * 100) : null;
  const deltaText = deltaPct === null ? null : `${deltaPct > 0 ? '+' : ''}${deltaPct}%`;
  const deltaColor = deltaPct === null ? 'default' : deltaPct >= 0 ? 'success' : 'warning';

  return (
    <div className={`surface-solid relative overflow-hidden p-4 sm:p-5 transition-shadow hover:shadow-card ${className ?? ''}`}>
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-52 w-52 rounded-full bg-brand-500/10 blur-2xl" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-slate-200/70 text-primary-700 shadow-insetSoft">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold tracking-wide text-slate-700 truncate">{title}</div>
              {subtitle && <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>}
            </div>
          </div>

          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {value}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {deltaText && (
            <Badge text={delta?.label ? `${deltaText} · ${delta.label}` : deltaText} color={deltaColor as any} />
          )}
          {trend && <Sparkline data={trend} width={112} height={42} strokeColor="#2563eb" />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
