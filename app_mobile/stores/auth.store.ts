import { create } from 'zustand';
import type { AuthUser, LoginPayload, OnboardingData, RegisterPayload } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  saveOnboarding: (data: OnboardingData) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: async () => {
    const token = await authService.getStoredToken();
    if (!token) return;
    try {
      const user = await authService.getMe();
      set({ user, token, isAuthenticated: true });
    } catch {
      // token expiré, on ignore
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(payload);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Identifiants incorrects', isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(payload);
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message ?? 'Erreur lors de l\'inscription', isLoading: false });
    }
  },

  saveOnboarding: async (data) => {
    set({ isLoading: true });
    await authService.saveOnboarding(data);
    const user = get().user;
    if (user) {
      set({
        user: {
          ...user,
          goal: data.goal,
          currentWeight: data.currentWeight,
          targetWeight: data.targetWeight,
          height: data.height,
          age: data.age,
        },
        isLoading: false,
      });
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (partial) => {
    const user = get().user;
    if (user) set({ user: { ...user, ...partial } });
  },

  clearError: () => set({ error: null }),
}));
