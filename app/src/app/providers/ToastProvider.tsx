import React, { createContext, useContext, useMemo, useState } from 'react';
import Toast from '../../components/ui/Toast';

export type ToastType = 'success' | 'error' | 'info';

type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
};

type ToastContextValue = {
    addToast: (message: string, type?: ToastType, opts?: { duration?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const value = useContext(ToastContext);
    if (!value) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return value;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const addToast: ToastContextValue['addToast'] = (message, type = 'info', opts) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, message, type, duration: opts?.duration }]);
    };

    const value = useMemo(() => ({ addToast }), []);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-[min(420px,calc(100vw-2rem))]">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;