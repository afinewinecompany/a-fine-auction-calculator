// Supabase Edge Function: Import Google Sheet Data
// Story: 4.3 - Import Projections from Google Sheets

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Validate required environment variables at startup
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const missingEnvVars = [
  !GOOGLE_CLIENT_ID && 'GOOGLE_CLIENT_ID',
  !GOOGLE_CLIENT_SECRET && 'GOOGLE_CLIENT_SECRET',
  !SUPABASE_URL && 'SUPABASE_URL',
  !SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
].filter(Boolean);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid MLB positions
const VALID_POSITIONS = ['C', '1B', '2B', '3B', 'SS', 'OF', 'CF', 'LF', 'RF', 'DH', 'SP', 'RP', 'P', 'UTIL'];

// Column name mappings for flexible import
const COLUMN_MAPPINGS: Record<string, string[]> = {
  player_name: ['player name', 'name', 'player', 'playername'],
  team: ['team', 'tm', 'club'],
  positions: ['positions', 'position', 'pos', 'eligible'],
  value: ['value', '$', 'price', 'auction value', 'salary', 'cost'],
  hr: ['hr', 'home runs', 'homers'],
  rbi: ['rbi', 'runs batted in', 'rbis'],
  sb: ['sb', 'stolen bases', 'steals'],
  avg: ['avg', 'average', 'ba', 'batting average'],
  obp: ['obp', 'on base', 'on base percentage'],
  slg: ['slg', 'slugging', 'slugging percentage'],
  runs: ['r', 'runs', 'run'],
  hits: ['h', 'hits', 'hit'],
  w: ['w', 'wins', 'win'],
  k: ['k', 'so', 'strikeouts', 'ks'],
  era: ['era', 'earned run average'],
  whip: ['whip'],
  sv: ['sv', 'saves', 'save'],
  ip: ['ip', 'innings', 'innings pitched'],
};

interface TokenData {
  access_token: string;
  refresh_token: string | null;
  expires_at: string;
}

interface SheetRow {
  player_name: string;
  team: string | null;
  positions: string[];
  value: number | null;
  stats_hitters: Record<string, number | null> | null;
  stats_pitchers: Record<string, number | null> | null;
}

interface ValidationError {
  row: number;
  message: string;
}

interface ImportResult {
  imported: number;
  errors: ValidationError[];
  duration_ms: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { sheetId, leagueId, range = 'A:Z' } = await req.json();

    if (!sheetId) {
      throw new Error('Sheet ID is required');
    }
    if (!leagueId) {
      throw new Error('League ID is required');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get current user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    // Verify user owns the league
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('id, user_id')
      .eq('id', leagueId)
      .single();

    if (leagueError || !league) {
      throw new Error('League not found');
    }

    if (league.user_id !== user.id) {
      throw new Error('You do not have permission to import to this league');
    }

    // Get user's OAuth token
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Google Sheets not connected. Please authorize first.');
    }

    // Refresh token if expired
    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.expires_at);

    if (expiresAt <= new Date()) {
      if (!tokenData.refresh_token) {
        throw new Error('Token expired and no refresh token available. Please reconnect.');
      }

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokenData.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token. Please reconnect Google Sheets.');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);

      // Update token in database
      await supabase
        .from('google_oauth_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString(),
        })
        .eq('user_id', user.id);
    }

    // Fetch sheet data from Google Sheets API
    const sheetResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!sheetResponse.ok) {
      const errorData = await sheetResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to fetch sheet data');
    }

    const sheetData = await sheetResponse.json();
    const rows = sheetData.values || [];

    if (rows.length < 2) {
      throw new Error('Sheet must contain headers and at least one data row');
    }

    // Parse and validate rows
    const { validRows, errors } = parseAndValidateRows(rows);

    if (validRows.length === 0 && errors.length > 0) {
      throw new Error(`No valid rows to import. ${errors.length} rows had errors.`);
    }

    // Prepare projections for upsert
    const projections = validRows.map(row => ({
      league_id: leagueId,
      player_name: row.player_name,
      team: row.team,
      positions: row.positions,
      projected_value: row.value,
      projection_source: 'Google Sheets',
      stats_hitters: row.stats_hitters,
      stats_pitchers: row.stats_pitchers,
    }));

    // Batch upsert projections (500 at a time for performance)
    const batchSize = 500;
    let totalImported = 0;

    for (let i = 0; i < projections.length; i += batchSize) {
      const batch = projections.slice(i, i + batchSize);

      const { error: upsertError, count } = await supabase
        .from('player_projections')
        .upsert(batch, {
          onConflict: 'league_id,player_name',
          count: 'exact'
        });

      if (upsertError) {
        throw new Error(`Database error: ${upsertError.message}`);
      }

      totalImported += count || batch.length;
    }

    const duration = Date.now() - startTime;

    const result: ImportResult = {
      imported: totalImported,
      errors,
      duration_ms: duration,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: message,
        imported: 0,
        errors: [],
        duration_ms: Date.now() - startTime,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseAndValidateRows(rows: string[][]): { validRows: SheetRow[], errors: ValidationError[] } {
  const headers = rows[0].map(h => h.toLowerCase().trim());
  const validRows: SheetRow[] = [];
  const errors: ValidationError[] = [];

  // Map column indices
  const columnIndices = mapColumnIndices(headers);

  if (columnIndices.player_name === -1) {
    errors.push({ row: 1, message: 'Missing required column: Player Name' });
    return { validRows, errors };
  }

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1; // 1-indexed for user display

    try {
      const parsed = parseRow(row, columnIndices, headers);

      // Validate required fields
      const validationErrors = validateRow(parsed);

      if (validationErrors.length > 0) {
        errors.push({ row: rowNum, message: validationErrors.join('; ') });
        continue;
      }

      validRows.push(parsed);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown parsing error';
      errors.push({ row: rowNum, message: msg });
    }
  }

  return { validRows, errors };
}

function mapColumnIndices(headers: string[]): Record<string, number> {
  const indices: Record<string, number> = {};

  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    indices[field] = -1;
    for (const alias of aliases) {
      const idx = headers.findIndex(h => h === alias);
      if (idx !== -1) {
        indices[field] = idx;
        break;
      }
    }
  }

  return indices;
}

function parseRow(row: string[], indices: Record<string, number>, headers: string[]): SheetRow {
  const getValue = (field: string): string => {
    const idx = indices[field];
    return idx >= 0 && idx < row.length ? row[idx]?.trim() || '' : '';
  };

  const getNumericValue = (field: string): number | null => {
    const val = getValue(field);
    if (!val || val === '-' || val === 'N/A' || val === '') return null;
    const num = parseFloat(val.replace(/[$,]/g, ''));
    return isNaN(num) ? null : num;
  };

  // Parse positions
  const positionsStr = getValue('positions');
  let positions: string[] = [];
  if (positionsStr) {
    positions = positionsStr
      .split(/[,\/]/)
      .map(p => p.trim().toUpperCase())
      .filter(p => VALID_POSITIONS.includes(p));
  }

  // Parse hitter stats
  const hitterStatFields = ['hr', 'rbi', 'sb', 'avg', 'obp', 'slg', 'runs', 'hits'];
  const stats_hitters: Record<string, number | null> = {};
  let hasHitterStats = false;

  for (const field of hitterStatFields) {
    const val = getNumericValue(field);
    if (val !== null) {
      stats_hitters[field] = val;
      hasHitterStats = true;
    }
  }

  // Parse pitcher stats
  const pitcherStatFields = ['w', 'k', 'era', 'whip', 'sv', 'ip'];
  const stats_pitchers: Record<string, number | null> = {};
  let hasPitcherStats = false;

  for (const field of pitcherStatFields) {
    const val = getNumericValue(field);
    if (val !== null) {
      stats_pitchers[field] = val;
      hasPitcherStats = true;
    }
  }

  return {
    player_name: getValue('player_name'),
    team: getValue('team') || null,
    positions,
    value: getNumericValue('value'),
    stats_hitters: hasHitterStats ? stats_hitters : null,
    stats_pitchers: hasPitcherStats ? stats_pitchers : null,
  };
}

function validateRow(row: SheetRow): string[] {
  const errors: string[] = [];

  // Required: player name
  if (!row.player_name) {
    errors.push('Missing player name');
  }

  // Validate positions if present - already filtered to valid ones
  // No validation error needed since invalid ones are just filtered out

  // Validate stats are reasonable numbers
  if (row.stats_hitters) {
    if (row.stats_hitters.avg !== null && row.stats_hitters.avg !== undefined) {
      if (row.stats_hitters.avg < 0 || row.stats_hitters.avg > 1) {
        errors.push('AVG should be between 0 and 1');
      }
    }
    if (row.stats_hitters.obp !== null && row.stats_hitters.obp !== undefined) {
      if (row.stats_hitters.obp < 0 || row.stats_hitters.obp > 1) {
        errors.push('OBP should be between 0 and 1');
      }
    }
    if (row.stats_hitters.slg !== null && row.stats_hitters.slg !== undefined) {
      if (row.stats_hitters.slg < 0 || row.stats_hitters.slg > 2) {
        errors.push('SLG should be between 0 and 2');
      }
    }
  }

  if (row.stats_pitchers) {
    if (row.stats_pitchers.era !== null && row.stats_pitchers.era !== undefined) {
      if (row.stats_pitchers.era < 0 || row.stats_pitchers.era > 50) {
        errors.push('ERA should be between 0 and 50');
      }
    }
    if (row.stats_pitchers.whip !== null && row.stats_pitchers.whip !== undefined) {
      if (row.stats_pitchers.whip < 0 || row.stats_pitchers.whip > 10) {
        errors.push('WHIP should be between 0 and 10');
      }
    }
  }

  return errors;
}
