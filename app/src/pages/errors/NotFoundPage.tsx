import React from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../../routes/paths';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

const NotFoundPage: React.FC = () => {
    const { t } = useAppPreferences();

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="surface-solid max-w-lg p-8 text-center">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-600">HealthAI Coach</div>
                <h1 className="mt-3 text-5xl font-bold tracking-tight text-slate-900">404</h1>
                <p className="mt-4 text-base text-slate-600">{t('errors.notFoundDescription')}</p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        to={paths.dashboard.main}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-brand-600 px-4 text-sm font-medium text-white shadow-card transition hover:from-primary-700 hover:to-brand-700"
                    >
                        {t('errors.backToDashboard')}
                    </Link>
                    <Link to={paths.auth.loginAdmin} className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        {t('errors.backToLogin')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;