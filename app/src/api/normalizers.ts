// This file contains functions to normalize API responses.

export const normalizeUser = (user: any) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    subscription: user.subscription,
    goals: user.goals || [],
    recentActivity: user.recentActivity || [],
});

export const normalizeDashboardData = (data: any) => ({
    activeUsers: data.activeUsers,
    newSignUps: data.newSignUps,
    premiumConversion: data.premiumConversion,
    retentionRate: data.retentionRate,
    averageCalories: data.averageCalories,
    generatedNutritionPlans: data.generatedNutritionPlans,
    generatedWorkoutPrograms: data.generatedWorkoutPrograms,
});

export const normalizeRecommendation = (recommendation: any) => ({
    id: recommendation.id,
    type: recommendation.type,
    userId: recommendation.userId,
    date: recommendation.date,
    confidenceLevel: recommendation.confidenceLevel || 'N/A',
    details: recommendation.details || {},
});

export const normalizeNutritionData = (nutrition: any) => ({
    foodItems: nutrition.foodItems || [],
    averageMacros: nutrition.averageMacros || {},
    frequentFoods: nutrition.frequentFoods || [],
});

export const normalizeSportData = (sport: any) => ({
    programs: sport.programs || [],
    exercises: sport.exercises || [],
});