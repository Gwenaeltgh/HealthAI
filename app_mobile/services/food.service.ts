// services/food.service.ts

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image?: string;
  
}

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

function safeCalories(nutriments: any): number {
  const kcal = nutriments?.['energy-kcal_100g'];

  if (typeof kcal === 'number') return Math.round(kcal);

  // fallback kJ → kcal
  const energyKj = nutriments?.['energy_100g'];
  if (typeof energyKj === 'number') return Math.round(energyKj / 4.184);

  return 0;
}

function safeNumber(value: any): number {
  return typeof value === 'number' ? Math.round(value) : 0;
}

export const foodService = {
  /**
   * Recherche des aliments par nom
   */
  async searchFoods(query: string, page: number = 1): Promise<FoodItem[]> {
    try {
      if (!query.trim()) return [];

      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query
        )}&search_simple=1&action=process&json=1&page_size=20`
      );

      if (!res.ok) {
        throw new Error(`Search API error: ${res.status}`);
      }

      const data = await res.json();

      const products = data.products || [];

      return products
        .map((item: any): FoodItem => {
          const nutriments = item.nutriments || {};

          return {
            id: item.code || item._id || 'unknown',
            name: item.product_name || item.generic_name || 'Unnamed product',
            calories: safeCalories(nutriments),
            protein: safeNumber(nutriments.proteins_100g),
            carbs: safeNumber(nutriments.carbohydrates_100g),
            fat: safeNumber(nutriments.fat_100g),
            image: item.image_front_url || undefined,
          };
        })
        .filter((item: FoodItem) => item.name && item.name.trim().length > 0);
    } catch (error) {
      console.log('OpenFoodFacts search error:', error);
      return [];
    }
  },

  /**
   * Récupère un produit via barcode
   */
  async getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/product/${barcode}.json`
      );

      if (!res.ok) {
        throw new Error(`Barcode API error: ${res.status}`);
      }

      const data = await res.json();

      if (!data?.product) return null;

      const item = data.product;
      const nutriments = item.nutriments || {};

      return {
        id: item.code || item._id || barcode,
        name: item.product_name || item.generic_name || 'Unnamed product',
        calories: safeCalories(nutriments),
        protein: safeNumber(nutriments.proteins_100g),
        carbs: safeNumber(nutriments.carbohydrates_100g),
        fat: safeNumber(nutriments.fat_100g),
        image: item.image_front_url || undefined,
      };
    } catch (error) {
      console.log('OpenFoodFacts barcode error:', error);
      return null;
    }
  },
};