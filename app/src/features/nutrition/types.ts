export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  category: string;
}

export interface NutritionAnalyticsData {
  totalFoods: number;
  averageCalories: number;
  averageMacros: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  caloriesSeries: Array<{ name: string; value: number }>;
}