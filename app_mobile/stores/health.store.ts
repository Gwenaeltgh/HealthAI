import { create } from 'zustand';
import type { Recommendation, WeightEntry } from '@/types';
import { healthService } from '@/services/health.service';

interface HealthState {
  recommendations: Recommendation[];
  weightHistory: WeightEntry[];
  isLoading: boolean;

  loadRecommendations: () => Promise<void>;
  loadWeightHistory: () => Promise<void>;
  addWeightEntry: (weight: number, note?: string) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  recommendations: [],
  weightHistory: [],
  isLoading: false,

  loadRecommendations: async () => {
    set({ isLoading: true });
    const recommendations = await healthService.getRecommendations();
    set({ recommendations, isLoading: false });
  },

  loadWeightHistory: async () => {
    const weightHistory = await healthService.getWeightHistory();
    set({ weightHistory });
  },

  addWeightEntry: async (weight, note) => {
    const entry = await healthService.addWeightEntry(weight, note);
    set({ weightHistory: [...get().weightHistory, entry] });
  },
}));
