import { Recommendation } from '../types';
import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';

const adaptMock = (r: any): Recommendation => {
  const now = new Date().toISOString();
  return {
    id: String(r.id),
    userId: String(r.userId ?? 'unknown'),
    type: r.type,
    details: String(r.detail ?? r.details ?? ''),
    confidenceLevel: typeof r.confidenceLevel === 'number' ? r.confidenceLevel : undefined,
    createdAt: String(r.date ?? r.createdAt ?? now),
    updatedAt: String(r.date ?? r.updatedAt ?? now),
  };
};

export const fetchRecommendations = async (companyId?: string): Promise<Recommendation[]> => {
  return fetchRecommendationsFiltered({ companyId });
};

export type RecommendationsFilters = {
  companyId?: string;
  type?: string;
  q?: string;
  periodDays?: number;
  from?: string;
  to?: string;
  enterpriseId?: number;
};

export const fetchRecommendationsFiltered = async (filters?: RecommendationsFilters): Promise<Recommendation[]> => {
  const companyId = filters?.companyId;
  const url = companyId ? API_ENDPOINTS.enterprise.recommendations.list : API_ENDPOINTS.recommendations.list;
  const params = {
    dedupe: 1,
    type: filters?.type || undefined,
    q: filters?.q || undefined,
    periodDays: filters?.periodDays ?? undefined,
    from: filters?.from || undefined,
    to: filters?.to || undefined,
    enterpriseId: companyId ? undefined : filters?.enterpriseId ?? undefined,
  };

  return apiClient.get<Recommendation[]>(url, { params });
};

export const fetchRecommendation = async (id: string, companyId?: string): Promise<Recommendation> => {
  if (companyId) {
    return apiClient.get<Recommendation>(API_ENDPOINTS.enterprise.recommendations.detail(id));
  }

  return apiClient.get<Recommendation>(API_ENDPOINTS.recommendations.detail(id));
};

export const generateRecommendations = async (payload: unknown): Promise<unknown> => {
  return apiClient.post(API_ENDPOINTS.recommendations.generate, payload);
};

export type BulkRecommendationsResult = {
  usersCount: number;
  createdCount: number;
  skippedCount: number;
  errors?: Array<{ userId: string | number; type?: string; error: string }>;
};

export const generateRecommendationsForAllUsers = async (payload?: unknown): Promise<BulkRecommendationsResult> => {
  return apiClient.post<BulkRecommendationsResult, unknown>(API_ENDPOINTS.recommendations.generateBulk, payload ?? {});
};