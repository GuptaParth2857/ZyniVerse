import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const userData = await api.get<User>('/auth/me');
        setUser(userData);
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    await SecureStore.setItemAsync('auth_token', result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setUser(null);
  }, []);

  return { user, loading, login, logout, refetch: checkAuth };
}
