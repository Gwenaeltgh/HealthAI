import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { AnalyticsData } from '../types';
export const fetchAnalyticsData = async (companyId?: string): Promise<AnalyticsData> => {
    if (companyId) {
        return apiClient.get<AnalyticsData>(API_ENDPOINTS.enterprise.analytics);
    }

    return apiClient.get<AnalyticsData>(API_ENDPOINTS.admin.analytics);
};