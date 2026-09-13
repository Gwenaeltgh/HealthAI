import type { Recommendation, WeightEntry } from '@/types';

// TODO: import { apiClient } from './api';

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'repas', tag: 'Repas', tagBg: '#E0F5F2', tagColor: '#2EC4B6', type: 'meal',
    title: 'Salade Énergisante',
    description: 'Riche en fer et vitamines pour contrer ta légère fatigue matinale.',
    cta: 'Voir la recette',
  },
  {
    id: 'sport', tag: 'Sport', tagBg: '#DAE2FF', tagColor: '#5A627B', type: 'sport',
    title: 'Marche Active 20 min',
    description: "Idéal pour atteindre ton objectif de pas sans forcer après l'entraînement d'hier.",
    cta: "Lancer l'activité",
  },
  {
    id: 'wellbeing', tag: 'Bien-être', tagBg: '#FFDBCE', tagColor: '#9A4520', type: 'wellbeing',
    title: 'Cohérence Cardiaque',
    description: '5 minutes pour réduire le stress détecté dans ton rythme hier soir.',
    cta: 'Commencer',
  },
];

const MOCK_WEIGHT: WeightEntry[] = [
  { id: 'w1', userId: '1', weight: 80, date: '2024-07-01' },
  { id: 'w2', userId: '1', weight: 77, date: '2024-08-01' },
  { id: 'w3', userId: '1', weight: 75, date: '2024-09-01' },
  { id: 'w4', userId: '1', weight: 74, date: '2024-10-01' },
];

export const healthService = {
  async getRecommendations(): Promise<Recommendation[]> {
    // TODO: return (await apiClient.get('/recommendations')).data;
    await new Promise(r => setTimeout(r, 300));
    return MOCK_RECOMMENDATIONS;
  },

  async getWeightHistory(): Promise<WeightEntry[]> {
    // TODO: return (await apiClient.get('/weight')).data;
    return MOCK_WEIGHT;
  },

  async addWeightEntry(weight: number, note?: string): Promise<WeightEntry> {
    // TODO: return (await apiClient.post('/weight', { weight, note })).data;
    const entry: WeightEntry = {
      id: Date.now().toString(), userId: '1',
      weight, note,
      date: new Date().toISOString().split('T')[0],
    };
    return entry;
  },
};
