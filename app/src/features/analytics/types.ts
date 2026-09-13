export interface AnalyticsKPI {
  activeUsers: number;
  newSignUps: number;
  premiumConversionRate: number;
  retentionRate: number;
  averageSessions: number;
  averageCalories: number;
  generatedNutritionPlans: number;
  generatedWorkoutPrograms: number;
}

export interface UserEngagement {
  date: string;
  nutritionEngagement: number;
  sportEngagement: number;
}

export interface SubscriptionDistribution {
  subscriptionType: string;
  count: number;
}

export interface AnalyticsData {
  kpi: AnalyticsKPI;
  userEngagement: UserEngagement[];
  subscriptionDistribution: SubscriptionDistribution[];
  alerts: string[];
  topPartners: string[];
  topSegments: string[];
}