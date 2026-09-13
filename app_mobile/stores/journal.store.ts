import { create } from 'zustand';
import type { DailyNutrition, MealEntry } from '@/types';
import type { FoodItem } from '@/types/food';
import { journalService } from '@/services/journal.service';

interface JournalState {
  daily: DailyNutrition | null;
  searchResults: FoodItem[];
  isLoading: boolean;
  error: string | null;

  loadDaily: (date?: string) => Promise<void>;
  searchFoods: (query: string) => Promise<void>;
  addEntry: (mealId: string, entry: Omit<MealEntry, 'id'>) => Promise<void>;
  removeEntry: (mealId: string, entryId: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  daily: null,
  searchResults: [],
  isLoading: false,
  error: null,

  // 📅 load day
  loadDaily: async (date) => {
    try {
      set({ isLoading: true, error: null });

      const d = date ?? new Date().toISOString().split('T')[0];
      const daily = await journalService.getDaily(d);

      set({ daily });
    } catch (e) {
      set({ error: 'Erreur chargement journal' });
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔍 search foods (⚠️ OK temporaire mais idéalement foodService)
  searchFoods: async (query) => {
    try {
      const results = await journalService.searchFoods(query);
      set({ searchResults: results ?? [] });
    } catch (e) {
      set({ searchResults: [] });
    }
  },

  // ➕ add entry
  addEntry: async (mealId, entry) => {
    try {
      const newEntry = await journalService.addEntry(mealId, entry);

      const daily = get().daily;
      if (!daily) return;

      set({
        daily: {
          ...daily,
          consumed: daily.consumed + newEntry.calories,
          meals: daily.meals.map((m) =>
            m.id === mealId
              ? {
                  ...m,
                  entries: [...m.entries, newEntry],
                  totalCalories: m.totalCalories + newEntry.calories,
                }
              : m
          ),
        },
      });
    } catch (e) {
      set({ error: 'Erreur ajout aliment' });
    }
  },

  // ❌ remove entry
  removeEntry: async (mealId, entryId) => {
    try {
      await journalService.removeEntry(mealId, entryId);

      const daily = get().daily;
      if (!daily) return;

      set({
        daily: {
          ...daily,
          meals: daily.meals.map((m) => {
            if (m.id !== mealId) return m;

            const removed = m.entries.find((e) => e.id === entryId);

            return {
              ...m,
              entries: m.entries.filter((e) => e.id !== entryId),
              totalCalories:
                m.totalCalories - (removed?.calories ?? 0),
            };
          }),
        },
      });
    } catch (e) {
      set({ error: 'Erreur suppression aliment' });
    }
  },
}));