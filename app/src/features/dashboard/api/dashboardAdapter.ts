import { DashboardData } from '../types';
import { fetchDashboardData } from '../api/dashboardApi';

export const adaptDashboardData = (data: any): DashboardData => {
    return {
        kpis: {
            activeUsers: data.active_users || 0,
            newSignUps: data.new_sign_ups || 0,
            premiumConversionRate: data.premium_conversion || 0,
            retentionRate: data.retention_rate || 0,
            averageCalories: data.average_calories || 0,
            workoutSessions: data.workout_sessions || 0,
            generatedNutritionPlans: data.nutrition_plans_generated || 0,
            generatedWorkoutPrograms: data.training_programs_generated || 0,
        },
        userActivities: data.user_activities || [],
        alerts: data.alerts || [],
        topPartners: data.top_partners || [],
        engagementMetrics: {
            nutrition: data.engagement?.nutrition || 0,
            sport: data.engagement?.sport || 0,
        },
    };
};

export const getDashboardData = async () => {
    const response = await fetchDashboardData();
    // `fetchDashboardData` may already return normalized `DashboardData`.
    if ((response as any).kpis) {
        return response as DashboardData;
    }

    return adaptDashboardData(response as any);
};