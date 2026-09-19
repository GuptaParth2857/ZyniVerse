import { useState, useEffect, useCallback } from 'react';
import { api, getCurrentUser } from '../services/api';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password);
    setUser(result);
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const result = await api.auth.register(email, username, password);
      setUser(result);
    },
    []
  );

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, refetch: checkAuth };
}
