import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

const TOKEN_KEY = 'authToken';

export const getAuthToken = () => {
  return getCookie(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  setCookie(TOKEN_KEY, token, { path: '/' });
};

export const removeAuthToken = () => {
  deleteCookie(TOKEN_KEY);
};