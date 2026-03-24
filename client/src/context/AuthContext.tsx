import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { setAccessToken } from '../api/client';
import type { UserMe } from '../../../shared/src/types';

interface AuthContextValue {
  user: UserMe | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Silent refresh on app load
  useEffect(() => {
    authApi.refresh()
      .then(({ user: u, accessToken }) => {
        setAccessToken(accessToken);
        setUser(u);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, accessToken } = await authApi.login({ email, password });
    setAccessToken(accessToken);
    setUser(u);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const { user: u, accessToken } = await authApi.register({ username, email, password });
    setAccessToken(accessToken);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authApi.me();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading,
      isAuthenticated: !!user,
      login, register, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
