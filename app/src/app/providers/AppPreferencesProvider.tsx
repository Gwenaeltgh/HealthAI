import React from 'react';
import { AppLanguage, AppTheme, translate } from '../i18n/messages';

type AppPreferencesContextValue = {
  theme: AppTheme;
  language: AppLanguage;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const THEME_STORAGE_KEY = 'healthai.backoffice.theme';
const LANGUAGE_STORAGE_KEY = 'healthai.backoffice.language';

function readStoredTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'fr';

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === 'en' ? 'en' : 'fr';
}

const AppPreferencesContext = React.createContext<AppPreferencesContextValue | null>(null);

export const AppPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<AppTheme>(() => readStoredTheme());
  const [language, setLanguageState] = React.useState<AppLanguage>(() => readStoredLanguage());

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.body.dataset.theme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore localStorage failures in the browser shell
    }
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = language;

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore localStorage failures in the browser shell
    }
  }, [language]);

  const value = React.useMemo<AppPreferencesContextValue>(
    () => ({
      theme,
      language,
      isDark: theme === 'dark',
      setTheme: setThemeState,
      setLanguage: setLanguageState,
      t: (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    }),
    [language, theme]
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
};

export function useAppPreferences(): AppPreferencesContextValue {
  const value = React.useContext(AppPreferencesContext);

  if (!value) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider');
  }

  return value;
}

export default AppPreferencesProvider;
