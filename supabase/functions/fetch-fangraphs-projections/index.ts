// Supabase Edge Function: Fetch Fangraphs Projections
// Story: 4.4 - Implement Fangraphs API Integration
//
// Fangraphs provides public JSON endpoints for projection data (no API key required)
// Base URL: https://www.fangraphs.com/api/projections
// Parameters:
//   - type: projection system (steamer, thebat, thebatx, atc, zips)
//   - stats: bat (hitters) or pit (pitchers)
//   - pos: all
//   - team: 0 (all teams)
//   - players: 0 (all players)
//   - lg: all

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const FANGRAPHS_BASE_URL = 'https://www.fangraphs.com/api/projections';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Error codes for consistent error handling
type ErrorCode =
  | 'RATE_LIMITED'
  | 'API_ERROR'
  | 'INVALID_SYSTEM'
  | 'INVALID_PLAYER_TYPE'
  | 'NETWORK_ERROR';

interface ErrorResponse {
  error: string;
  code: ErrorCode;
  retryAfter?: number;
}

// Valid projection systems (Fangraphs naming)
// steamer, thebat, thebatx (BatX), atc, zips
const VALID_SYSTEMS = ['steamer', 'thebat', 'thebatx', 'atc', 'zips'] as const;
type ProjectionSystem = (typeof VALID_SYSTEMS)[number];

// Map user-friendly names to Fangraphs API values
const SYSTEM_ALIASES: Record<string, ProjectionSystem> = {
  steamer: 'steamer',
  bat: 'thebat',
  thebat: 'thebat',
  batx: 'thebatx',
  thebatx: 'thebatx',
  atc: 'atc',
  zips: 'zips',
};

// Player types
const VALID_PLAYER_TYPES = ['hitters', 'pitchers'] as const;
type PlayerType = (typeof VALID_PLAYER_TYPES)[number];

// Raw Fangraphs hitter response structure
interface FangraphsHitter {
  PlayerName: string;
  Team: string;
  playerid: string;
  minpos?: string;
  // Counting stats
  G?: number;
  AB?: number;
  PA?: number;
  H?: number;
  '1B'?: number;
  '2B'?: number;
  '3B'?: number;
  HR?: number;
  R?: number;
  RBI?: number;
  BB?: number;
  SO?: number;
  SB?: number;
  CS?: number;
  HBP?: number;
  // Rate stats
  AVG?: number;
  OBP?: number;
  SLG?: number;
  OPS?: number;
  wOBA?: number;
  ISO?: number;
  BABIP?: number;
  // Advanced
  WAR?: number;
  wRC?: number;
  'wRC+'?: number;
  // Fantasy points
  FPTS?: number;
  ADP?: number;
}

// Raw Fangraphs pitcher response structure
interface FangraphsPitcher {
  PlayerName: string;
  Team: string;
  playerid: string;
  // Counting stats
  W?: number;
  L?: number;
  GS?: number;
  G?: number;
  SV?: number;
  HLD?: number;
  IP?: number;
  H?: number;
  R?: number;
  ER?: number;
  HR?: number;
  SO?: number;
  BB?: number;
  HBP?: number;
  // Rate stats
  ERA?: number;
  WHIP?: number;
  'K/9'?: number;
  'BB/9'?: number;
  'K%'?: number;
  'BB%'?: number;
  FIP?: number;
  BABIP?: number;
  'LOB%'?: number;
  'GB%'?: number;
  // Advanced
  WAR?: number;
  QS?: number;
  // Fantasy points
  FPTS?: number;
}

// Normalized player output format (NFR-I8: consistent data format)
interface NormalizedPlayer {
  playerName: string;
  team: string;
  positions: string[];
  fangraphsId: string;
  projectedValue: number | null;
  statsHitters: {
    g: number;
    ab: number;
    pa: number;
    h: number;
    hr: number;
    r: number;
    rbi: number;
    sb: number;
    cs: number;
    bb: number;
    so: number;
    avg: number;
    obp: number;
    slg: number;
    ops: number;
    iso: number;
    babip: number;
    war: number;
    wrc: number;
    wrcPlus: number;
  } | null;
  statsPitchers: {
    w: number;
    l: number;
    g: number;
    gs: number;
    sv: number;
    hld: number;
    ip: number;
    h: number;
    er: number;
    hr: number;
    so: number;
    bb: number;
    era: number;
    whip: number;
    k9: number;
    bb9: number;
    kPercent: number;
    bbPercent: number;
    fip: number;
    babip: number;
    lobPercent: number;
    war: number;
    qs: number;
  } | null;
  fantasyPoints: number | null;
  adp: number | null;
}

// Request body structure
interface FetchRequest {
  system: string;
  playerType: string;
}

// Success response structure
interface SuccessResponse {
  system: string;
  fangraphsSystem: ProjectionSystem;
  playerType: PlayerType;
  players: NormalizedPlayer[];
  count: number;
  fetchedAt: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    const body: FetchRequest = await req.json();
    const { system, playerType } = body;

    // Resolve system alias to Fangraphs system name
    const normalizedSystemInput = system?.toLowerCase();
    const fangraphsSystem = SYSTEM_ALIASES[normalizedSystemInput];

    if (!fangraphsSystem) {
      return errorResponse(
        `Invalid projection system: ${system}. Valid systems: steamer, bat/thebat, batx/thebatx, atc, zips`,
        'INVALID_SYSTEM',
        400
      );
    }

    // Validate player type
    const normalizedPlayerType = playerType?.toLowerCase() as PlayerType;
    if (
      !normalizedPlayerType ||
      !VALID_PLAYER_TYPES.includes(normalizedPlayerType)
    ) {
      return errorResponse(
        `Invalid player type: ${playerType}. Valid types: ${VALID_PLAYER_TYPES.join(', ')}`,
        'INVALID_PLAYER_TYPE',
        400
      );
    }

    // Fetch data with retry logic (NFR-I3: exponential backoff)
    const data = await fetchWithRetry(fangraphsSystem, normalizedPlayerType);

    // Normalize data to consistent format (NFR-I8: data format consistency)
    const normalized = normalizeData(data, normalizedPlayerType);

    const response: SuccessResponse = {
      system: normalizedSystemInput,
      fangraphsSystem,
      playerType: normalizedPlayerType,
      players: normalized,
      count: normalized.length,
      fetchedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof RateLimitError) {
      return errorResponse(error.message, 'RATE_LIMITED', 429, error.retryAfter);
    }

    if (error instanceof NetworkError) {
      return errorResponse(error.message, 'NETWORK_ERROR', 503);
    }

    if (error instanceof ApiError) {
      return errorResponse(error.message, 'API_ERROR', 502);
    }

    // Generic error
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return errorResponse(message, 'API_ERROR', 500);
  }
});

/**
 * Create error response with consistent format
 */
function errorResponse(
  message: string,
  code: ErrorCode,
  status: number,
  retryAfter?: number
): Response {
  const body: ErrorResponse = {
    error: message,
    code,
    ...(retryAfter !== undefined && { retryAfter }),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Custom error classes for specific error types
class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch data from Fangraphs with exponential backoff retry logic
 * NFR-I3: Maximum 3 retry attempts with exponential backoff
 */
async function fetchWithRetry(
  system: ProjectionSystem,
  playerType: PlayerType,
  maxRetries = 3
): Promise<(FangraphsHitter | FangraphsPitcher)[]> {
  // Map player type to Fangraphs stats parameter
  const statsParam = playerType === 'hitters' ? 'bat' : 'pit';

  const url = `${FANGRAPHS_BASE_URL}?type=${system}&stats=${statsParam}&pos=all&team=0&players=0&lg=all`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AuctionProjections/1.0',
        },
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : Math.pow(2, attempt);

        if (attempt === maxRetries) {
          throw new RateLimitError(
            'Rate limit exceeded. Please try again later.',
            retryAfter
          );
        }

        // Wait before retry with exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await sleep(waitTime);
        continue;
      }

      // Handle other HTTP errors
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new ApiError(
          `Fangraphs returned ${response.status}: ${errorBody}`,
          response.status
        );
      }

      // Parse and return successful response
      const data = await response.json();

      // Fangraphs returns an array directly
      if (Array.isArray(data)) {
        return data;
      }

      // If we can't find an array, return empty
      console.warn(
        'Unexpected response structure from Fangraphs:',
        typeof data
      );
      return [];
    } catch (error) {
      // Re-throw rate limit errors immediately
      if (error instanceof RateLimitError) {
        throw error;
      }

      // Network errors - retry with backoff
      if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = new NetworkError(
          `Network error connecting to Fangraphs: ${error.message}`
        );

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await sleep(waitTime);
          continue;
        }
      }

      // API errors - retry with backoff for transient failures (5xx)
      if (error instanceof ApiError && error.statusCode >= 500) {
        lastError = error;

        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await sleep(waitTime);
          continue;
        }
      }

      // For other errors, throw immediately
      throw error;
    }
  }

  // If we've exhausted retries, throw the last error
  throw lastError || new Error('Max retries exceeded');
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalize Fangraphs data to consistent format
 * NFR-I8: Same field names and data types regardless of source
 */
function normalizeData(
  data: (FangraphsHitter | FangraphsPitcher)[],
  playerType: PlayerType
): NormalizedPlayer[] {
  if (playerType === 'hitters') {
    return (data as FangraphsHitter[]).map((player) => normalizeHitter(player));
  } else {
    return (data as FangraphsPitcher[]).map((player) =>
      normalizePitcher(player)
    );
  }
}

/**
 * Normalize hitter data
 */
function normalizeHitter(player: FangraphsHitter): NormalizedPlayer {
  const positions = parsePositions(player.minpos);

  return {
    playerName: player.PlayerName || '',
    team: normalizeTeam(player.Team),
    positions,
    fangraphsId: player.playerid || '',
    projectedValue: null, // Calculated separately based on league settings
    statsHitters: {
      g: player.G ?? 0,
      ab: player.AB ?? 0,
      pa: player.PA ?? 0,
      h: player.H ?? 0,
      hr: player.HR ?? 0,
      r: player.R ?? 0,
      rbi: player.RBI ?? 0,
      sb: player.SB ?? 0,
      cs: player.CS ?? 0,
      bb: player.BB ?? 0,
      so: player.SO ?? 0,
      avg: player.AVG ?? 0,
      obp: player.OBP ?? 0,
      slg: player.SLG ?? 0,
      ops: player.OPS ?? 0,
      iso: player.ISO ?? 0,
      babip: player.BABIP ?? 0,
      war: player.WAR ?? 0,
      wrc: player.wRC ?? 0,
      wrcPlus: player['wRC+'] ?? 0,
    },
    statsPitchers: null,
    fantasyPoints: player.FPTS ?? null,
    adp: player.ADP ?? null,
  };
}

/**
 * Normalize pitcher data
 */
function normalizePitcher(player: FangraphsPitcher): NormalizedPlayer {
  const positions = inferPitcherPositions(player);

  return {
    playerName: player.PlayerName || '',
    team: normalizeTeam(player.Team),
    positions,
    fangraphsId: player.playerid || '',
    projectedValue: null, // Calculated separately based on league settings
    statsHitters: null,
    statsPitchers: {
      w: player.W ?? 0,
      l: player.L ?? 0,
      g: player.G ?? 0,
      gs: player.GS ?? 0,
      sv: player.SV ?? 0,
      hld: player.HLD ?? 0,
      ip: player.IP ?? 0,
      h: player.H ?? 0,
      er: player.ER ?? 0,
      hr: player.HR ?? 0,
      so: player.SO ?? 0,
      bb: player.BB ?? 0,
      era: player.ERA ?? 0,
      whip: player.WHIP ?? 0,
      k9: player['K/9'] ?? 0,
      bb9: player['BB/9'] ?? 0,
      kPercent: player['K%'] ?? 0,
      bbPercent: player['BB%'] ?? 0,
      fip: player.FIP ?? 0,
      babip: player.BABIP ?? 0,
      lobPercent: player['LOB%'] ?? 0,
      war: player.WAR ?? 0,
      qs: player.QS ?? 0,
    },
    fantasyPoints: player.FPTS ?? null,
    adp: null,
  };
}

/**
 * Parse positions from Fangraphs minpos field
 */
function parsePositions(minpos: string | undefined): string[] {
  if (!minpos) return ['UTIL'];

  // Fangraphs uses positions like "OF", "SS", "1B", etc.
  const positions = minpos
    .split(/[,/]/)
    .map((p) => p.trim().toUpperCase())
    .filter((p) => isValidPosition(p));

  return positions.length > 0 ? positions : ['UTIL'];
}

/**
 * Infer pitcher positions from stats
 */
function inferPitcherPositions(player: FangraphsPitcher): string[] {
  const saves = player.SV ?? 0;
  const holds = player.HLD ?? 0;
  const gamesStarted = player.GS ?? 0;
  const totalGames = player.G ?? 0;

  // Relief pitcher if significant saves or holds
  if (saves > 5 || holds > 10) {
    return ['RP'];
  }

  // Relief pitcher if mostly relief appearances
  if (totalGames > 0 && gamesStarted / totalGames < 0.5) {
    return ['RP'];
  }

  return ['SP'];
}

/**
 * Validate if a position code is valid
 */
function isValidPosition(pos: string): boolean {
  const validPositions = [
    'C',
    '1B',
    '2B',
    '3B',
    'SS',
    'LF',
    'CF',
    'RF',
    'OF',
    'DH',
    'UTIL',
    'SP',
    'RP',
    'P',
  ];
  return validPositions.includes(pos);
}

/**
 * Normalize team code to consistent format
 */
function normalizeTeam(team: string | undefined): string {
  if (!team) return '';

  const normalized = team.trim().toUpperCase();

  // Fangraphs already uses standard 3-letter codes
  // Just handle a few edge cases
  const teamMappings: Record<string, string> = {
    CHW: 'CWS',
    KCR: 'KC',
    SDP: 'SD',
    SFG: 'SF',
    TBR: 'TB',
    WAS: 'WSH',
    FLA: 'MIA',
  };

  return teamMappings[normalized] || normalized;
}
