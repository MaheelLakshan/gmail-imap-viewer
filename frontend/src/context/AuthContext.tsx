import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { IUser, IAuthContext } from '../types';

const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<void> => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (token: string): Promise<boolean> => {
    localStorage.setItem('token', token);
    setLoading(true);

    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      localStorage.removeItem('token');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const getGoogleAuthUrl = useCallback(async (): Promise<string> => {
    try {
      const response = await authAPI.getGoogleAuthUrl();
      return response.data.authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get auth URL');
      throw err;
    }
  }, []);

  const updateUser = useCallback((userData: Partial<IUser>): void => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const value: IAuthContext = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    getGoogleAuthUrl,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
