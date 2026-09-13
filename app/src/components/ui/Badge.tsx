import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

const Badge: React.FC<BadgeProps> = ({ text, color = 'default' }) => {
  const colorClasses = {
    default: 'bg-slate-100/80 text-slate-700 border-slate-200/70',
    info: 'bg-primary-50/80 text-primary-700 border-primary-100',
    success: 'bg-success-50/80 text-success-700 border-success-100',
    warning: 'bg-warning-50/80 text-warning-700 border-warning-100',
    error: 'bg-danger-50/80 text-danger-700 border-danger-100',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-insetSoft backdrop-blur ${
        colorClasses[color]
      }`}
    >
      {text}
    </span>
  );
};

export default Badge;