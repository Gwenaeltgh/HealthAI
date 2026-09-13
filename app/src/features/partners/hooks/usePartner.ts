import { useQuery } from '@tanstack/react-query';
import { fetchPartnerById } from '../api/partnersApi';
import { Partner } from '../types';

export const usePartner = (partnerId?: string) => {
  const { data, error, isLoading } = useQuery<Partner, Error>({
    queryKey: ['partner', partnerId],
    queryFn: async () => {
      if (!partnerId) {
        throw new Error('Missing partnerId');
      }
      return fetchPartnerById(partnerId);
    },
    enabled: Boolean(partnerId),
  });

  return {
    partner: data ?? null,
    error,
    isLoading,
  };
};

export default usePartner;