import type { AuthResponse, AuthUser, LoginPayload, OnboardingData, RegisterPayload } from '@/types';
import { storage } from '@/utils/storage';
import { TOKEN_KEY, USER_KEY } from './api';

const DEFAULTS: Omit<AuthUser, 'id' | 'firstName' | 'lastName' | 'email'> = {
  goal:          'maintien',
  currentWeight: 74,
  targetWeight:  70,
  startWeight:   80,
  height:        175,
  age:           28,
  plan:          'free',
  memberSince:   new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
};

async function persist(token: string, user: AuthUser) {
  await Promise.all([
    storage.setItem(TOKEN_KEY, token),
    storage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    await new Promise(r => setTimeout(r, 700));

    // Réutiliser le compte local existant si l'email correspond
    const stored = await storage.getItem(USER_KEY);
    if (stored) {
      const user: AuthUser = JSON.parse(stored);
      if (user.email === payload.email) {
        const token = 'local_' + Date.now();
        await storage.setItem(TOKEN_KEY, token);
        return { token, user };
      }
    }

    // Nouveau compte minimal
    const token = 'local_' + Date.now();
    const user: AuthUser = {
      ...DEFAULTS,
      id:        Date.now().toString(),
      firstName: payload.email.split('@')[0],
      lastName:  '',
      email:     payload.email,
    };
    await persist(token, user);
    return { token, user };
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    await new Promise(r => setTimeout(r, 700));
    const token = 'local_' + Date.now();
    const user: AuthUser = {
      ...DEFAULTS,
      id:        Date.now().toString(),
      firstName: payload.firstName,
      lastName:  payload.lastName,
      email:     payload.email,
    };
    await persist(token, user);
    return { token, user };
  },

  async getMe(): Promise<AuthUser> {
    const stored = await storage.getItem(USER_KEY);
    if (stored) return JSON.parse(stored);
    throw new Error('Aucun utilisateur en cache');
  },

  async saveOnboarding(data: OnboardingData): Promise<void> {
    const stored = await storage.getItem(USER_KEY);
    if (!stored) return;
    const user: AuthUser = JSON.parse(stored);
    await storage.setItem(USER_KEY, JSON.stringify({
      ...user,
      goal:          data.goal,
      currentWeight: data.currentWeight,
      targetWeight:  data.targetWeight,
      height:        data.height,
      age:           data.age,
    }));
  },

  async logout(): Promise<void> {
    await Promise.all([
      storage.deleteItem(TOKEN_KEY),
      storage.deleteItem(USER_KEY),
    ]);
  },

  async getStoredToken(): Promise<string | null> {
    return storage.getItem(TOKEN_KEY);
  },
};
