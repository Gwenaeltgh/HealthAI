import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { Settings } from '../types';

export const fetchSettings = async (): Promise<Settings> => {
  return apiClient.get<Settings>(API_ENDPOINTS.settings.general);
};

export const updateSettings = async (settings: Settings): Promise<Settings> => {
  return apiClient.put<Settings>(API_ENDPOINTS.settings.general, settings);
};

const settingsApi = {
  getSettings: fetchSettings,
  updateSettings,
};

export default settingsApi;