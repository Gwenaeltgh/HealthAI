import { AnalyticsData } from '../types';
import apiClient from '../../../api/client';
import { API_ENDPOINTS as endpoints } from '../../../api/endpoints';

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
    const data = await apiClient.get(endpoints.analytics.features);
    return (data as unknown) as AnalyticsData;
};