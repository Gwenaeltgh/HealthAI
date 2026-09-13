import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginUserPage from '../pages/auth/LoginUserPage';
import LoginAdminPage from '../pages/auth/LoginAdminPage';
import LoginEnterprisePage from '../pages/auth/LoginEnterprisePage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import UsersPage from '../pages/users/UsersPage';
import UserDetailPage from '../pages/users/UserDetailPage';
import RecommendationsPage from '../pages/ai/RecommendationsPage';
import RecommendationDetailPage from '../pages/ai/RecommendationDetailPage';
import NutritionCatalogPage from '../pages/nutrition/NutritionCatalogPage';
import NutritionAnalyticsPage from '../pages/nutrition/NutritionAnalyticsPage';
import ProgramsPage from '../pages/sport/ProgramsPage';
import ProgramDetailPage from '../pages/sport/ProgramDetailPage';
import ExercisesPage from '../pages/sport/ExercisesPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import PartnersPage from '../pages/partners/PartnersPage';
import PartnerDetailPage from '../pages/partners/PartnerDetailPage';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import { RequireAdmin, RequireEnterprise } from './guards';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<RequireAdmin />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="ai/recommendations" element={<RecommendationsPage />} />
          <Route path="ai/recommendations/:recommendationId" element={<RecommendationDetailPage />} />
          <Route path="nutrition/catalog" element={<NutritionCatalogPage />} />
          <Route path="nutrition/analytics" element={<NutritionAnalyticsPage />} />
          <Route path="sport/programs" element={<ProgramsPage />} />
          <Route path="sport/programs/:programId" element={<ProgramDetailPage />} />
          <Route path="sport/exercises" element={<ExercisesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="partners/:partnerId" element={<PartnerDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route element={<RequireEnterprise />}>
        <Route path="/enterprise" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:userId" element={<UserDetailPage />} />
          <Route path="ai/recommendations" element={<RecommendationsPage />} />
          <Route path="ai/recommendations/:recommendationId" element={<RecommendationDetailPage />} />
          <Route path="nutrition/catalog" element={<NutritionCatalogPage />} />
          <Route path="nutrition/analytics" element={<NutritionAnalyticsPage />} />
          <Route path="sport/programs" element={<ProgramsPage />} />
          <Route path="sport/programs/:programId" element={<ProgramDetailPage />} />
          <Route path="sport/exercises" element={<ExercisesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login/user" element={<LoginUserPage />} />
        <Route path="login/admin" element={<LoginAdminPage />} />
        <Route path="login/enterprise" element={<LoginEnterprisePage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route path="404" element={<NotFoundPage />} />
      <Route path="403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;