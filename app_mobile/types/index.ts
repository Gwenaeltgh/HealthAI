// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;

  goal: 'perte' | 'maintien' | 'gain';

  currentWeight: number;
  targetWeight: number;
  startWeight: number;
  height: number;
  age: number;

  activityLevel:
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very_active';

  plan: 'free' | 'premium';
  memberSince: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─────────────────────────────────────────────────────────────
// FOOD (UNIFIÉ - IMPORTANT)
// ─────────────────────────────────────────────────────────────

export interface Food {
  id: string;
  name: string;

  category?: string;

  calories: number;
  protein: number;
  carbs: number;
  fat: number;

  fiber?: number;

  image?: string;

  servingSize?: number;
  servingUnit?: string;
}

// ─────────────────────────────────────────────────────────────
// JOURNAL / MEALS
// ─────────────────────────────────────────────────────────────

export interface MealEntry {
  id: string;

  foodId: string;
  foodName: string;

  quantity: number;
  unit: string;

  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  userId: string;

  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  date: string;

  entries: MealEntry[];

  totalCalories: number;
}

export interface DailyNutrition {
  date: string;

  consumed: number;
  target: number;
  burned: number;

  meals: Meal[];

  macros: {
    protein: { value: number; target: number };
    carbs: { value: number; target: number };
    fat: { value: number; target: number };
    fiber: { value: number; target: number };
  };
}

// ─────────────────────────────────────────────────────────────
// PROGRESSION POIDS
// ─────────────────────────────────────────────────────────────

export interface WeightEntry {
  id: string;
  userId: string;

  weight: number;
  date: string;

  note?: string;
}

// ─────────────────────────────────────────────────────────────
// SOCIAL FEED
// ─────────────────────────────────────────────────────────────

export interface Post {
  id: string;

  authorId: string;
  authorName: string;
  authorInitials: string;
  authorAvatarColor: string;
  authorAvatar?: string;

  authorFollowers?: number;
  authorFollowing?: number;

  timeAgo: string;

  body: string;

  imageUrl?: string;
  imageBg?: string;
  imageEmoji?: string;

  tags: string[];

  likes: number;
  comments: number;

  liked: boolean;
  saved: boolean;
}

export interface Comment {
  id: string;

  authorId: string;
  authorName: string;
  authorInitials: string;

  authorAvatarColor?: string;

  body: string;

  timeAgo: string;

  likes: number;
}

// ─────────────────────────────────────────────────────────────
// RECOMMANDATIONS IA
// ─────────────────────────────────────────────────────────────

export interface Recommendation {
  id: string;

  tag: string;
  tagBg: string;
  tagColor: string;

  title: string;
  description: string;

  cta: string;

  type: 'meal' | 'sport' | 'wellbeing';
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;

  type: 'like' | 'comment' | 'follow' | 'recommendation' | 'reminder';

  message: string;

  timeAgo: string;

  read: boolean;

  actorName?: string;
  actorInitials?: string;
  actorColor?: string;
}

// ─────────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────────

export interface OnboardingData {
  goal: 'perte' | 'maintien' | 'gain';

  currentWeight: number;
  targetWeight: number;

  height: number;
  age: number;

  activityLevel:
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very_active';

  dietaryRestrictions: string[];
  allergies: string[];
}