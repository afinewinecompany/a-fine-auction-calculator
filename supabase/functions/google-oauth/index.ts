// Supabase Edge Function: Google OAuth Integration
// Story: 4.2 - Implement Google Sheets OAuth Integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!;
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
const GOOGLE_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface SheetFile {
  id: string;
  name: string;
  mimeType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const action = body.action || url.searchParams.get('action');
    const code = body.code || url.searchParams.get('code');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('Authorization');
    let currentUserId = body.userId;
    
    if (authHeader && !currentUserId) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      currentUserId = user?.id;
    }

    switch (action) {
      case 'authorize': {
        const state = currentUserId || 'anonymous';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          redirect_uri: GOOGLE_REDIRECT_URI,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly',
          access_type: 'offline',
          prompt: 'consent',
          state,
        })}`;
        return new Response(JSON.stringify({ authUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'callback': {
        if (!code) throw new Error('Authorization code is required');
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });
        if (!tokenResponse.ok) throw new Error('Token exchange failed');
        const tokens: TokenResponse = await tokenResponse.json();
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        if (!currentUserId) throw new Error('User ID is required');
        const { error: upsertError } = await supabase
          .from('google_oauth_tokens')
          .upsert({ user_id: currentUserId, access_token: tokens.access_token, refresh_token: tokens.refresh_token, expires_at: expiresAt.toISOString() }, { onConflict: 'user_id' });
        if (upsertError) throw new Error(upsertError.message);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'list-sheets': {
        if (!currentUserId) throw new Error('User ID is required');
        const { data: tokenData } = await supabase.from('google_oauth_tokens').select('*').eq('user_id', currentUserId).single();
        if (!tokenData) throw new Error('Google Sheets not connected');
        const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&fields=files(id%2Cname%2CmimeType)', { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
        if (!response.ok) throw new Error('Failed to fetch sheets');
        const data = await response.json();
        return new Response(JSON.stringify({ sheets: data.files || [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'check-connection': {
        if (!currentUserId) return new Response(JSON.stringify({ connected: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        const { data: tokenData } = await supabase.from('google_oauth_tokens').select('expires_at').eq('user_id', currentUserId).single();
        const connected = !!tokenData && new Date(tokenData.expires_at) > new Date();
        return new Response(JSON.stringify({ connected }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'disconnect': {
        if (!currentUserId) throw new Error('User ID is required');
        await supabase.from('google_oauth_tokens').delete().eq('user_id', currentUserId);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
