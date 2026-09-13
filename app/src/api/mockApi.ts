import type { AxiosRequestConfig } from 'axios';

import { API_ENDPOINTS } from './endpoints';
import foodsMock from '../features/nutrition/mocks/foods.mock';
import { dashboardMockData } from '../features/dashboard/mocks/dashboard.mock';
import { mockRecommendations } from '../features/recommendations/mocks/recommendations.mock';
import { partnersMockData } from '../features/partners/mocks/partners.mock';
import { settingsMockData } from '../features/settings/mocks/settings.mock';
import { analyticsMockData } from '../features/analytics/mocks/analytics.mock';
import { exercisesMock } from '../features/sport/mocks/exercises.mock';

import type { DashboardData } from '../features/dashboard/types';
import type { AnalyticsData } from '../features/analytics/types';
import type { Recommendation } from '../features/recommendations/types';
import type { NutritionAnalyticsData } from '../features/nutrition/types';
import type { Partner } from '../features/partners/types';
import type { Settings } from '../features/settings/types';
import type { Program } from '../features/sport/types';

export type MockHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class OfflineApiError extends Error {
  name = 'OfflineApiError';

  constructor(message: string) {
    super(message);
  }
}

type UtilisateurApiResponse = {
  id: number;
  nom: string;
  age: number;
  gender: string;
  poids: number;
  taille: number;
  disease_type: string | null;
  disease_severity: string | null;
  daily_caloric_intake: number | null;
  adherence_to_diet_plan: number | null;
  physical_activity_level: string | null;
};

type ExerciseApiResponse = {
  id: number;
  name: string;
  equipment: string | null;
  body_part: string | null;
  exercise_type: string | null;
};

const nowIso = () => new Date().toISOString();

const SETTINGS_STORAGE_KEY = 'healthai.backoffice.settings';

const readStoredSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return settingsMockData;
    return JSON.parse(raw) as Settings;
  } catch {
    return settingsMockData;
  }
};

const writeStoredSettings = (settings: Settings): Settings => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
  return settings;
};

const buildOfflineDashboard = (): DashboardData => {
  const kpi = dashboardMockData.kpi;

  return {
    kpis: {
      activeUsers: Number(kpi.activeUsers ?? 0),
      newSignUps: Number(kpi.newSignUps ?? 0),
      premiumConversionRate: Number(kpi.premiumConversion ?? 0),
      retentionRate: Number(kpi.retentionRate ?? 0),
      averageCalories: Number(kpi.averageCalories ?? 0),
      workoutSessions: Number(kpi.workoutSessions ?? 0),
      generatedNutritionPlans: Number(kpi.generatedNutritionPlans ?? 0),
      generatedWorkoutPrograms: Number(kpi.generatedWorkoutPrograms ?? 0),
    },
    userActivities: [],
    alerts: (dashboardMockData.alerts ?? []).map((a: any) => String(a.message ?? a)),
    topPartners: (dashboardMockData.topPartners ?? []).map((p: any) => String(p.name ?? p)),
    engagementMetrics: {
      nutrition: Number(dashboardMockData.charts?.engagement?.nutrition ?? 0),
      sport: Number(dashboardMockData.charts?.engagement?.sport ?? 0),
    },
  };
};

const buildOfflineAnalytics = (): AnalyticsData => {
  const dist = dashboardMockData.charts?.subscriptionDistribution;
  const subscriptionDistribution = dist
    ? [
        { subscriptionType: 'free', count: Number((dist as any).free ?? 0) },
        { subscriptionType: 'premium', count: Number((dist as any).premium ?? 0) },
      ]
    : [];

  const daily = dashboardMockData.charts?.dailyActivity ?? [];
  const userEngagement = daily.map((d: any) => ({
    date: String(d.day ?? ''),
    nutritionEngagement: Number(d.activity ?? 0),
    sportEngagement: Math.max(0, Math.round(Number(d.activity ?? 0) * 0.6)),
  }));

  return {
    kpi: {
      activeUsers: Number(analyticsMockData.activeUsers ?? 0),
      newSignUps: Math.max(0, Math.round(Number(analyticsMockData.activeUsers ?? 0) * 0.05)),
      premiumConversionRate: Number(analyticsMockData.conversionRates?.freeToPremium ?? 0),
      retentionRate: Number(analyticsMockData.retentionRates?.day7 ?? 0),
      averageSessions: Math.max(1, Math.round(Number(analyticsMockData.userEngagement?.daily ?? 0) / 10)),
      averageCalories: Number(dashboardMockData.kpi?.averageCalories ?? 0),
      generatedNutritionPlans: Number(dashboardMockData.kpi?.generatedNutritionPlans ?? 0),
      generatedWorkoutPrograms: Number(dashboardMockData.kpi?.generatedWorkoutPrograms ?? 0),
    },
    userEngagement,
    subscriptionDistribution,
    alerts: (dashboardMockData.alerts ?? []).map((a: any) => String(a.message ?? a)),
    topPartners: (dashboardMockData.topPartners ?? []).map((p: any) => String(p.name ?? p)),
    topSegments: (dashboardMockData.topSegments ?? []).map((s: any) => String(s.segment ?? s)),
  };
};

const buildOfflineUsers = (): UtilisateurApiResponse[] => {
  const base = [
    { id: 1, nom: 'John Doe', gender: 'male' },
    { id: 2, nom: 'Jane Smith', gender: 'female' },
    { id: 3, nom: 'Alice Johnson', gender: 'female' },
    { id: 4, nom: 'Bob Brown', gender: 'male' },
    { id: 5, nom: 'Charlie Davis', gender: 'male' },
  ];

  return base.map((u, index) => ({
    id: u.id,
    nom: u.nom,
    age: 22 + index * 7,
    gender: u.gender,
    poids: 62 + index * 5,
    taille: 160 + index * 4,
    disease_type: index % 2 === 0 ? 'none' : null,
    disease_severity: null,
    daily_caloric_intake: 1800 + index * 120,
    adherence_to_diet_plan: 70 + index * 5,
    physical_activity_level: index % 3 === 0 ? 'high' : index % 3 === 1 ? 'medium' : 'low',
  }));
};

const buildOfflineRecommendations = (): Recommendation[] => {
  return mockRecommendations.map((r: any) => {
    const now = nowIso();
    return {
      id: String(r.id),
      userId: String(r.userId ?? 'unknown'),
      type: String(r.type ?? 'health'),
      details: String(r.detail ?? r.details ?? ''),
      confidenceLevel: typeof r.confidenceLevel === 'number' ? r.confidenceLevel : undefined,
      createdAt: String(r.date ?? r.createdAt ?? now),
      updatedAt: String(r.date ?? r.updatedAt ?? now),
    };
  });
};

const buildOfflineNutritionAnalytics = (): NutritionAnalyticsData => {
  const totalFoods = foodsMock.length;
  const averageCalories = totalFoods
    ? Math.round(foodsMock.reduce((sum, f: any) => sum + Number(f.calories ?? 0), 0) / totalFoods)
    : 0;

  const averageMacros = totalFoods
    ? {
        protein: Math.round(foodsMock.reduce((sum, f: any) => sum + Number(f.protein ?? 0), 0) / totalFoods),
        carbohydrates: Math.round(foodsMock.reduce((sum, f: any) => sum + Number(f.carbohydrates ?? 0), 0) / totalFoods),
        fat: Math.round(foodsMock.reduce((sum, f: any) => sum + Number(f.fat ?? 0), 0) / totalFoods),
      }
    : { protein: 0, carbohydrates: 0, fat: 0 };

  const caloriesSeries = foodsMock.slice(0, 10).map((f: any) => ({
    name: String(f.name ?? ''),
    value: Number(f.calories ?? 0),
  }));

  return {
    totalFoods,
    averageCalories,
    averageMacros,
    caloriesSeries,
  };
};

const buildOfflinePartners = (): Partner[] => {
  const date = nowIso();
  return partnersMockData.map((p: any, index: number) => ({
    id: String(p.id ?? index + 1),
    name: String(p.name ?? `Partner ${index + 1}`),
    status: String(p.status ?? '').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    contractType: String(p.contractType ?? 'Annual'),
    usersManaged: Number(p.usersManaged ?? 0),
    activity: String(p.activity ?? ''),
    performance: String(p.performance ?? ''),
    createdAt: date,
    updatedAt: date,
  }));
};

const buildOfflinePrograms = (): Program[] => {
  const exercises: ExerciseApiResponse[] = buildOfflineExercises();
  const toExercise = (e: ExerciseApiResponse) => ({
    id: String(e.id),
    name: e.name,
    equipment: e.equipment,
    bodyPart: e.body_part,
    exerciseType: e.exercise_type,
  });

  return [
    {
      id: '1',
      name: 'Beginner Strength',
      description: 'Full body strength starter program.',
      duration: 45,
      level: 'beginner',
      exercises: [toExercise(exercises[0]!), toExercise(exercises[1]!), toExercise(exercises[2]!)],
    },
    {
      id: '2',
      name: 'Intermediate Cardio',
      description: 'Cardio-focused weekly routine.',
      duration: 35,
      level: 'intermediate',
      exercises: [toExercise(exercises[3]!), toExercise(exercises[4]!), toExercise(exercises[5]!)],
    },
    {
      id: '3',
      name: 'Advanced HIIT',
      description: 'Short, intense HIIT sessions.',
      duration: 25,
      level: 'advanced',
      exercises: [toExercise(exercises[6]!), toExercise(exercises[7]!), toExercise(exercises[8]!)],
    },
  ];
};

const buildOfflineExercises = (): ExerciseApiResponse[] => {
  const fallback: ExerciseApiResponse[] = [
    { id: 1, name: 'Push Up', equipment: null, body_part: 'upper body', exercise_type: 'strength' },
    { id: 2, name: 'Squat', equipment: null, body_part: 'lower body', exercise_type: 'strength' },
    { id: 3, name: 'Plank', equipment: null, body_part: 'core', exercise_type: 'strength' },
    { id: 4, name: 'Running', equipment: null, body_part: 'full body', exercise_type: 'cardio' },
    { id: 5, name: 'Cycling', equipment: 'bike', body_part: 'lower body', exercise_type: 'cardio' },
    { id: 6, name: 'Jump Rope', equipment: 'rope', body_part: 'full body', exercise_type: 'cardio' },
    { id: 7, name: 'Burpee', equipment: null, body_part: 'full body', exercise_type: 'hiit' },
    { id: 8, name: 'Mountain Climbers', equipment: null, body_part: 'core', exercise_type: 'hiit' },
    { id: 9, name: 'Lunges', equipment: null, body_part: 'lower body', exercise_type: 'strength' },
  ];

  if (!Array.isArray(exercisesMock) || !exercisesMock.length) return fallback;

  return exercisesMock.map((e: any, index: number) => ({
    id: Number(e.id ?? index + 1),
    name: String(e.name ?? `Exercise ${index + 1}`),
    equipment: null,
    body_part: e.category ? String(e.category).toLowerCase() : null,
    exercise_type: e.difficulty ? String(e.difficulty).toLowerCase() : null,
  }));
};

const pickById = <T extends { id: any }>(items: T[], id: string): T | undefined => {
  return items.find((item) => String(item.id) === String(id));
};

const parseIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/(\d+)(\?.*)?$/);
  return match?.[1] ?? null;
};

export async function mockApiRequest<T>(
  method: MockHttpMethod,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const cleanUrl = url.split('?')[0];

  // Admin auth
  if (method === 'GET' && cleanUrl === '/api/admin/me') {
    return ({ id: 1, adminId: 1, email: 'admin@offline.local' } as unknown) as T;
  }
  if (method === 'POST' && cleanUrl === '/api/admin/login') {
    const email = String((data as any)?.email ?? 'admin@offline.local');
    return ({ id: 1, adminId: 1, email } as unknown) as T;
  }
  if (method === 'POST' && cleanUrl === '/api/admin/register') {
    const email = String((data as any)?.email ?? 'admin@offline.local');
    return ({ id: 1, adminId: 1, email } as unknown) as T;
  }
  if (method === 'POST' && cleanUrl === '/api/admin/logout') {
    return ({ ok: true } as unknown) as T;
  }

  // Enterprise auth
  if (method === 'POST' && cleanUrl === API_ENDPOINTS.enterprise.auth.login) {
    const email = String((data as any)?.email ?? 'enterprise@offline.local');
    return ({ enterpriseId: 1, slug: 'offline-enterprise', email, name: 'Offline Enterprise', sector: 'offline' } as unknown) as T;
  }
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.enterprise.auth.me) {
    return ({ enterpriseId: 1, slug: 'offline-enterprise', email: 'enterprise@offline.local', name: 'Offline Enterprise', sector: 'offline' } as unknown) as T;
  }
  if (method === 'POST' && cleanUrl === API_ENDPOINTS.enterprise.auth.logout) {
    return (undefined as unknown) as T;
  }

  // Password reset flows (best-effort support for offline)
  if (method === 'POST' && (cleanUrl === API_ENDPOINTS.auth.forgotPassword || cleanUrl === '/api/password/forgot')) {
    return ({ ok: true } as unknown) as T;
  }
  if (method === 'POST' && cleanUrl === API_ENDPOINTS.auth.resetPassword) {
    return ({ ok: true } as unknown) as T;
  }

  // Dashboard
  if (method === 'GET' && (cleanUrl === API_ENDPOINTS.admin.dashboard || cleanUrl === API_ENDPOINTS.enterprise.dashboard)) {
    return (buildOfflineDashboard() as unknown) as T;
  }

  // Analytics (2 entry points exist in the codebase)
  if (
    method === 'GET' &&
    (cleanUrl === API_ENDPOINTS.admin.analytics || cleanUrl === API_ENDPOINTS.enterprise.analytics || cleanUrl === API_ENDPOINTS.analytics.features)
  ) {
    return (buildOfflineAnalytics() as unknown) as T;
  }

  // Users
  if (method === 'GET' && (cleanUrl === API_ENDPOINTS.users.list || cleanUrl === API_ENDPOINTS.enterprise.users.list)) {
    return (buildOfflineUsers() as unknown) as T;
  }
  if (method === 'GET' && (cleanUrl.startsWith('/api/utilisateurs/') || cleanUrl.startsWith('/api/enterprise/users/'))) {
    const id = parseIdFromUrl(cleanUrl);
    const users = buildOfflineUsers();
    const user = id ? pickById(users, id) : undefined;
    if (!user) throw new OfflineApiError('Utilisateur introuvable (offline)');
    return (user as unknown) as T;
  }

  // Recommendations
  if (method === 'GET' && (cleanUrl === API_ENDPOINTS.recommendations.list || cleanUrl === API_ENDPOINTS.enterprise.recommendations.list)) {
    const items = buildOfflineRecommendations();
    const params = (config as any)?.params ?? {};
    const q = typeof params.q === 'string' ? params.q.trim().toLowerCase() : '';
    const type = typeof params.type === 'string' ? params.type.trim().toLowerCase() : '';

    const filtered = items.filter((r) => {
      if (type && String(r.type).toLowerCase() !== type) return false;
      if (q && !String(r.details).toLowerCase().includes(q)) return false;
      return true;
    });

    return (filtered as unknown) as T;
  }
  if (method === 'GET' && (cleanUrl.startsWith('/api/recommendations/') || cleanUrl.startsWith('/api/enterprise/recommendations/'))) {
    const id = parseIdFromUrl(cleanUrl);
    const items = buildOfflineRecommendations();
    const rec = id ? pickById(items, id) : undefined;
    if (!rec) throw new OfflineApiError('Recommandation introuvable (offline)');
    return (rec as unknown) as T;
  }
  if (method === 'POST' && (cleanUrl === API_ENDPOINTS.recommendations.generate || cleanUrl === API_ENDPOINTS.recommendations.generateBulk)) {
    return ({ usersCount: 5, createdCount: 5, skippedCount: 0 } as unknown) as T;
  }

  // Nutrition
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.nutrition.foods) {
    return ((foodsMock as unknown) as T);
  }
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.nutrition.analytics) {
    return (buildOfflineNutritionAnalytics() as unknown) as T;
  }

  // Partners
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.partners.list) {
    return (buildOfflinePartners() as unknown) as T;
  }
  if (method === 'GET' && cleanUrl.startsWith('/api/partners/')) {
    const id = parseIdFromUrl(cleanUrl);
    const items = buildOfflinePartners();
    const partner = id ? pickById(items, id) : undefined;
    if (!partner) throw new OfflineApiError('Partenaire introuvable (offline)');
    return (partner as unknown) as T;
  }

  // Settings
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.settings.general) {
    return (readStoredSettings() as unknown) as T;
  }
  if (method === 'PUT' && cleanUrl === API_ENDPOINTS.settings.general) {
    return (writeStoredSettings((data as unknown) as Settings) as unknown) as T;
  }

  // Sport
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.sport.exercises) {
    return (buildOfflineExercises() as unknown) as T;
  }
  if (method === 'GET' && cleanUrl === API_ENDPOINTS.sport.programs) {
    return (buildOfflinePrograms() as unknown) as T;
  }
  if (method === 'GET' && cleanUrl.startsWith('/api/programs/')) {
    const id = parseIdFromUrl(cleanUrl);
    const items = buildOfflinePrograms();
    const program = id ? pickById(items, id) : undefined;
    if (!program) throw new OfflineApiError('Programme introuvable (offline)');
    return (program as unknown) as T;
  }

  // Fallback
  throw new OfflineApiError(`No offline mock for ${method} ${url}`);
}
