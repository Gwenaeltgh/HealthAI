import { useQuery } from '@tanstack/react-query';
import { fetchAndAdaptSportPrograms } from '../api/sportAdapter';
import { Program } from '../types';

export const usePrograms = () => {
  const { data, error, isLoading } = useQuery<Program[], Error>({
    queryKey: ['programs'],
    queryFn: fetchAndAdaptSportPrograms,
  });

  return {
    programs: data ?? [],
    isLoading,
    error,
  };
};

export default usePrograms;