import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/dashboardApi';
import { DashboardData } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useDashboard = () => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const { data, error, isLoading, isFetching, refetch } = useQuery<DashboardData, Error>({
    queryKey: ['dashboardData', user?.role ?? 'anonymous', companyId ?? 'all'],
    queryFn: () => fetchDashboardData(companyId),
  });

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
};

export default useDashboard;