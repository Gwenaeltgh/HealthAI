import { LoginResponse, RegisterResponse, ForgotPasswordResponse, ResetPasswordResponse } from '../types';
import apiClient from '../../../api/client';
import { API_ENDPOINTS as endpoints } from '../../../api/endpoints';

export const authAdapter = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post(endpoints.auth.login, { email, password });
    return response.data;
  },

  register: async (email: string, password: string): Promise<RegisterResponse> => {
    const response = await apiClient.post(endpoints.auth.register, { email, password });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post(endpoints.auth.forgotPassword, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post(endpoints.auth.resetPassword, { token, newPassword });
    return response.data;
  },
};