import { useQuery } from '@tanstack/react-query';
import { fetchNutritionAnalytics } from '../api/nutritionApi';
import { NutritionAnalyticsData } from '../types';

export const useNutritionAnalytics = () => {
  const { data, error, isLoading } = useQuery<NutritionAnalyticsData, Error>({
    queryKey: ['nutritionAnalytics'],
    queryFn: fetchNutritionAnalytics,
  });

  return {
    data,
    error,
    isLoading,
  };
};

export default useNutritionAnalytics;