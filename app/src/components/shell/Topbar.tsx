import React from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useToast } from '../../app/providers/ToastProvider';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';
import { paths } from '../../routes/paths';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Bell, CheckCheck, Clock3, Download, LogOut, Menu, RefreshCcw, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

type NotificationKind = 'pipeline' | 'import' | 'recommendation' | 'profile';

type NotificationItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    unread: boolean;
    kind: NotificationKind;
};

type NotificationEventDetail = {
    id: string;
    title: string;
    description: string;
    time: string;
    kind: NotificationKind;
};

const NOTIFICATIONS_STORAGE_KEY = 'healthia.topbar.notifications';

function createNotifications(isEnterprise: boolean): NotificationItem[] {
    const scopeTitle = isEnterprise ? 'Synchronisation entreprise réussie' : 'Pipeline relancé';
    const scopeDescription = isEnterprise
        ? 'Le périmètre entreprise a été actualisé sans erreur.'
        : 'Les traitements bronze → silver → gold ont terminé correctement.';

    return [
        {
            id: 'pipeline',
            title: scopeTitle,
            description: scopeDescription,
            time: 'il y a 4 min',
            unread: true,
            kind: 'pipeline',
        },
        {
            id: 'import',
            title: 'Nouvelles données importées',
            description: 'Le dernier lot a été consolidé dans le référentiel.',
            time: 'il y a 18 min',
            unread: true,
            kind: 'import',
        },
        {
            id: 'recommendation',
            title: 'Recommandation générée',
            description: 'Une nouvelle recommandation est disponible dans le backoffice.',
            time: 'il y a 1 h',
            unread: false,
            kind: 'recommendation',
        },
        {
            id: 'profile',
            title: 'Profil mis à jour',
            description: 'Les préférences du compte ont été enregistrées avec succès.',
            time: 'ce matin',
            unread: false,
            kind: 'profile',
        },
    ];
}

function readStoredNotifications(isEnterprise: boolean): NotificationItem[] | null {
    try {
        const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as { isEnterprise: boolean; items: NotificationItem[] };
        if (parsed?.isEnterprise !== isEnterprise || !Array.isArray(parsed.items)) return null;

        return parsed.items;
    } catch {
        return null;
    }
}

function writeStoredNotifications(isEnterprise: boolean, items: NotificationItem[]) {
    try {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify({ isEnterprise, items }));
    } catch {
        // ignore storage failures in local-only UI state
    }
}

const notificationIconMap: Record<NotificationKind, React.ElementType> = {
    pipeline: RefreshCcw,
    import: Download,
    recommendation: Sparkles,
    profile: ShieldCheck,
};

const notificationToneMap: Record<NotificationKind, string> = {
    pipeline: 'bg-primary-50 text-primary-700 border-primary-100',
    import: 'bg-brand-50 text-brand-700 border-brand-100',
    recommendation: 'bg-success-50 text-success-700 border-success-100',
    profile: 'bg-slate-100 text-slate-700 border-slate-200/70',
};

type TopbarProps = {
    onMenuClick?: () => void;
};

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const { t } = useAppPreferences();
    const navigate = useNavigate();
    const location = useLocation();
    const isEnterprise = user?.role === 'enterprise';

    const [query, setQuery] = React.useState('');
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<NotificationItem[]>(() => readStoredNotifications(isEnterprise) ?? createNotifications(isEnterprise));
    const notificationsRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        setNotifications(readStoredNotifications(isEnterprise) ?? createNotifications(isEnterprise));
        setNotificationsOpen(false);
    }, [isEnterprise]);

    React.useEffect(() => {
        writeStoredNotifications(isEnterprise, notifications);
    }, [isEnterprise, notifications]);

    React.useEffect(() => {
        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (!notificationsRef.current) return;
            if (!notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        const handleUiNotification = (event: Event) => {
            const detail = (event as CustomEvent<NotificationEventDetail>).detail;
            if (!detail?.id || !detail.title || !detail.description || !detail.time || !detail.kind) return;

            setNotifications((current) => {
                const next = [
                    {
                        id: detail.id,
                        title: detail.title,
                        description: detail.description,
                        time: detail.time,
                        unread: true,
                        kind: detail.kind,
                    },
                    ...current.filter((item) => item.id !== detail.id),
                ].slice(0, 6);

                return next;
            });
        };

        window.addEventListener('healthia:notification', handleUiNotification as EventListener);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('healthia:notification', handleUiNotification as EventListener);
        };
    }, []);

    const unreadCount = notifications.reduce((count, item) => count + (item.unread ? 1 : 0), 0);

    const resolveSearchTarget = (pathname: string) => {
        if (pathname.startsWith(paths.enterprise.users)) return paths.enterprise.users;
        if (pathname.startsWith(paths.users.list)) return paths.users.list;

        if (pathname.startsWith(paths.enterprise.recommendations)) return paths.enterprise.recommendations;
        if (pathname.startsWith(paths.recommendations.list)) return paths.recommendations.list;

        if (pathname.startsWith('/enterprise/nutrition')) return paths.enterprise.nutrition.catalog;
        if (pathname.startsWith('/nutrition')) return paths.nutrition.catalog;

        if (pathname.startsWith(paths.enterprise.sport.programs)) return paths.enterprise.sport.programs;
        if (pathname.startsWith(paths.sport.programs)) return paths.sport.programs;
        if (pathname.startsWith(paths.enterprise.sport.exercises)) return paths.enterprise.sport.exercises;
        if (pathname.startsWith(paths.sport.exercises)) return paths.sport.exercises;

        if (pathname.startsWith(paths.partners.list)) return paths.partners.list;

        return null;
    };

    const submitSearch = () => {
        const q = query.trim();
        if (!q) return;
        const target = resolveSearchTarget(location.pathname);
        if (!target) return;
        navigate(`${target}?q=${encodeURIComponent(q)}`);
    };

    const markAllAsRead = () => {
        setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
    };

    const clearNotifications = () => {
        setNotifications(createNotifications(isEnterprise));
    };

    const markAsRead = (id: string) => {
        setNotifications((current) => current.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    };

    const onLogout = async () => {
        try {
            await logout();
        } finally {
            addToast('Déconnecté', 'success');
            navigate(isEnterprise ? paths.auth.loginEnterprise : paths.auth.loginAdmin, { replace: true });
        }
    };

    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col px-4 md:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <button
                            type="button"
                            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-700 shadow-insetSoft md:hidden"
                            aria-label="Ouvrir le menu"
                            onClick={onMenuClick}
                        >
                            <Menu className="h-4 w-4" />
                        </button>
                        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-brand-500 text-white shadow-soft md:hidden">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="hidden min-w-0 md:block">
                            <div className="text-sm font-semibold text-slate-900">HealthAI Coach</div>
                            <div className="text-[11px] text-slate-500">{isEnterprise ? t('shell.enterpriseBackoffice') : t('shell.adminBackoffice')}</div>
                        </div>
                    </div>

                    <div className="hidden flex-1 items-center px-6 md:flex">
                        <div className="relative w-full max-w-xl">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        submitSearch();
                                    }
                                }}
                                placeholder={t('topbar.searchPlaceholder')}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                    <div ref={notificationsRef} className="relative">
                        <button
                            type="button"
                            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200/70 bg-white/60 text-slate-700 shadow-insetSoft transition hover:bg-slate-50"
                            aria-label="Notifications"
                            aria-haspopup="dialog"
                            aria-expanded={notificationsOpen}
                            onClick={() => setNotificationsOpen((current) => !current)}
                        >
                            <Bell className="h-4 w-4" />
                            {unreadCount > 0 ? (
                                <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-none text-white shadow-soft">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            ) : (
                                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-success-500" />
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-lift backdrop-blur">
                                <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 px-4 py-4">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">{t('topbar.notifications')}</div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {unreadCount > 0
                                                ? unreadCount === 1
                                                    ? t('topbar.unreadOne')
                                                    : t('topbar.unreadMany', { count: unreadCount })
                                                : t('topbar.unreadZero')}
                                            {isEnterprise ? ' • enterprise' : ' • admin'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="tertiary" size="small" onClick={clearNotifications}>
                                            {t('topbar.reset')}
                                        </Button>
                                        <Button type="button" variant="tertiary" size="small" onClick={markAllAsRead} disabled={unreadCount === 0}>
                                            <CheckCheck className="h-4 w-4" />
                                            {t('topbar.allRead')}
                                        </Button>
                                        <button
                                            type="button"
                                            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200/70 bg-white/70 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                            aria-label={t('topbar.closeNotifications')}
                                            onClick={() => setNotificationsOpen(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-80 space-y-2 overflow-auto p-3">
                                    {notifications.map((item) => {
                                        const NotificationIcon = notificationIconMap[item.kind];

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => markAsRead(item.id)}
                                                className={`w-full rounded-2xl border p-3 text-left transition hover:shadow-soft ${
                                                    item.unread ? 'border-primary-200 bg-primary-50/60' : 'border-slate-200/70 bg-slate-50/70 hover:bg-white'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`grid h-9 w-9 place-items-center rounded-xl border ${notificationToneMap[item.kind]}`}>
                                                        <NotificationIcon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                                                            {item.unread && <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary-500" />}
                                                        </div>
                                                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
                                                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                                                            <Clock3 className="h-3.5 w-3.5" />
                                                            <span>{item.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden items-center gap-2 sm:flex">
                        <div className="h-9 w-9 rounded-2xl bg-slate-100 border border-slate-200/70" />
                        <div className="max-w-[180px]">
                            <div className="truncate text-xs font-semibold text-slate-900">{user?.email ?? 'Admin'}</div>
                            <div className="truncate text-[11px] text-slate-500">{isEnterprise ? user?.companyName ?? t('shell.enterpriseSession') : t('shell.secureSession')}</div>
                        </div>
                    </div>

                    <Button variant="tertiary" size="medium" onClick={onLogout} className="!px-3">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('topbar.logout')}</span>
                    </Button>
                    </div>
                </div>

                <div className="pb-3 md:hidden">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitSearch();
                                }
                            }}
                            placeholder={t('topbar.searchPlaceholder')}
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;