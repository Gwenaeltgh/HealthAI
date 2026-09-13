import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';
import { paths } from '../../routes/paths';
import {
    Activity,
    BarChart3,
    Dumbbell,
    LayoutGrid,
    Settings,
    Sparkles,
    Users,
    Building2,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';

type NavItem = {
    to: string;
    icon: React.ReactNode;
};

const navItems: NavItem[] = [
    { to: paths.dashboard.main, icon: <LayoutGrid className="h-4 w-4" /> },
    { to: paths.users.list, icon: <Users className="h-4 w-4" /> },
    { to: paths.recommendations.list, icon: <Sparkles className="h-4 w-4" /> },
    { to: paths.nutrition.catalog, icon: <Activity className="h-4 w-4" /> },
    { to: paths.sport.programs, icon: <Dumbbell className="h-4 w-4" /> },
    { to: paths.analytics.main, icon: <BarChart3 className="h-4 w-4" /> },
    { to: paths.partners.list, icon: <Building2 className="h-4 w-4" /> },
    { to: paths.settings.main, icon: <Settings className="h-4 w-4" /> },
];

const enterpriseNavItems: NavItem[] = [
    { to: paths.enterprise.main, icon: <LayoutGrid className="h-4 w-4" /> },
    { to: paths.enterprise.users, icon: <Users className="h-4 w-4" /> },
    { to: paths.enterprise.recommendations, icon: <Sparkles className="h-4 w-4" /> },
    { to: paths.enterprise.nutrition.catalog, icon: <Activity className="h-4 w-4" /> },
    { to: paths.enterprise.sport.programs, icon: <Dumbbell className="h-4 w-4" /> },
    { to: paths.enterprise.analytics, icon: <BarChart3 className="h-4 w-4" /> },
    { to: paths.enterprise.settings, icon: <Settings className="h-4 w-4" /> },
];

const navLabelKey = (to: string) => {
    switch (to) {
        case paths.dashboard.main:
        case paths.enterprise.main:
            return 'nav.dashboard';
        case paths.users.list:
        case paths.enterprise.users:
            return 'nav.users';
        case paths.recommendations.list:
        case paths.enterprise.recommendations:
            return 'nav.recommendations';
        case paths.nutrition.catalog:
        case paths.enterprise.nutrition.catalog:
            return 'nav.nutrition';
        case paths.sport.programs:
        case paths.enterprise.sport.programs:
            return 'nav.sport';
        case paths.analytics.main:
        case paths.enterprise.analytics:
            return 'nav.analytics';
        case paths.partners.list:
            return 'nav.partners';
        default:
            return 'nav.settings';
    }
};

const storageKey = 'healthai.sidebar.collapsed';

type SidebarProps = {
    mobile?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ mobile = false, isOpen = false, onClose }) => {
    const { user } = useAuth();
    const { t } = useAppPreferences();
    const isEnterprise = user?.role === 'enterprise';
    const [collapsed, setCollapsed] = React.useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(storageKey) === '1';
    });

    const items = isEnterprise ? enterpriseNavItems : navItems;
    const isCollapsed = mobile ? false : collapsed;

    React.useEffect(() => {
        if (!mobile || typeof document === 'undefined') return;
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }

        document.body.style.overflow = '';
        return undefined;
    }, [isOpen, mobile]);

    const handleNavigate = () => {
        if (mobile) onClose?.();
    };

    const toggle = () => {
        setCollapsed((v) => {
            const next = !v;
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(storageKey, next ? '1' : '0');
            }
            return next;
        });
    };

    const content = (
        <>
            <div className="flex items-center justify-between gap-2 px-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-brand-500 text-white shadow-soft">
                        <span className="text-sm font-semibold">HA</span>
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">HealthAI Coach</div>
                            <div className="text-xs text-slate-500 truncate">{isEnterprise ? t('shell.enterpriseBackoffice') : t('shell.adminBackoffice')}</div>
                        </div>
                    )}
                </div>
                {mobile ? (
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-700 hover:bg-slate-50"
                        aria-label={t('common.close')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={toggle}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-700 hover:bg-slate-50"
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                )}
            </div>

            <div className="px-2 pb-3">
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 px-3 py-3">
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-700">{t('shell.healthTitle')}</div>
                        <span className="inline-flex items-center rounded-full bg-success-50 text-success-700 border border-success-100 px-2 py-0.5 text-[11px] font-medium">
                            {isEnterprise ? t('shell.healthScoped') : t('shell.healthStable')}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <div className="mt-2 text-xs text-slate-600">
                            {isEnterprise ? t('shell.healthEnterpriseDescription') : t('shell.healthAdminDescription')}
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 px-2 pb-3">
                <ul className="space-y-1">
                    {items.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                onClick={handleNavigate}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                                        isActive
                                            ? 'bg-primary-50 text-primary-800 border border-primary-100'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <span className="shrink-0 text-slate-600">{item.icon}</span>
                                {!isCollapsed && <span className="truncate">{t(navLabelKey(item.to))}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-3 py-3 border-t border-slate-200/70 bg-white/60">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-slate-100 border border-slate-200/70" />
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">{user?.name ?? (isEnterprise ? 'Entreprise' : 'Admin')}</div>
                            <div className="text-[11px] text-slate-500 truncate">{isEnterprise ? user?.companyName ?? t('shell.enterpriseSession') : t('shell.adminSession')}</div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    if (mobile) {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-40 md:hidden" aria-hidden={!isOpen}>
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
                <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col overflow-hidden border-r border-slate-200/70 bg-white shadow-lift">
                    {content}
                </aside>
            </div>
        );
    }

    return (
        <aside
            className={`${collapsed ? 'w-[74px]' : 'w-64'} surface-solid sticky top-0 hidden h-[calc(100vh-64px)] shrink-0 flex-col overflow-hidden md:flex`}
        >
            {content}
        </aside>
    );
};

export default Sidebar;