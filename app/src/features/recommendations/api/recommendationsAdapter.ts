import { Recommendation } from '../types';

export const adaptRecommendations = (data: any[]): Recommendation[] => {
    return data.map((item: any) => ({
        id: String(item.id),
        type: item.type,
        userId: String(item.userId ?? item.userId ?? 'unknown'),
        date: item.date ?? item.createdAt ?? new Date().toISOString(),
        confidenceLevel: item.confidenceLevel ?? item.confidence ?? undefined,
        details: item.details ?? item.detail ?? {},
        createdAt: item.createdAt ?? item.date ?? new Date().toISOString(),
        updatedAt: item.updatedAt ?? new Date().toISOString(),
    }));
};