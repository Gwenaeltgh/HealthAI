import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { DashboardData } from '../types';

export const fetchDashboardData = async (companyId?: string): Promise<DashboardData> => {
  if (companyId) {
    return apiClient.get<DashboardData>(API_ENDPOINTS.enterprise.dashboard);
  }

  return apiClient.get<DashboardData>(API_ENDPOINTS.admin.dashboard);
};