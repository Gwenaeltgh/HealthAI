const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return undefined;
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return undefined;
};

export type AppProfile = 'complete' | 'offline' | 'performance';

type ViteEnvLike = Record<string, unknown>;

export const getAppProfileFrom = (
  env: ViteEnvLike,
  mode: string | undefined,
): AppProfile => {
  const explicit = String(env.VITE_APP_PROFILE ?? '').trim().toLowerCase();
  const normalizedMode = String(mode ?? '').trim().toLowerCase();

  const value = explicit || normalizedMode;

  if (value === 'offline') return 'offline';
  if (value === 'performance') return 'performance';
  return 'complete';
};

export const getAppProfile = (): AppProfile => {
  return getAppProfileFrom(import.meta.env, import.meta.env.MODE);
};

export const isOfflineProfile = () => getAppProfile() === 'offline';
export const isPerformanceProfile = () => getAppProfile() === 'performance';

export const isRealApiEnabledFrom = (
  env: ViteEnvLike,
  mode: string | undefined,
) => {
  if (getAppProfileFrom(env, mode) === 'offline') return false;
  // Default to real API to avoid silently falling back to mocks.
  const parsed = parseBoolean(env.VITE_USE_REAL_API);
  return parsed ?? true;
};

export const isRealApiEnabled = () => {
  return isRealApiEnabledFrom(import.meta.env, import.meta.env.MODE);
};
