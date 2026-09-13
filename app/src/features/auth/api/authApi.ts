import apiClient from '../../../api/client';
import { API_ENDPOINTS as endpoints } from '../../../api/endpoints';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types';
import type { EnterpriseLoginCredentials, EnterpriseSession } from '../enterprise';

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const result = await apiClient.post(endpoints.auth.login, data);
    return (result as unknown) as LoginResponse;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const result = await apiClient.post(endpoints.auth.register, data);
    return (result as unknown) as RegisterResponse;
  },

  enterpriseLogin: async (data: EnterpriseLoginCredentials): Promise<EnterpriseSession> => {
    const result = await apiClient.post(endpoints.enterprise.auth.login, data);
    return (result as unknown) as EnterpriseSession;
  },

  enterpriseMe: async (): Promise<EnterpriseSession> => {
    const result = await apiClient.get(endpoints.enterprise.auth.me);
    return (result as unknown) as EnterpriseSession;
  },

  enterpriseLogout: async (): Promise<void> => {
    await apiClient.post(endpoints.enterprise.auth.logout, {});
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(endpoints.auth.forgotPassword, { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post(endpoints.auth.resetPassword, { token, newPassword });
  },
};

export default authApi;