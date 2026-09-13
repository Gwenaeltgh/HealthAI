import { NutritionAnalyticsData } from '../types';
import { fetchNutritionAnalytics } from './nutritionApi';

export const nutritionAdapter = async (): Promise<NutritionAnalyticsData> => {
  return fetchNutritionAnalytics();
};