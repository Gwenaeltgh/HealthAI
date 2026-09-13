import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-sm font-medium">{label}</label>}
      <input
        className={`h-10 rounded-xl border bg-white/70 px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-insetSoft outline-none transition focus:ring-2 focus:ring-primary-300 ${
          error ? 'border-danger-300' : 'border-slate-200/70'
        } ${className ?? ''}`}
        {...props}
      />
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default Input;