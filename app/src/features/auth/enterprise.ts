import type { AuthUser } from './AuthProvider';

export type EnterpriseSession = {
  enterpriseId: number;
  slug: string;
  email: string;
  name: string;
  sector?: string | null;
};

export type EnterpriseLoginCredentials = {
  email: string;
  password: string;
};

const hashString = (value: string) => {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
};

export const scopeItemsByCompany = <T>(items: T[], companyId: string, getItemKey: (item: T) => string | number) => {
  if (!companyId) return items;

  const bucket = hashString(companyId) % 3;
  const scoped = items.filter((item) => hashString(`${companyId}:${String(getItemKey(item))}`) % 3 === bucket);

  return scoped.length ? scoped : items;
};

export const toEnterpriseAuthUser = (session: EnterpriseSession): AuthUser => ({
  id: String(session.enterpriseId),
  email: session.email,
  role: 'enterprise',
  name: session.name,
  companyId: session.slug,
  companyName: session.name,
  sector: session.sector ?? undefined,
});