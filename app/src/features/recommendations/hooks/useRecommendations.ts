import { useQuery } from '@tanstack/react-query';
import { fetchRecommendationsFiltered, type RecommendationsFilters } from '../api/recommendationsApi';
import { Recommendation } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useRecommendations = (filters?: Omit<RecommendationsFilters, 'companyId'>) => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const normalizedFilters = {
    type: filters?.type || undefined,
    q: filters?.q || undefined,
    periodDays: filters?.periodDays ?? undefined,
    from: filters?.from || undefined,
    to: filters?.to || undefined,
    enterpriseId: filters?.enterpriseId ?? undefined,
  } as const;

  const { data, error, isLoading, refetch, isFetching } = useQuery<Recommendation[], Error>({
    queryKey: ['recommendations', user?.role ?? 'anonymous', companyId ?? 'all', normalizedFilters],
    queryFn: () => fetchRecommendationsFiltered({ companyId, ...normalizedFilters }),
  });

  return {
    recommendations: data ?? [],
    isLoading,
    error,
    refetch,
    isFetching,
  };
};

export default useRecommendations;