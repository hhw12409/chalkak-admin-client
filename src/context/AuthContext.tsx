'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AdminInfo } from '@/types/admin';
import { getToken, setToken, removeToken, ADMIN_INFO_KEY } from '@/lib/apiClient';
import { authApi } from '@/lib/api/auth';

interface AuthContextValue {
  admin: AdminInfo | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem(ADMIN_INFO_KEY);
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch {
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    setToken(res.accessToken);
    localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(res.admin));
    setAdmin(res.admin);
  };

  const logout = () => {
    removeToken();
    setAdmin(null);
    window.location.href = '/auth/signin';
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
