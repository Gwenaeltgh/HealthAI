import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-300/70 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]';
  const variantStyles = {
    primary:
      'bg-gradient-to-br from-primary-600 to-brand-600 text-white shadow-card hover:from-primary-700 hover:to-brand-700 hover:shadow-lift',
    secondary:
      'bg-white/70 text-slate-900 border border-slate-200/70 shadow-insetSoft hover:bg-white hover:shadow-soft',
    tertiary:
      'bg-white/60 text-slate-900 border border-slate-200/70 hover:bg-white shadow-soft hover:shadow-card',
  };
  const sizeStyles = {
    small: 'h-9 px-3 text-sm',
    medium: 'h-10 px-4 text-sm',
    large: 'h-11 px-5 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;