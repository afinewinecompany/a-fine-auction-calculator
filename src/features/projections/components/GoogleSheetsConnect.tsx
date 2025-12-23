/**
 * Google Sheets Connect Component
 *
 * Allows users to connect their Google account for Sheets import
 *
 * Story: 4.2 - Implement Google Sheets OAuth Integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileSpreadsheet, Unlink } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface GoogleSheetsConnectProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  isConnected?: boolean;
}

export function GoogleSheetsConnect({
  onConnected: _onConnected,
  onDisconnected,
  isConnected = false,
}: GoogleSheetsConnectProps) {
  // onConnected is available for future use when OAuth flow completes inline
  void _onConnected;
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { data, error } = await getSupabase().functions.invoke('google-oauth', {
        body: { action: 'authorize' },
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Store current page for redirect after auth
        sessionStorage.setItem('google_oauth_return_url', window.location.href);
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Google');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      const { error } = await getSupabase().functions.invoke('google-oauth', {
        body: { action: 'disconnect' },
      });

      if (error) throw error;

      onDisconnected?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Google Sheets connected</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isDisconnecting}>
          {isDisconnecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Unlink className="mr-2 h-4 w-4" />
          )}
          Disconnect
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleConnect} disabled={isConnecting}>
        {isConnecting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4" />
        )}
        {isConnecting ? 'Connecting...' : 'Connect Google Sheets'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
