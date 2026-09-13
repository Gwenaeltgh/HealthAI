import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/usersApi';
import { User } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useUser = (userId?: string) => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const { data, error, isLoading } = useQuery<User, Error>({
    queryKey: ['user', userId, user?.role ?? 'anonymous', companyId ?? 'all'],
    queryFn: async () => {
      if (!userId) {
        throw new Error('Missing userId');
      }
      return fetchUserById(userId, companyId);
    },
    enabled: Boolean(userId),
  });

  return {
    user: data ?? null,
    isLoading,
    error,
  };
};

export default useUser;