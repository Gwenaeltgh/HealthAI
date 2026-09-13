import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, action, children, className }) => {
  return (
    <section className={`surface-solid p-4 sm:p-5 transition-shadow hover:shadow-card ${className ?? ''}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold leading-6 tracking-tight text-slate-900 truncate">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-600">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="text-slate-900">{children}</div>
    </section>
  );
};

export default Card;