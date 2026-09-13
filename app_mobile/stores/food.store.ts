import { create } from 'zustand';
import type { FoodItem } from '@/types/food';
import { foodService } from '@/services/food.service';

interface FoodState {
  foods: FoodItem[];
  selectedFood: FoodItem | null;
  isLoading: boolean;
  error: string | null;

  searchFoods: (query: string) => Promise<void>;
  getFoodByBarcode: (barcode: string) => Promise<void>;
  setSelectedFood: (food: FoodItem | null) => void;
}

let currentRequest = 0;

export const useFoodStore = create<FoodState>((set) => ({
  foods: [],
  selectedFood: null,
  isLoading: false,
  error: null,

  searchFoods: async (query: string) => {
    const requestId = ++currentRequest;

    try {
      set({
        isLoading: true,
        error: null,
        selectedFood: null,
      });

      const foods = await foodService.searchFoods(query);

      if (requestId !== currentRequest) return;

      set({ foods });
    } catch (error) {
      if (requestId !== currentRequest) return;

      set({
        foods: [],
        error: 'Erreur lors de la recherche des aliments',
      });
    } finally {
      if (requestId === currentRequest) {
        set({ isLoading: false });
      }
    }
  },

  getFoodByBarcode: async (barcode: string) => {
    try {
      set({
        isLoading: true,
        error: null,
        selectedFood: null,
      });

      const food = await foodService.getFoodByBarcode(barcode);

      set({ selectedFood: food });
    } catch (error) {
      set({
        selectedFood: null,
        error: 'Erreur lors du scan du produit',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedFood: (food) => {
    set({ selectedFood: food });
  },
}));