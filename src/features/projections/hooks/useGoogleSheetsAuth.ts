/**
 * useGoogleSheetsAuth Hook
 *
 * Manages Google Sheets OAuth connection state
 *
 * Story: 4.2 - Implement Google Sheets OAuth Integration
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';

interface UseGoogleSheetsAuthReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  checkConnection: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useGoogleSheetsAuth(): UseGoogleSheetsAuthReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getSupabase().functions.invoke('google-oauth', {
        body: { action: 'check-connection' },
      });

      if (error) throw error;

      setIsConnected(data?.connected ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check connection');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await getSupabase().functions.invoke('google-oauth', {
        body: { action: 'disconnect' },
      });

      if (error) throw error;

      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isConnected,
    isLoading,
    error,
    checkConnection,
    disconnect,
  };
}
