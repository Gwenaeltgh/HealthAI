import apiClient from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import { Partner } from '../types';

export const fetchPartners = async (): Promise<Partner[]> => {
  return apiClient.get<Partner[]>(API_ENDPOINTS.partners.list);
};

export const fetchPartnerById = async (id: string): Promise<Partner> => {
  return apiClient.get<Partner>(API_ENDPOINTS.partners.detail(id));
};