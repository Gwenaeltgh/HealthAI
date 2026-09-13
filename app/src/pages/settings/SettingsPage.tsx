import React from 'react';
import { Bell, Clock3, Globe, LockKeyhole, Palette, RefreshCcw, Settings2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import useSettings from '../../features/settings/hooks/useSettings';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Checkbox from '../../components/ui/Checkbox';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import { Settings } from '../../features/settings/types';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useAppPreferences } from '../../app/providers/AppPreferencesProvider';

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, isLoading, isUpdating, error } = useSettings();
    const { user } = useAuth();
    const { t, theme, setTheme, language, setLanguage } = useAppPreferences();
    const isEnterprise = user?.role === 'enterprise';
    const [draft, setDraft] = React.useState<Settings | null>(null);
    const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (settings) {
            setDraft(settings);
            setTheme(settings.theme);
            setLanguage(settings.language === 'en' ? 'en' : 'fr');
        }
    }, [settings, setLanguage, setTheme]);

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!draft) return;
        const updated = await updateSettings(draft);
        setDraft(updated);
        setTheme(updated.theme);
        setLanguage(updated.language === 'en' ? 'en' : 'fr');
        setLastSavedAt(new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date()));

        window.dispatchEvent(
            new CustomEvent('healthia:notification', {
                detail: {
                    id: `settings-${Date.now()}`,
                    title: t('settings.savedNotificationTitle'),
                    description: isEnterprise ? t('settings.savedEnterprise') : t('settings.savedAdmin'),
                    time: 'à l’instant',
                    kind: 'profile',
                },
            })
        );
    };

    const handleReset = () => {
        if (settings) {
            setDraft(settings);
            setTheme(settings.theme);
            setLanguage(settings.language === 'en' ? 'en' : 'fr');
        }
    };

    if (isLoading || !draft) {
        return (
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-title">{t('settings.title')}</div>
                        <div className="page-subtitle">{isEnterprise ? t('settings.subtitleEnterprise') : t('settings.subtitleAdmin')}</div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Skeleton height="140px" />
                    <Skeleton height="360px" />
                </div>
            </div>
        );
    }

    const isDirty = JSON.stringify(draft) !== JSON.stringify(settings);
    const themeLabel = draft.theme === 'dark' ? t('settings.dark') : t('settings.light');
    const notificationsLabel = draft.notificationsEnabled ? t('settings.notificationsActive') : t('settings.notificationsMuted');
    const dataLabel = draft.privacySettings.dataSharing ? t('settings.dataAllowed') : t('settings.dataLimited');
    const scopeLabel = isEnterprise ? t('settings.enterpriseScope') : t('settings.adminScope');

    const overviewCards = [
        {
            icon: Palette,
            label: t('settings.display'),
            value: themeLabel,
            detail: t('settings.displayDetail'),
        },
        {
            icon: Bell,
            label: t('settings.notificationsCard'),
            value: notificationsLabel,
            detail: t('settings.notificationsCardDetail'),
        },
        {
            icon: ShieldCheck,
            label: t('settings.dataCard'),
            value: dataLabel,
            detail: t('settings.dataCardDetail'),
        },
        {
            icon: LockKeyhole,
            label: t('settings.sessionCard'),
            value: scopeLabel,
            detail: user?.email ?? t('settings.connectedAccount'),
        },
    ];

    const notificationRows = [
        {
            icon: RefreshCcw,
            title: t('settings.notificationRowPipelineTitle'),
            description: t('settings.notificationRowPipelineDescription'),
        },
        {
            icon: Sparkles,
            title: t('settings.notificationRowRecommendationTitle'),
            description: t('settings.notificationRowRecommendationDescription'),
        },
        {
            icon: Users,
            title: t('settings.notificationRowProfileTitle'),
            description: t('settings.notificationRowProfileDescription'),
        },
    ];

    return (
        <div className="page">
            <div className="surface-solid overflow-hidden">
                <div className="border-b border-slate-200/70 bg-gradient-to-br from-primary-50 via-white to-brand-50 px-5 py-5 sm:px-6 sm:py-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1 text-xs font-semibold text-primary-700 shadow-insetSoft">
                                <Settings2 className="h-3.5 w-3.5" />
                                {t('settings.accountTitle')}
                            </div>
                            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{t('settings.heading')}</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('settings.intro')}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge text={scopeLabel} color="info" />
                            <Badge text={themeLabel} color="default" />
                            <Badge text={notificationsLabel} color={draft.notificationsEnabled ? 'success' : 'warning'} />
                            <Badge text={lastSavedAt ? t('settings.savedAt', { time: lastSavedAt }) : t('settings.unsaved')} color="default" />
                            <Badge text={isDirty ? t('settings.localChanges') : t('settings.synced')} color={isDirty ? 'warning' : 'success'} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                    {overviewCards.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-soft backdrop-blur">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            <Icon className="h-3.5 w-3.5 text-primary-600" />
                                            {item.label}
                                        </div>
                                        <div className="mt-2 text-base font-semibold text-slate-900">{item.value}</div>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{t('settings.quickView')}</div>
                                </div>
                                <div className="mt-2 text-sm leading-5 text-slate-600">{item.detail}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="mt-4 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card title={t('settings.interfaceCard')} description={t('settings.interfaceDescription')}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Palette className="h-4 w-4 text-primary-600" />
                                    {t('settings.theme')}
                                </div>
                                <Select
                                    value={draft.theme}
                                    onChange={(value) => {
                                        const nextTheme = value as Settings['theme'];
                                        setDraft({ ...draft, theme: nextTheme });
                                        setTheme(nextTheme);
                                    }}
                                    options={[
                                        { value: 'light', label: t('settings.light') },
                                        { value: 'dark', label: t('settings.dark') },
                                    ]}
                                    className="mt-3 w-full"
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-500">{t('settings.themeHint')}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Globe className="h-4 w-4 text-primary-600" />
                                    {t('settings.language')}
                                </div>
                                <Select
                                    value={draft.language}
                                    onChange={(value) => {
                                        const nextLanguage = value === 'en' ? 'en' : 'fr';
                                        setDraft({ ...draft, language: nextLanguage });
                                        setLanguage(nextLanguage);
                                    }}
                                    options={[
                                        { value: 'fr', label: t('settings.french') },
                                        { value: 'en', label: t('settings.english') },
                                    ]}
                                    className="mt-3 w-full"
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-500">{t('settings.languageHint')}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title={t('settings.notificationsCard')} description={t('settings.notificationsDescription')}>
                        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Bell className="h-4 w-4 text-primary-600" />
                                        {t('settings.notificationsGlobal')}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{t('settings.notificationsHint')}</p>
                                </div>
                                <Badge text={draft.notificationsEnabled ? t('settings.notificationsActive') : t('settings.notificationsMuted')} color={draft.notificationsEnabled ? 'success' : 'warning'} />
                            </div>

                            <div className="mt-4">
                                <Checkbox
                                    checked={draft.notificationsEnabled}
                                    onChange={(checked) => setDraft({ ...draft, notificationsEnabled: checked })}
                                    label={t('settings.notificationsEnable')}
                                />
                            </div>
                        </div>

                        <div className="mt-3 space-y-2">
                            {notificationRows.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white/70 p-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`grid h-9 w-9 place-items-center rounded-xl ${draft.notificationsEnabled ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-400'}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                                                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                                            </div>
                                            <Badge text={draft.notificationsEnabled ? t('settings.notificationsIncluded') : t('settings.notificationsMutedBadge')} color={draft.notificationsEnabled ? 'info' : 'default'} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card title={t('settings.dataCard')} description={t('settings.dataDescription')}>
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <Checkbox
                                    checked={draft.privacySettings.dataSharing}
                                    onChange={(checked) =>
                                        setDraft({
                                            ...draft,
                                            privacySettings: { ...draft.privacySettings, dataSharing: checked },
                                        })
                                    }
                                    label={t('settings.shareData')}
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-500">{t('settings.shareDataHint')}</p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <Checkbox
                                    checked={draft.privacySettings.personalizedAds}
                                    onChange={(checked) =>
                                        setDraft({
                                            ...draft,
                                            privacySettings: { ...draft.privacySettings, personalizedAds: checked },
                                        })
                                    }
                                    label={t('settings.personalizedContent')}
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-500">{t('settings.personalizedContentHint')}</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-xs leading-5 text-slate-600">
                            {t('settings.localScopeHint')}
                        </div>
                    </Card>

                    <Card title={t('settings.sessionCard')} description={t('settings.sessionDescription')}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    <Users className="h-3.5 w-3.5 text-primary-600" />
                                    {t('settings.account')}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{user?.email ?? t('settings.connectedAccount')}</div>
                                <div className="mt-1 text-xs leading-5 text-slate-500">{scopeLabel} • {t('settings.secureAccess')}</div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    <Clock3 className="h-3.5 w-3.5 text-primary-600" />
                                    {t('settings.state')}
                                </div>
                                <div className="mt-2 text-sm font-semibold text-slate-900">{t('settings.activeSession')}</div>
                                <div className="mt-1 text-xs leading-5 text-slate-500">{t('settings.secureAuth')}</div>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-success-600" />
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">{t('settings.visibleSecurity')}</div>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{t('settings.logoutHint')}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="surface-solid mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-sm font-semibold text-slate-900">
                            {isUpdating ? t('settings.syncing') : isDirty ? t('settings.readyToSave') : t('settings.synced')}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">{t('settings.saveHint')}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="secondary" onClick={handleReset} disabled={!isDirty || isUpdating}>
                            {t('common.reset')}
                        </Button>
                        <Button type="submit" disabled={isUpdating || !isDirty}>
                            {isUpdating ? t('settings.saving') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;