export const dashboardMockData = {
  kpi: {
    activeUsers: 1200,
    newSignUps: 300,
    premiumConversion: 15,
    retentionRate: 85,
    workoutSessions: 450,
    averageCalories: 2200,
    generatedNutritionPlans: 75,
    generatedWorkoutPrograms: 50,
  },
  charts: {
    userGrowth: [
      { month: 'January', users: 1000 },
      { month: 'February', users: 1100 },
      { month: 'March', users: 1200 },
      { month: 'April', users: 1300 },
      { month: 'May', users: 1400 },
    ],
    subscriptionDistribution: {
      free: 800,
      premium: 400,
    },
    dailyActivity: [
      { day: 'Monday', activity: 200 },
      { day: 'Tuesday', activity: 250 },
      { day: 'Wednesday', activity: 300 },
      { day: 'Thursday', activity: 280 },
      { day: 'Friday', activity: 320 },
      { day: 'Saturday', activity: 350 },
      { day: 'Sunday', activity: 400 },
    ],
    engagement: {
      nutrition: 70,
      sport: 30,
    },
  },
  alerts: [
    { id: 1, message: 'New user sign-up!', type: 'info' },
    { id: 2, message: 'User feedback received.', type: 'success' },
    { id: 3, message: 'System maintenance scheduled.', type: 'warning' },
  ],
  topPartners: [
    { name: 'Health Corp', usersManaged: 500 },
    { name: 'Fitness Inc', usersManaged: 300 },
  ],
  topSegments: [
    { segment: 'Active Users', count: 800 },
    { segment: 'New Sign-ups', count: 300 },
  ],
};