import axios from 'axios';
import { storage } from '@/utils/storage';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY  = 'auth_user';

// ─── Client backend propre (à brancher plus tard) ─────────────────────────────
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) await storage.deleteItem(TOKEN_KEY);
    return Promise.reject(error);
  },
);

// ─── Client DummyJSON (réseau social de démo) ─────────────────────────────────
export const djClient = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token sur les endpoints DummyJSON protégés (/auth/me, etc.)
djClient.interceptors.request.use(async (config) => {
  const token = await storage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
