import React from 'react';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

type ProgressBarVariant = 'primary' | 'brand' | 'success' | 'warning' | 'danger' | 'slate';

const variantClasses: Record<ProgressBarVariant, string> = {
  primary: 'bg-primary-600',
  brand: 'bg-brand-500',
  success: 'bg-success-600',
  warning: 'bg-warning-500',
  danger: 'bg-danger-600',
  slate: 'bg-slate-400',
};

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  heightClassName?: string;
  showLabel?: boolean;
  label?: string;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'brand',
  heightClassName = 'h-2',
  showLabel,
  label,
}) => {
  const { t } = useAppPreferences();

  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? value : 0;
  const pct = clamp01(safeValue / safeMax);

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-600">
          <span className="truncate">{label ?? t('common.loading')}</span>
          <span className="font-semibold text-slate-900">{Math.round(pct * 100)}%</span>
        </div>
      )}
      <div className={`${heightClassName} overflow-hidden rounded-full border border-slate-200/70 bg-slate-100`}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        role="progressbar"
      >
        <div className={`h-full ${variantClasses[variant]} transition-[width]`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
