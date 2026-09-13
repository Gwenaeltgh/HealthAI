import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/usersApi';
import { User } from '../types';
import { useAuth } from '../../auth/hooks/useAuth';

export const useUsers = () => {
  const { user } = useAuth();
  const companyId = user?.role === 'enterprise' ? user.companyId : undefined;

  const { data, error, isLoading } = useQuery<User[], Error>({
    queryKey: ['users', user?.role ?? 'anonymous', companyId ?? 'all'],
    queryFn: () => fetchUsers(companyId),
  });

  return {
    users: data ?? [],
    isLoading,
    error,
  };
};