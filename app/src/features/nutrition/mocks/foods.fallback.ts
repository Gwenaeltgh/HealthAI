import { Food } from '../types';

// Rich fallback dataset for premium UI (frontend-only).
// Used when real API is disabled or returns too few foods.
export const foodsFallback: Food[] = [
  { id: 'f-1', name: 'Poulet grillé (100g)', category: 'protein', calories: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
  { id: 'f-2', name: 'Saumon (100g)', category: 'protein', calories: 208, protein: 20, carbohydrates: 0, fat: 13 },
  { id: 'f-3', name: 'Tofu ferme (100g)', category: 'protein', calories: 144, protein: 17, carbohydrates: 3, fat: 9 },
  { id: 'f-4', name: 'Yaourt grec (150g)', category: 'protein', calories: 150, protein: 15, carbohydrates: 6, fat: 7 },

  { id: 'f-5', name: 'Riz basmati (100g)', category: 'carbs', calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3 },
  { id: 'f-6', name: 'Pâtes complètes (100g)', category: 'carbs', calories: 148, protein: 5.8, carbohydrates: 29, fat: 1.2 },
  { id: 'f-7', name: 'Quinoa cuit (100g)', category: 'carbs', calories: 120, protein: 4.4, carbohydrates: 21, fat: 1.9 },
  { id: 'f-8', name: 'Patate douce (150g)', category: 'carbs', calories: 135, protein: 2.2, carbohydrates: 31, fat: 0.2 },

  { id: 'f-9', name: 'Avocat (100g)', category: 'fat', calories: 160, protein: 2, carbohydrates: 9, fat: 15 },
  { id: 'f-10', name: 'Amandes (30g)', category: 'fat', calories: 173, protein: 6.3, carbohydrates: 6.1, fat: 15 },
  { id: 'f-11', name: 'Huile d’olive (10g)', category: 'fat', calories: 88, protein: 0, carbohydrates: 0, fat: 10 },
  { id: 'f-12', name: 'Beurre de cacahuète (20g)', category: 'fat', calories: 118, protein: 5, carbohydrates: 4, fat: 10 },

  { id: 'f-13', name: 'Salade César (portion)', category: 'mixed', calories: 320, protein: 18, carbohydrates: 12, fat: 22 },
  { id: 'f-14', name: 'Bowl poulet quinoa (portion)', category: 'mixed', calories: 540, protein: 38, carbohydrates: 52, fat: 18 },
  { id: 'f-15', name: 'Omelette (2 œufs)', category: 'mixed', calories: 220, protein: 14, carbohydrates: 2, fat: 17 },
  { id: 'f-16', name: 'Sandwich thon (portion)', category: 'mixed', calories: 410, protein: 28, carbohydrates: 44, fat: 12 },

  { id: 'f-17', name: 'Brocoli (100g)', category: 'mixed', calories: 55, protein: 4, carbohydrates: 11, fat: 0.6 },
  { id: 'f-18', name: 'Épinards (100g)', category: 'mixed', calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4 },
  { id: 'f-19', name: 'Tomates (150g)', category: 'mixed', calories: 27, protein: 1.3, carbohydrates: 6, fat: 0.3 },
  { id: 'f-20', name: 'Carottes (150g)', category: 'mixed', calories: 62, protein: 1.4, carbohydrates: 14, fat: 0.3 },

  { id: 'f-21', name: 'Pomme (150g)', category: 'carbs', calories: 78, protein: 0.4, carbohydrates: 21, fat: 0.2 },
  { id: 'f-22', name: 'Banane (120g)', category: 'carbs', calories: 105, protein: 1.3, carbohydrates: 27, fat: 0.3 },
  { id: 'f-23', name: 'Fruits rouges (150g)', category: 'carbs', calories: 64, protein: 1.2, carbohydrates: 15, fat: 0.5 },

  { id: 'f-24', name: 'Steak haché 5% (100g)', category: 'protein', calories: 137, protein: 21, carbohydrates: 0, fat: 5 },
  { id: 'f-25', name: 'Dinde (100g)', category: 'protein', calories: 135, protein: 29, carbohydrates: 0, fat: 1.6 },

  { id: 'f-26', name: 'Flocons d’avoine (40g)', category: 'carbs', calories: 152, protein: 5.2, carbohydrates: 27, fat: 2.8 },
  { id: 'f-27', name: 'Pain complet (50g)', category: 'carbs', calories: 124, protein: 4.8, carbohydrates: 23, fat: 1.7 },

  { id: 'f-28', name: 'Fromage blanc (150g)', category: 'protein', calories: 110, protein: 12, carbohydrates: 7, fat: 3 },
  { id: 'f-29', name: 'Noix (20g)', category: 'fat', calories: 131, protein: 3, carbohydrates: 3, fat: 13 },

  { id: 'f-30', name: 'Soupe légumes (bol)', category: 'mixed', calories: 180, protein: 6, carbohydrates: 26, fat: 6 },
];

export const getFoodsFallback = (): Food[] => foodsFallback;
