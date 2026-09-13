import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="surface-solid p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-slate-200/70 text-primary-700 shadow-insetSoft">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">{title}</div>
      {description && <div className="mt-1 text-sm text-slate-600">{description}</div>}
      {actionLabel && onAction && (
        <div className="mt-4 flex justify-center">
          <Button onClick={onAction} size="small">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
