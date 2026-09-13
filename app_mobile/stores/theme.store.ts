import { create } from 'zustand';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  toggleTheme: (currentScheme: 'light' | 'dark' | null | undefined) => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'light',
  toggleTheme: (currentScheme) => {
    const current = get().theme;
    const effective = current === 'system' ? (currentScheme ?? 'light') : current;
    set({ theme: effective === 'dark' ? 'light' : 'dark' });
  },
}));
