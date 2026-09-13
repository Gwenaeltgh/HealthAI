export const API_ENDPOINTS = {
  admin: {
    login: '/api/admin/login',
    logout: '/api/admin/logout',
    me: '/api/admin/me',
    register: '/api/admin/register',
    dashboard: '/api/admin/dashboard',
    analytics: '/api/admin/analytics',
  },
  enterprise: {
    auth: {
      login: '/api/enterprise/login',
      logout: '/api/enterprise/logout',
      me: '/api/enterprise/me',
    },
    dashboard: '/api/enterprise/dashboard',
    analytics: '/api/enterprise/analytics',
    users: {
      list: '/api/enterprise/users',
      detail: (userId: string | number) => `/api/enterprise/users/${userId}`,
    },
    recommendations: {
      list: '/api/enterprise/recommendations',
      detail: (recommendationId: string | number) => `/api/enterprise/recommendations/${recommendationId}`,
    },
  },
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  dashboard: {
    data: '/api/data',
  },
  users: {
    list: '/api/utilisateurs',
    detail: (userId: string | number) => `/api/utilisateurs/${userId}`,
  },
  recommendations: {
    generate: '/api/recommendations',
    generateBulk: '/api/recommendations/bulk',
    list: '/api/recommendations',
    detail: (recommendationId: string | number) => `/api/recommendations/${recommendationId}`,
  },
  nutrition: {
    foods: '/api/foods',
    allergies: '/api/allergies',
    restrictions: '/api/restrictions',
    analytics: '/api/nutrition/analytics',
  },
  sport: {
    exercises: '/api/exercises',
    programs: '/api/programs',
    programDetail: (programId: string) => `/api/programs/${programId}`,
  },
  analytics: {
    features: '/api/features',
  },
  partners: {
    list: '/api/partners',
    detail: (partnerId: string) => `/api/partners/${partnerId}`,
  },
  settings: {
    general: '/api/settings',
  },
};