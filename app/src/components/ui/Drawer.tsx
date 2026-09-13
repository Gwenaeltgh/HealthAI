import React from 'react';
import { X } from 'lucide-react';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children }) => {
  const { t } = useAppPreferences();

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`fixed right-0 top-0 h-full w-[min(92vw,26rem)] transform border-l border-slate-200/70 bg-white shadow-card transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur">
          <div className="text-sm font-semibold text-slate-900">{t('common.details')}</div>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;