import { useQuery } from '@tanstack/react-query';
import { fetchRecommendation } from '../api/recommendationsApi';
import { Recommendation } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useRecommendation = (id?: string) => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const { data, error, isLoading } = useQuery<Recommendation, Error>({
    queryKey: ['recommendation', id, user?.role ?? 'anonymous', companyId ?? 'all'],
    queryFn: async () => {
      if (!id) {
        throw new Error('Missing recommendation id');
      }
      return fetchRecommendation(id, companyId);
    },
    enabled: Boolean(id),
  });

  return {
    recommendation: data ?? null,
    isLoading,
    error,
  };
};

export default useRecommendation;