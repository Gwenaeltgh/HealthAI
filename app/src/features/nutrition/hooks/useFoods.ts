import { useQuery } from '@tanstack/react-query';
import { fetchFoods } from '../api/nutritionApi';
import { Food } from '../types';

export const useFoods = () => {
  const { data, error, isLoading } = useQuery<Food[], Error>({
    queryKey: ['foods'],
    queryFn: fetchFoods,
  });

  return {
    foods: data ?? [],
    isLoading,
    error,
  };
};

export default useFoods;