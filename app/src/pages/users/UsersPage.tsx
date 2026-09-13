import React from 'react';
import { useUsers } from '../../features/users/hooks/useUsers';
import UsersTable from '../../features/users/components/UsersTable';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import UserDrawer from '../../features/users/components/UserDrawer';
import { User } from '../../features/users/types';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

const UsersPage: React.FC = () => {
    const { users, isLoading, error } = useUsers();
    const { user } = useAuth();
    const { t } = useAppPreferences();
    const isEnterprise = user?.role === 'enterprise';
    const location = useLocation();

    const [query, setQuery] = React.useState('');
    const [activity, setActivity] = React.useState('all');
    const [page, setPage] = React.useState(1);
    const pageSize = 10;

    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<User | null>(null);

    const openUser = (u: User) => {
        setSelected(u);
        setDrawerOpen(true);
    };

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return users
            .filter((u) => (q ? u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) : true))
            .filter((u) => {
                if (activity === 'all') return true;
                return (u.physicalActivityLevel ?? 'unknown') === activity;
            });
    }, [users, query, activity]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = React.useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    React.useEffect(() => {
        setPage(1);
    }, [query, activity]);

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get('q') ?? '';
        setQuery(q);
    }, [location.search]);

    if (isLoading) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('users.title')}</div>
                        <div className="page-subtitle">{isEnterprise ? t('users.subtitleEnterprise') : t('users.subtitleAdmin')}</div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="64px" />
                    <Skeleton height="420px" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <EmptyState
                    title={t('users.unavailableTitle')}
                    description={error.message}
                    actionLabel={t('common.retry')}
                    onAction={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">{t('users.title')}</div>
                    <div className="page-subtitle">{isEnterprise ? t('users.subtitleEnterprise') : t('users.subtitleAdmin')}</div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge text={`${filtered.length} ${t('users.results')}`} color="info" />
                    <Badge text={isEnterprise ? t('users.portfolioActive') : t('users.dataQualityOk')} color="success" />
                </div>
            </div>

            <div className="mt-4 surface-solid p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('users.searchPlaceholder')}
                            className="max-w-xl"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={activity}
                            onChange={setActivity}
                            options={[
                                { value: 'all', label: t('users.activityAll') },
                                { value: 'low', label: t('users.activityLow') },
                                { value: 'medium', label: t('users.activityMedium') },
                                { value: 'high', label: t('users.activityHigh') },
                                { value: 'unknown', label: t('users.activityUnknown') },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <UsersTable users={paged} onOpenUser={openUser} />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            <UserDrawer user={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </div>
    );
};

export default UsersPage;