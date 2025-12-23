/**
 * Google OAuth Callback Page
 *
 * Handles the OAuth callback from Google and exchanges the code for tokens
 *
 * Story: 4.2 - Implement Google Sheets OAuth Integration
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSupabase } from '@/lib/supabase';

type CallbackStatus = 'loading' | 'success' | 'error';

export function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const userId = searchParams.get('state');

      if (error) {
        setStatus('error');
        setErrorMessage(
          error === 'access_denied'
            ? 'Access was denied. Please try again.'
            : `OAuth error: ${error}`
        );
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received');
        return;
      }

      try {
        const { error: callbackError } = await getSupabase().functions.invoke('google-oauth', {
          body: { action: 'callback', code, userId },
        });

        if (callbackError) throw callbackError;

        setStatus('success');

        // Redirect after a short delay
        setTimeout(() => {
          const returnUrl = sessionStorage.getItem('google_oauth_return_url');
          sessionStorage.removeItem('google_oauth_return_url');
          navigate(returnUrl || '/leagues', { replace: true });
        }, 2000);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to complete authentication');
      }
    }

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    const returnUrl = sessionStorage.getItem('google_oauth_return_url');
    navigate(returnUrl || '/leagues', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Google Sheets Integration</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Connecting your Google account...'}
            {status === 'success' && 'Successfully connected! Redirecting...'}
            {status === 'error' && 'Connection failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
              <Button onClick={handleRetry}>Try Again</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
