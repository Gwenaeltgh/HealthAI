import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/client';
import authApi from './api/authApi';
import { toEnterpriseAuthUser } from './enterprise';

export type AuthRole = 'admin' | 'user' | 'enterprise';

export type AuthUser = {
  id: string;
  email: string;
  role: AuthRole;
  name?: string;
  companyId?: string;
  companyName?: string;
  sector?: string;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEnterprise: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginEnterprise: (email: string, password: string) => Promise<void>;
  registerAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AUTH_STORAGE_KEY = 'healthai.backoffice.auth';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

async function getAdminMe(): Promise<AuthUser> {
  const data = await apiClient.get<any>('/api/admin/me');
  return {
    id: String(data.adminId ?? data.id ?? ''),
    email: String(data.email ?? ''),
    role: 'admin',
    name: 'Admin',
  };
}

async function postAdminLogin(email: string, password: string): Promise<AuthUser> {
  const data = await apiClient.post<any, { email: string; password: string }>('/api/admin/login', { email, password });
  return {
    id: String(data.id ?? data.adminId ?? ''),
    email: String(data.email ?? email),
    role: 'admin',
    name: 'Admin',
  };
}

async function postAdminRegister(email: string, password: string): Promise<AuthUser> {
  const data = await apiClient.post<any, { email: string; password: string }>('/api/admin/register', { email, password });
  return {
    id: String(data.id ?? data.adminId ?? ''),
    email: String(data.email ?? email),
    role: 'admin',
    name: 'Admin',
  };
}

async function postAdminLogout(): Promise<void> {
  await apiClient.post('/api/admin/logout');
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');

    const stored = readStoredUser();

    if (stored?.role === 'enterprise') {
      try {
        const session = await authApi.enterpriseMe();
        const nextUser = toEnterpriseAuthUser(session);
        setUser(nextUser);
        writeStoredUser(nextUser);
        setStatus('authenticated');
        return;
      } catch {
        setUser(null);
        writeStoredUser(null);
        setStatus('unauthenticated');
        return;
      }
    }

    try {
      const me = await getAdminMe();
      setUser(me);
      writeStoredUser(me);
      setStatus('authenticated');
    } catch {
      try {
        const session = await authApi.enterpriseMe();
        const nextUser = toEnterpriseAuthUser(session);
        setUser(nextUser);
        writeStoredUser(nextUser);
        setStatus('authenticated');
      } catch {
        setUser(null);
        writeStoredUser(null);
        setStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loginAdmin = useCallback(async (email: string, password: string) => {
    const logged = await postAdminLogin(email, password);
    // cookie is set server-side; optionally confirm with /me
    try {
      const me = await getAdminMe();
      setUser(me);
      writeStoredUser(me);
    } catch {
      setUser(logged);
      writeStoredUser(logged);
    }
    setStatus('authenticated');
  }, []);

  const loginEnterprise = useCallback(async (email: string, password: string) => {
    const logged = toEnterpriseAuthUser(await authApi.enterpriseLogin({ email, password }));
    setUser(logged);
    writeStoredUser(logged);
    setStatus('authenticated');
  }, []);

  const registerAdmin = useCallback(async (email: string, password: string) => {
    const created = await postAdminRegister(email, password);
    setUser(created);
    writeStoredUser(created);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    if (user?.role === 'enterprise') {
      await authApi.enterpriseLogout();
      setUser(null);
      writeStoredUser(null);
      setStatus('unauthenticated');
      return;
    }

    try {
      await postAdminLogout();
    } finally {
      setUser(null);
      writeStoredUser(null);
      setStatus('unauthenticated');
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      isAdmin: user?.role === 'admin',
      isEnterprise: user?.role === 'enterprise',
      loginAdmin,
      loginEnterprise,
      registerAdmin,
      logout,
      refresh,
    }),
    [loginAdmin, loginEnterprise, logout, refresh, registerAdmin, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const value = React.useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
