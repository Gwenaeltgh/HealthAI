import type { FoodItem } from '@/types/food';

interface RecommendationInput {
  remainingCalories: number;
  remainingProtein: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const recommendationService = {
  generate(foods: FoodItem[], input: RecommendationInput): FoodItem[] {
    return foods
      .filter(food => {
        if (food.calories > input.remainingCalories) return false;

        if (
          input.remainingProtein > 20 &&
          food.protein < 10
        ) return false;

        return true;
      })
      .sort((a, b) => b.protein - a.protein)
      .slice(0, 10);
  },
};