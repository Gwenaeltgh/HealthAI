import type { DailyNutrition, MealEntry } from '@/types';

const emptyDaily = (date: string): DailyNutrition => ({
  date,
  consumed: 0,
  target: 2000,
  burned: 0,
  meals: [
    { id: 'm1', userId: '1', type: 'breakfast', date, totalCalories: 0, entries: [] },
    { id: 'm2', userId: '1', type: 'lunch', date, totalCalories: 0, entries: [] },
    { id: 'm3', userId: '1', type: 'dinner', date, totalCalories: 0, entries: [] },
    { id: 'm4', userId: '1', type: 'snack', date, totalCalories: 0, entries: [] },
  ],
  macros: {
    protein: { value: 0, target: 120 },
    carbs: { value: 0, target: 250 },
    fat: { value: 0, target: 65 },
    fiber: { value: 0, target: 30 },
  },
});

export const journalService = {
  // 📅 GET DAILY
  async getDaily(date: string): Promise<DailyNutrition> {
    return emptyDaily(date);
  },

  // ➕ ADD ENTRY (logique minimale uniquement)
  async addEntry(
    _mealId: string,
    entry: Omit<MealEntry, 'id'>
  ): Promise<MealEntry> {
    return {
      ...entry,
      id: Date.now().toString(),
    };
  },

  // ❌ REMOVE ENTRY
  async removeEntry(
    _mealId: string,
    _entryId: string
  ): Promise<void> {
    return;
  },
};