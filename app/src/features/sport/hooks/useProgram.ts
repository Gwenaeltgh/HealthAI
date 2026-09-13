import { useQuery } from '@tanstack/react-query';
import { fetchProgram } from '../api/sportApi';
import { adaptSportPrograms } from '../api/sportAdapter';
import { Program } from '../types';

export const useProgram = (programId?: string) => {
  const { data, error, isLoading } = useQuery<Program, Error>({
    queryKey: ['program', programId],
    queryFn: async () => {
      if (!programId) {
        throw new Error('Missing programId');
      }
      const raw = await fetchProgram(programId);
      return adaptSportPrograms([raw])[0];
    },
    enabled: Boolean(programId),
  });

  return {
    program: data ?? null,
    isLoading,
    error,
  };
};

export default useProgram;