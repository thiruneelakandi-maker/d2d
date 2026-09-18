import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('emergency_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('emergency_token'));

  useEffect(() => {
    if (token && !user) {
      authAPI.getMe().then(setUser).catch(() => {
        authAPI.logout();
        setToken(null);
      });
    }
  }, [token, user]);

  const login = async (email: string, pass: string) => {
    const data = await authAPI.login(email, pass);
    setToken(data.access);
    setUser(data.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    const res = await authAPI.register(data);
    setToken(res.access);
    setUser(res.user);
  };

  const logout = () => {
    authAPI.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
