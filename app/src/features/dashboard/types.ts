export interface DashboardKPI {
  activeUsers: number;
  newSignUps: number;
  premiumConversionRate: number;
  retentionRate: number;
  averageCalories: number;
  workoutSessions: number;
  generatedNutritionPlans: number;
  generatedWorkoutPrograms: number;
}

export interface UserActivity {
  userId: string;
  activityType: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: DashboardKPI;
  userActivities: UserActivity[];
  activityEvents?: UserActivity[];
  alerts: string[];
  topPartners: string[];
  engagementMetrics: {
    nutrition: number;
    sport: number;
  };
}

export type TimePeriod = '7d' | '30d' | '90d' | '12m';