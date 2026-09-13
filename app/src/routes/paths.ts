export const paths = {
  auth: {
    loginUser: '/auth/login/user',
    loginAdmin: '/auth/login/admin',
    loginEnterprise: '/auth/login/enterprise',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    main: '/',
  },
  enterprise: {
    main: '/enterprise',
    dashboard: '/enterprise',
    users: '/enterprise/users',
    userDetail: (userId: string) => `/enterprise/users/${userId}`,
    recommendations: '/enterprise/ai/recommendations',
    recommendationDetail: (recommendationId: string) => `/enterprise/ai/recommendations/${recommendationId}`,
    nutrition: {
      catalog: '/enterprise/nutrition/catalog',
      analytics: '/enterprise/nutrition/analytics',
    },
    sport: {
      programs: '/enterprise/sport/programs',
      programDetail: (programId: string) => `/enterprise/sport/programs/${programId}`,
      exercises: '/enterprise/sport/exercises',
    },
    analytics: '/enterprise/analytics',
    settings: '/enterprise/settings',
  },
  users: {
    list: '/users',
    detail: (userId: string) => `/users/${userId}`,
  },
  recommendations: {
    list: '/ai/recommendations',
    detail: (recommendationId: string) => `/ai/recommendations/${recommendationId}`,
  },
  nutrition: {
    catalog: '/nutrition/catalog',
    analytics: '/nutrition/analytics',
  },
  sport: {
    programs: '/sport/programs',
    programDetail: (programId: string) => `/sport/programs/${programId}`,
    exercises: '/sport/exercises',
  },
  analytics: {
    main: '/analytics',
  },
  partners: {
    list: '/partners',
    detail: (partnerId: string) => `/partners/${partnerId}`,
  },
  settings: {
    main: '/settings',
  },
  errors: {
    notFound: '/404',
    forbidden: '/403',
  },
};