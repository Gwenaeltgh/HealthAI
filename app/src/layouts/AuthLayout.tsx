import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                    {children ?? <Outlet />}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;