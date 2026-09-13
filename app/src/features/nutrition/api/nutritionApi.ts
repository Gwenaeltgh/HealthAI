import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { Food, NutritionAnalyticsData } from '../types';

type FoodApiResponse = {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

const adaptFood = (f: FoodApiResponse): Food => {
  return {
    id: String(f.id),
    name: f.name,
    category: f.category,
    calories: Number(f.calories ?? 0),
    protein: Number(f.protein ?? 0),
    carbohydrates: Number(f.carbohydrates ?? 0),
    fat: Number(f.fat ?? 0),
  };
};

export const fetchFoods = async (): Promise<Food[]> => {
  const response = await apiClient.get<FoodApiResponse[]>(API_ENDPOINTS.nutrition.foods);
  const data = (response as unknown) as FoodApiResponse[];
  return data.map(adaptFood);
};

export const fetchNutritionAnalytics = async (): Promise<NutritionAnalyticsData> => {
  return apiClient.get<NutritionAnalyticsData>(API_ENDPOINTS.nutrition.analytics);
};