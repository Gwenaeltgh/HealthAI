import { useQuery } from '@tanstack/react-query';
import { fetchPartners } from '../api/partnersApi';
import { Partner } from '../types';

export const usePartners = () => {
  const { data, error, isLoading } = useQuery<Partner[], Error>({
    queryKey: ['partners'],
    queryFn: fetchPartners,
  });

  return {
    partners: data ?? [],
    error,
    isLoading,
  };
};

export default usePartners;