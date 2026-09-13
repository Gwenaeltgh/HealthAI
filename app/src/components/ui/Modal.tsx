import React from 'react';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const { t } = useAppPreferences();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-lift">
        {title && <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
        <div className="mt-4 text-sm text-slate-700">{children}</div>
        <div className="mt-5 flex justify-end">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white px-4 text-sm font-medium text-slate-700 shadow-insetSoft transition hover:bg-slate-50"
            onClick={onClose}
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;