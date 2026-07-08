import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Anime } from '../types';

export function useAnime(id: number) {
  const [data, setData] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.anime.get(id);
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load anime');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
