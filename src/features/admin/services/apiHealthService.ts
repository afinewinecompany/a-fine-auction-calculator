/**
 * API Health Service
 *
 * Provides health check logic for all API integrations:
 * - Couch Managers API (draft sync)
 * - Fangraphs API (player projections)
 * - Google Sheets API (custom projections)
 *
 * Story: 13.3 - Monitor API Health for Integrations
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { APIHealthStatus, APIHealthStatusType } from '../types/admin.types';

// API endpoint configurations
const FANGRAPHS_API_URL = 'https://www.fangraphs.com/api/projections';
const COUCH_MANAGERS_BASE_URL = 'https://www.couchmanagers.com';
const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Health check timeout (5 seconds)
const HEALTH_CHECK_TIMEOUT = 5000;

/** API names as stored in database */
type APINameDB = 'couch_managers' | 'fangraphs' | 'google_sheets';

/**
 * Log a health check result to the database
 */
async function logHealthCheck(
  apiName: APINameDB,
  status: APIHealthStatusType,
  responseTime: number | null,
  errorMessage: string | null
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = getSupabase();
    await supabase.from('api_health_logs').insert({
      api_name: apiName,
      status,
      response_time_ms: responseTime,
      error_message: errorMessage,
    });
  } catch (error) {
    // Don't fail the health check if logging fails
    console.error('Failed to log health check:', error);
  }
}

/**
 * Get the timestamp of the last successful API call
 */
async function getLastSuccessfulCall(apiName: APINameDB): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('api_health_logs')
      .select('checked_at')
      .eq('api_name', apiName)
      .eq('status', 'healthy')
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    return data?.checked_at ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the error rate for an API (percentage of last 100 checks that failed)
 */
async function getErrorRate(apiName: APINameDB): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  try {
    const supabase = getSupabase();
    const { data } = await supabase.rpc('get_api_error_rate', {
      api_name_param: apiName,
    });

    return data ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Get recent error messages for an API
 */
async function getRecentErrors(apiName: APINameDB): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('api_health_logs')
      .select('error_message')
      .eq('api_name', apiName)
      .not('error_message', 'is', null)
      .order('checked_at', { ascending: false })
      .limit(5);

    return data?.map(log => log.error_message).filter((msg): msg is string => Boolean(msg)) ?? [];
  } catch {
    return [];
  }
}

/**
 * Check Couch Managers API health
 * Uses a lightweight request to verify connectivity
 */
async function checkCouchManagersAPI(): Promise<APIHealthStatus> {
  const apiName = 'couch_managers';
  const displayName = 'Couch Managers';

  try {
    const start = Date.now();
    const response = await fetch(COUCH_MANAGERS_BASE_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
    });
    const responseTime = Date.now() - start;

    const status: APIHealthStatusType = response.ok ? 'healthy' : 'degraded';
    await logHealthCheck(apiName, status, responseTime, null);

    return {
      name: displayName,
      status,
      responseTime,
      lastSuccessfulCall: await getLastSuccessfulCall(apiName),
      errorRate: await getErrorRate(apiName),
      recentErrors: await getRecentErrors(apiName),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck(apiName, 'down', null, errorMessage);

    return {
      name: displayName,
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall(apiName),
      errorRate: await getErrorRate(apiName),
      recentErrors: await getRecentErrors(apiName),
    };
  }
}

/**
 * Check Fangraphs API health
 * Uses HEAD request to minimize data transfer
 */
async function checkFangraphsAPI(): Promise<APIHealthStatus> {
  const apiName = 'fangraphs';
  const displayName = 'Fangraphs';

  try {
    const start = Date.now();
    // Use GET with minimal params since Fangraphs may not support HEAD
    const response = await fetch(
      `${FANGRAPHS_API_URL}?type=steamer&stats=bat&pos=all&team=0&players=0&lg=all`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
      }
    );
    const responseTime = Date.now() - start;

    const status: APIHealthStatusType = response.ok ? 'healthy' : 'degraded';
    await logHealthCheck(apiName, status, responseTime, null);

    return {
      name: displayName,
      status,
      responseTime,
      lastSuccessfulCall: await getLastSuccessfulCall(apiName),
      errorRate: await getErrorRate(apiName),
      recentErrors: await getRecentErrors(apiName),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck(apiName, 'down', null, errorMessage);

    return {
      name: displayName,
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall(apiName),
      errorRate: await getErrorRate(apiName),
      recentErrors: await getRecentErrors(apiName),
    };
  }
}

/**
 * Check Google Sheets API health
 * Verifies OAuth token exists and is not expired, then pings API
 */
async function checkGoogleSheetsAPI(): Promise<APIHealthStatus> {
  const apiName = 'google_sheets';
  const displayName = 'Google Sheets';

  if (!isSupabaseConfigured()) {
    return {
      name: displayName,
      status: 'degraded',
      responseTime: null,
      lastSuccessfulCall: null,
      errorRate: 0,
      recentErrors: ['Supabase not configured'],
    };
  }

  try {
    const start = Date.now();
    const supabase = getSupabase();

    // Check if we have a valid OAuth token
    const { data: tokens, error: tokenError } = await supabase
      .from('google_oauth_tokens')
      .select('access_token, expires_at')
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      const errorMessage = 'Failed to query OAuth tokens';
      await logHealthCheck(apiName, 'down', null, errorMessage);
      return {
        name: displayName,
        status: 'down',
        responseTime: null,
        lastSuccessfulCall: await getLastSuccessfulCall(apiName),
        errorRate: await getErrorRate(apiName),
        recentErrors: await getRecentErrors(apiName),
      };
    }

    // No token exists - degraded but not down (user just hasn't connected)
    if (!tokens) {
      await logHealthCheck(apiName, 'degraded', null, 'No OAuth token configured');
      return {
        name: displayName,
        status: 'degraded',
        responseTime: null,
        lastSuccessfulCall: await getLastSuccessfulCall(apiName),
        errorRate: await getErrorRate(apiName),
        recentErrors: await getRecentErrors(apiName),
      };
    }

    // Token expired - degraded
    if (new Date(tokens.expires_at) < new Date()) {
      await logHealthCheck(apiName, 'degraded', null, 'OAuth token expired');
      return {
        name: displayName,
        status: 'degraded',
        responseTime: null,
        lastSuccessfulCall: await getLastSuccessfulCall(apiName),
        errorRate: await getErrorRate(apiName),
        recentErrors: await getRecentErrors(apiName),
      };
    }

    // Try to ping Google Sheets API with valid token
    try {
      const response = await fetch(GOOGLE_SHEETS_API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
        signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT),
      });
      const responseTime = Date.now() - start;

      // 200 or 400 (bad request but API is reachable) = healthy
      // 401/403 = degraded (auth issues)
      // Other errors = degraded
      let status: APIHealthStatusType = 'healthy';
      if (response.status === 401 || response.status === 403) {
        status = 'degraded';
        await logHealthCheck(apiName, status, responseTime, 'Authorization failed');
      } else if (!response.ok && response.status !== 400) {
        status = 'degraded';
        await logHealthCheck(apiName, status, responseTime, `HTTP ${response.status}`);
      } else {
        await logHealthCheck(apiName, status, responseTime, null);
      }

      return {
        name: displayName,
        status,
        responseTime,
        lastSuccessfulCall: await getLastSuccessfulCall(apiName),
        errorRate: await getErrorRate(apiName),
        recentErrors: await getRecentErrors(apiName),
      };
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
      await logHealthCheck(apiName, 'down', null, errorMessage);
      return {
        name: displayName,
        status: 'down',
        responseTime: null,
        lastSuccessfulCall: await getLastSuccessfulCall(apiName),
        errorRate: await getErrorRate(apiName),
        recentErrors: await getRecentErrors(apiName),
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logHealthCheck(apiName, 'down', null, errorMessage);

    return {
      name: displayName,
      status: 'down',
      responseTime: null,
      lastSuccessfulCall: await getLastSuccessfulCall(apiName),
      errorRate: await getErrorRate(apiName),
      recentErrors: await getRecentErrors(apiName),
    };
  }
}

/**
 * Check health of all APIs concurrently
 */
export async function checkAllAPIs(): Promise<APIHealthStatus[]> {
  const [couchManagers, fangraphs, googleSheets] = await Promise.all([
    checkCouchManagersAPI(),
    checkFangraphsAPI(),
    checkGoogleSheetsAPI(),
  ]);

  return [couchManagers, fangraphs, googleSheets];
}

/**
 * Check health of a single API by name
 */
export async function checkSingleAPI(
  apiName: 'couch_managers' | 'fangraphs' | 'google_sheets'
): Promise<APIHealthStatus> {
  switch (apiName) {
    case 'couch_managers':
      return checkCouchManagersAPI();
    case 'fangraphs':
      return checkFangraphsAPI();
    case 'google_sheets':
      return checkGoogleSheetsAPI();
  }
}
