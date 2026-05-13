'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'candidate' | 'admin';
  phone?: string;
  profilePicture?: string;
  resume?: string;
  coverLetter?: string;
  skills?: string[];
  experience?: string;
  education?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialAuth(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') return { user: null, token: null };
  const storedToken = localStorage.getItem('ats_token');
  const storedUser = localStorage.getItem('ats_user');
  if (storedToken && storedUser) {
    try {
      return { token: storedToken, user: JSON.parse(storedUser) };
    } catch {
      localStorage.removeItem('ats_token');
      localStorage.removeItem('ats_user');
    }
  }
  return { user: null, token: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialAuth] = useState(getInitialAuth);
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    const userObj = { ...userData, id: userData.id || userData._id };
    setToken(newToken);
    setUser(userObj);
    localStorage.setItem('ats_token', newToken);
    localStorage.setItem('ats_user', JSON.stringify(userObj));

    return userObj;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string): Promise<User> => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: newToken, user: userData } = response.data;

    const userObj = { ...userData, id: userData.id || userData._id };
    setToken(newToken);
    setUser(userObj);
    localStorage.setItem('ats_token', newToken);
    localStorage.setItem('ats_user', JSON.stringify(userObj));

    return userObj;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ats_token');
    localStorage.removeItem('ats_user');
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, ...data };
      localStorage.setItem('ats_user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading: false,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
