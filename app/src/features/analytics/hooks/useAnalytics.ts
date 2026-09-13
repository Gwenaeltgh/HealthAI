import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsData } from '../api/analyticsApi';
import { AnalyticsData } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useAnalytics = () => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const { data, error, isLoading } = useQuery<AnalyticsData, Error>({
    queryKey: ['analyticsData', user?.role ?? 'anonymous', companyId ?? 'all'],
    queryFn: () => fetchAnalyticsData(companyId),
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useAnalytics;