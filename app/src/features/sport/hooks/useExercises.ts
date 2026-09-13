import { useQuery } from '@tanstack/react-query';
import { fetchExercises } from '../api/sportApi';
import { Exercise } from '../types';

export const useExercises = () => {
  const { data, error, isLoading } = useQuery<Exercise[], Error>({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
  });

  return {
    exercises: data ?? [],
    isLoading,
    error,
  };
};

export default useExercises;