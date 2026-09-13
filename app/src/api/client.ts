import axios, { type AxiosRequestConfig } from 'axios';

import { isRealApiEnabled } from './env';
import { mockApiRequest, type MockHttpMethod } from './mockApi';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptors for request and response can be added here
instance.interceptors.request.use(
  (config) => {
    // Add any request modifications here, like adding auth tokens
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

type ApiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<T>;
};

const request = async <T>(
  method: MockHttpMethod,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  if (!isRealApiEnabled()) {
    return mockApiRequest<T>(method, url, data, config);
  }

  const response = await instance.request<T>({ method, url, data, ...config });
  // axios wraps the payload under `data`
  return (response as any).data as T;
};

const apiClient: ApiClient = {
  get: async (url, config) => {
    return request('GET', url, undefined, config);
  },
  post: async (url, data, config) => {
    return request('POST', url, data, config);
  },
  put: async (url, data, config) => {
    return request('PUT', url, data, config);
  },
  delete: async (url, config) => {
    return request('DELETE', url, undefined, config);
  },
};

export default apiClient;