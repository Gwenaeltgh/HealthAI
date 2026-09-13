import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paths } from './paths';

export const RequireAuth: React.FC = () => {
    const { status } = useAuth();

    if (status === 'loading') {
        return (
            <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
                Chargement…
            </div>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to={paths.auth.loginAdmin} replace />;
    }

    return <Outlet />;
};

export const RequireAdmin: React.FC = () => {
    const { status, isAdmin } = useAuth();

    if (status === 'loading') {
        return (
            <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
                Chargement…
            </div>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to={paths.auth.loginAdmin} replace />;
    }

    if (!isAdmin) {
        return <Navigate to={paths.errors.forbidden} replace />;
    }

    return <Outlet />;
};

export const RequireEnterprise: React.FC = () => {
    const { status, isEnterprise } = useAuth();

    if (status === 'loading') {
        return (
            <div className="flex h-[60vh] items-center justify-center text-sm text-slate-500">
                Chargement…
            </div>
        );
    }

    if (status !== 'authenticated') {
        return <Navigate to={paths.auth.loginEnterprise} replace />;
    }

    if (!isEnterprise) {
        return <Navigate to={paths.errors.forbidden} replace />;
    }

    return <Outlet />;
};