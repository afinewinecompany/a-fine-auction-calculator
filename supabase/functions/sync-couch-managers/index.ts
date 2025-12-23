// Supabase Edge Function: Sync Couch Managers Draft Picks
// Story: 9.1 - Create Draft Sync Edge Function
//
// Scrapes Couch Managers auction page to fetch draft picks.
// Couch Managers does not offer a public API, so we parse the HTML page
// which contains JavaScript arrays with player and auction data.
//
// URL format: https://www.couchmanagers.com/auctions/?auction_id={auctionId}
//
// Implements:
// - Web scraping of Couch Managers auction pages
// - Exponential backoff retry (NFR-I3: max 3 retries)
// - 5 second timeout (adjusted for page scraping - larger than API calls)
// - User authorization via league ownership check

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// =============================================================================
// Constants & Types
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Couch Managers base URL
const COUCH_MANAGERS_BASE_URL = 'https://www.couchmanagers.com';

// Request timeout in milliseconds (5 seconds for page scraping)
const REQUEST_TIMEOUT_MS = 5000;

// Maximum retry attempts (NFR-I3)
const MAX_RETRIES = 3;

// Error codes for consistent error handling
type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'LEAGUE_NOT_FOUND'
  | 'SCRAPE_ERROR'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR';

interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  syncTimestamp: string;
  retryAfter?: number;
}

// Request schema - now uses auctionId instead of roomId
interface SyncRequest {
  auctionId: string; // Couch Managers auction ID (numeric string)
  leagueId: string; // Our internal league ID (UUID)
  lastSyncTimestamp?: string; // ISO timestamp for catch-up sync (Story 9.7)
}

// Response schema
interface SyncResponse {
  success: true;
  picks: DraftPick[];
  currentAuctions: CurrentAuction[]; // Active bids currently in progress
  players: PlayerInfo[]; // All players in the auction
  syncTimestamp: string;
  auctionInfo: AuctionInfo;
}

// Current/active auction data (bid in progress)
interface CurrentAuction {
  playerId: string; // Couch Managers player ID
  playerName: string; // Player name
  position: string; // Player position
  mlbTeam: string; // MLB team
  currentBid: number; // Current bid amount
  highBidder: string; // Team currently winning the bid
  timeRemaining: string; // Time remaining in auction (e.g., "30:39", "1:07:29")
  stats?: PlayerStats; // Player stats if available
}

// Player stats from Couch Managers
interface PlayerStats {
  // Hitter stats
  avg?: string;
  hr?: number;
  rbi?: number;
  sb?: number;
  r?: number;
  // Pitcher stats
  era?: string;
  w?: number;
  l?: number;
  s?: number;
  k?: number;
  whip?: string;
}

// Draft pick data (completed auction)
interface DraftPick {
  playerId: string; // Couch Managers player ID
  playerName: string; // Player name
  team: string; // Fantasy team that drafted player
  auctionPrice: number; // Winning bid amount
  position?: string; // Player position (optional)
}

// Player info from playerArray
interface PlayerInfo {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  mlbTeam: string;
  isDrafted: boolean;
  draftedBy?: string;
  draftPrice?: number;
}

// Auction metadata
interface AuctionInfo {
  auctionId: string;
  totalTeams: number;
  rosterSize: number;
  budget: number;
}

// =============================================================================
// Custom Error Classes
// =============================================================================

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class LeagueNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeagueNotFoundError';
  }
}

class ScrapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScrapeError';
  }
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

class RateLimitError extends Error {
  retryAfter: number;
  constructor(message: string, retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// =============================================================================
// Main Handler
// =============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const syncTimestamp = new Date().toISOString();

  try {
    // Step 1: Parse and validate request
    const { auctionId, leagueId, lastSyncTimestamp } = await parseAndValidateRequest(req);

    // Step 2: Verify user owns the league (NFR-S6: authorization check)
    await verifyLeagueOwnership(req, leagueId);

    // Step 3: Scrape Couch Managers auction page
    const { picks, currentAuctions, players, auctionInfo } = await scrapeCouchManagersAuction(
      auctionId,
      lastSyncTimestamp
    );

    // Step 4: Return success response
    const response: SyncResponse = {
      success: true,
      picks,
      currentAuctions,
      players,
      syncTimestamp,
      auctionInfo,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return handleError(error, syncTimestamp);
  }
});

// =============================================================================
// Request Parsing & Validation
// =============================================================================

async function parseAndValidateRequest(req: Request): Promise<SyncRequest> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON in request body');
  }

  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body must be an object');
  }

  const { auctionId, leagueId, lastSyncTimestamp } = body as Record<string, unknown>;

  // Validate auctionId (numeric string)
  if (!auctionId || typeof auctionId !== 'string' || auctionId.trim() === '') {
    throw new ValidationError('auctionId is required and must be a non-empty string');
  }

  // auctionId should be numeric
  if (!/^\d+$/.test(auctionId.trim())) {
    throw new ValidationError('auctionId must be a numeric value');
  }

  // Validate leagueId (UUID format)
  if (!leagueId || typeof leagueId !== 'string') {
    throw new ValidationError('leagueId is required and must be a string');
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(leagueId)) {
    throw new ValidationError('leagueId must be a valid UUID format');
  }

  // Validate lastSyncTimestamp if provided
  if (lastSyncTimestamp !== undefined) {
    if (typeof lastSyncTimestamp !== 'string') {
      throw new ValidationError('lastSyncTimestamp must be a string');
    }
    // Validate it's a valid ISO timestamp
    const date = new Date(lastSyncTimestamp);
    if (isNaN(date.getTime())) {
      throw new ValidationError('lastSyncTimestamp must be a valid ISO timestamp');
    }
  }

  return {
    auctionId: auctionId.trim(),
    leagueId,
    lastSyncTimestamp: lastSyncTimestamp as string | undefined,
  };
}

// =============================================================================
// Authorization
// =============================================================================

async function verifyLeagueOwnership(req: Request, leagueId: string): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ScrapeError('Supabase configuration missing');
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header is required');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  // Verify user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }

  // Verify user owns the league
  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .select('user_id')
    .eq('id', leagueId)
    .single();

  if (leagueError || !league) {
    throw new LeagueNotFoundError('League not found or access denied');
  }

  if (league.user_id !== user.id) {
    throw new UnauthorizedError('You do not have permission to access this league');
  }
}

// =============================================================================
// Couch Managers Scraping
// =============================================================================

interface ScrapedData {
  picks: DraftPick[];
  currentAuctions: CurrentAuction[];
  players: PlayerInfo[];
  auctionInfo: AuctionInfo;
}

async function scrapeCouchManagersAuction(
  auctionId: string,
  _since?: string
): Promise<ScrapedData> {
  const url = `${COUCH_MANAGERS_BASE_URL}/auctions/?auction_id=${encodeURIComponent(auctionId)}`;

  // Fetch with retry logic (NFR-I3: exponential backoff, max 3 retries)
  const html = await fetchWithRetry(url);

  // Parse the HTML to extract JavaScript data
  return parseAuctionPage(html, auctionId);
}

// =============================================================================
// Retry Logic with Exponential Backoff (NFR-I3)
// =============================================================================

async function fetchWithRetry(
  url: string,
  maxRetries = MAX_RETRIES
): Promise<string> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'AuctionProjections/1.0 (Fantasy Baseball Draft Tool)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Success - return response text
      if (response.ok) {
        return await response.text();
      }

      // Rate limiting (429) - retry with exponential backoff
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader
          ? parseInt(retryAfterHeader, 10)
          : Math.pow(2, attempt + 1);

        if (attempt === maxRetries - 1) {
          throw new RateLimitError(
            'Rate limit exceeded. Please try again later.',
            retryAfter
          );
        }

        // Wait before retry: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }

      // Server errors (5xx) - retry with exponential backoff
      if (response.status >= 500) {
        if (attempt === maxRetries - 1) {
          throw new ScrapeError(
            `Couch Managers returned server error: ${response.status}`
          );
        }

        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }

      // Client errors (4xx) - don't retry
      throw new ScrapeError(
        `Couch Managers returned error: ${response.status} - Page may not exist`
      );
    } catch (error) {
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(
          'Request timeout: Couch Managers page took too long to load'
        );
      }

      // Handle rate limit error (don't retry)
      if (error instanceof RateLimitError) {
        throw error;
      }

      // Handle timeout error (don't retry)
      if (error instanceof TimeoutError) {
        throw error;
      }

      // Handle scrape error (client errors don't retry)
      if (error instanceof ScrapeError) {
        throw error;
      }

      // Network errors - retry with exponential backoff
      if (error instanceof TypeError) {
        lastError = new NetworkError(
          `Network error connecting to Couch Managers: ${error.message}`
        );

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await sleep(delay);
          continue;
        }
      }

      // Unknown error - store and potentially retry
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError;
}

// =============================================================================
// HTML Parsing - Extract JavaScript Arrays
// =============================================================================

function parseAuctionPage(html: string, auctionId: string): ScrapedData {
  try {
    // Extract player array from JavaScript
    const players = extractPlayerArray(html);

    // Extract auction/roster data to find drafted players (sold=1)
    const picks = extractDraftedPlayers(html, players);

    // Extract current/active auctions (sold=0)
    const currentAuctions = extractCurrentAuctions(html, players);

    // Extract auction info (teams, budget, etc.)
    const auctionInfo = extractAuctionInfo(html, auctionId);

    return { picks, currentAuctions, players, auctionInfo };
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError(
      `Failed to parse Couch Managers page: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function extractPlayerArray(html: string): PlayerInfo[] {
  const players: PlayerInfo[] = [];

  // Look for playerArray initialization pattern:
  // playerArray[id] = new Player(id, firstname, lastname, position, ...)
  const playerPattern =
    /playerArray\[(\d+)\]\s*=\s*new\s+Player\s*\(\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"\s*,\s*"([^"]*)"/g;

  let match;
  while ((match = playerPattern.exec(html)) !== null) {
    const [, , id, firstName, lastName, position] = match;

    players.push({
      id,
      firstName,
      lastName,
      position,
      mlbTeam: '', // Not always available in the pattern
      isDrafted: false,
      draftedBy: undefined,
      draftPrice: undefined,
    });
  }

  if (players.length === 0) {
    // Try alternative parsing approach - look for JSON-like structure
    const jsonPlayerPattern = /"id":\s*"?(\d+)"?\s*,\s*"firstName":\s*"([^"]*)"\s*,\s*"lastName":\s*"([^"]*)"/g;
    while ((match = jsonPlayerPattern.exec(html)) !== null) {
      const [, id, firstName, lastName] = match;
      players.push({
        id,
        firstName,
        lastName,
        position: '',
        mlbTeam: '',
        isDrafted: false,
      });
    }
  }

  return players;
}

function extractDraftedPlayers(html: string, players: PlayerInfo[]): DraftPick[] {
  const picks: DraftPick[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Look for auctionArray entries with sold = 1
  // auctionArray[playerid] = new Auction(playerid, teamname, amount, time, sold)
  const auctionPattern =
    /auctionArray\[(\d+)\]\s*=\s*new\s+Auction\s*\(\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*(\d+)\s*,\s*"?([^",)]*)"?\s*,\s*1\s*\)/g;

  let match;
  while ((match = auctionPattern.exec(html)) !== null) {
    const [, , playerId, teamName, amount] = match;
    const player = playerMap.get(playerId);

    if (player) {
      player.isDrafted = true;
      player.draftedBy = teamName;
      player.draftPrice = parseInt(amount, 10);

      picks.push({
        playerId,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        team: teamName,
        auctionPrice: parseInt(amount, 10),
        position: player.position || undefined,
      });
    } else {
      // Player not in playerArray but was auctioned
      picks.push({
        playerId,
        playerName: `Player ${playerId}`,
        team: teamName,
        auctionPrice: parseInt(amount, 10),
      });
    }
  }

  // Also look for completed auctions in table format
  // <tr><td class="players_taken_price">$XX</td><td>Player Name</td><td>Team</td></tr>
  const tablePattern =
    /<tr[^>]*>\s*<td[^>]*class="[^"]*players_taken_price[^"]*"[^>]*>\s*\$?(\d+)\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*class="[^"]*players_taken_owner[^"]*"[^>]*>([^<]+)<\/td>/gi;

  while ((match = tablePattern.exec(html)) !== null) {
    const [, price, playerName, teamName] = match;

    // Avoid duplicates - check if we already have this player
    const existingPick = picks.find(
      (p) => p.playerName.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (!existingPick) {
      picks.push({
        playerId: '', // Not available from table
        playerName: playerName.trim(),
        team: teamName.trim(),
        auctionPrice: parseInt(price, 10),
      });
    }
  }

  return picks;
}

function extractCurrentAuctions(html: string, players: PlayerInfo[]): CurrentAuction[] {
  const currentAuctions: CurrentAuction[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Look for auctionArray entries with sold = 0 (active auctions)
  // auctionArray[playerid] = new Auction(playerid, teamname, amount, time, sold)
  // Example: auctionArray[46] = new Auction(46, "BigKlu 162", 15, "31:15", 0)
  const activeAuctionPattern =
    /auctionArray\[(\d+)\]\s*=\s*new\s+Auction\s*\(\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*0\s*\)/g;

  let match;
  while ((match = activeAuctionPattern.exec(html)) !== null) {
    const [, , playerId, teamName, amount, timeRemaining] = match;
    const player = playerMap.get(playerId);

    // Extract player stats if available
    const stats = extractPlayerStats(html, playerId);

    if (player) {
      currentAuctions.push({
        playerId,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        position: player.position || '',
        mlbTeam: player.mlbTeam || '',
        currentBid: parseInt(amount, 10),
        highBidder: teamName,
        timeRemaining,
        stats: stats || undefined,
      });
    } else {
      // Player not in playerArray but has active auction
      currentAuctions.push({
        playerId,
        playerName: `Player ${playerId}`,
        position: '',
        mlbTeam: '',
        currentBid: parseInt(amount, 10),
        highBidder: teamName,
        timeRemaining,
        stats: stats || undefined,
      });
    }
  }

  return currentAuctions;
}

function extractPlayerStats(html: string, playerId: string): PlayerStats | null {
  // Try to find stats in playerArray initialization
  // playerArray[id].avg = ".331"; playerArray[id].hr = 53; etc.
  const stats: PlayerStats = {};
  let hasStats = false;

  // Look for individual stat assignments
  const avgMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.avg\\s*=\\s*"([^"]+)"`));
  if (avgMatch) {
    stats.avg = avgMatch[1];
    hasStats = true;
  }

  const hrMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.hr\\s*=\\s*(\\d+)`));
  if (hrMatch) {
    stats.hr = parseInt(hrMatch[1], 10);
    hasStats = true;
  }

  const rbiMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.rbi\\s*=\\s*(\\d+)`));
  if (rbiMatch) {
    stats.rbi = parseInt(rbiMatch[1], 10);
    hasStats = true;
  }

  const sbMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.sb\\s*=\\s*(\\d+)`));
  if (sbMatch) {
    stats.sb = parseInt(sbMatch[1], 10);
    hasStats = true;
  }

  const rMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.r\\s*=\\s*(\\d+)`));
  if (rMatch) {
    stats.r = parseInt(rMatch[1], 10);
    hasStats = true;
  }

  // Pitcher stats
  const eraMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.era\\s*=\\s*"([^"]+)"`));
  if (eraMatch) {
    stats.era = eraMatch[1];
    hasStats = true;
  }

  const wMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.w\\s*=\\s*(\\d+)`));
  if (wMatch) {
    stats.w = parseInt(wMatch[1], 10);
    hasStats = true;
  }

  const lMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.l\\s*=\\s*(\\d+)`));
  if (lMatch) {
    stats.l = parseInt(lMatch[1], 10);
    hasStats = true;
  }

  const sMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.s\\s*=\\s*(\\d+)`));
  if (sMatch) {
    stats.s = parseInt(sMatch[1], 10);
    hasStats = true;
  }

  const kMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.k\\s*=\\s*(\\d+)`));
  if (kMatch) {
    stats.k = parseInt(kMatch[1], 10);
    hasStats = true;
  }

  const whipMatch = html.match(new RegExp(`playerArray\\[${playerId}\\]\\.whip\\s*=\\s*"([^"]+)"`));
  if (whipMatch) {
    stats.whip = whipMatch[1];
    hasStats = true;
  }

  return hasStats ? stats : null;
}

function extractAuctionInfo(html: string, auctionId: string): AuctionInfo {
  let totalTeams = 12; // Default
  let rosterSize = 26; // Default
  let budget = 260; // Default

  // Look for team count
  const teamCountMatch = html.match(/(\d+)\s*(?:teams?|owners?)/i);
  if (teamCountMatch) {
    totalTeams = parseInt(teamCountMatch[1], 10);
  }

  // Look for roster size
  const rosterMatch = html.match(/rosterSize\s*[:=]\s*(\d+)/i);
  if (rosterMatch) {
    rosterSize = parseInt(rosterMatch[1], 10);
  }

  // Look for budget
  const budgetMatch = html.match(/budget\s*[:=]\s*\$?(\d+)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // Alternative: count rosterArray dimensions
  const rosterArrayMatch = html.match(/rosterArray\[(\d+)\]\[(\d+)\]/g);
  if (rosterArrayMatch && rosterArrayMatch.length > 0) {
    const lastMatch = rosterArrayMatch[rosterArrayMatch.length - 1];
    const dimensions = lastMatch.match(/\[(\d+)\]\[(\d+)\]/);
    if (dimensions) {
      totalTeams = Math.max(totalTeams, parseInt(dimensions[1], 10) + 1);
      rosterSize = Math.max(rosterSize, parseInt(dimensions[2], 10) + 1);
    }
  }

  return {
    auctionId,
    totalTeams,
    rosterSize,
    budget,
  };
}

// =============================================================================
// Error Handling
// =============================================================================

function handleError(error: unknown, syncTimestamp: string): Response {
  let errorResponse: ErrorResponse;
  let status: number;

  if (error instanceof ValidationError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      syncTimestamp,
    };
    status = 400;
  } else if (error instanceof UnauthorizedError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'UNAUTHORIZED',
      syncTimestamp,
    };
    status = 403;
  } else if (error instanceof LeagueNotFoundError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'LEAGUE_NOT_FOUND',
      syncTimestamp,
    };
    status = 404;
  } else if (error instanceof ScrapeError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'SCRAPE_ERROR',
      syncTimestamp,
    };
    status = 502;
  } else if (error instanceof ParseError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'PARSE_ERROR',
      syncTimestamp,
    };
    status = 500;
  } else if (error instanceof RateLimitError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'RATE_LIMITED',
      syncTimestamp,
      retryAfter: error.retryAfter,
    };
    status = 429;
  } else if (error instanceof TimeoutError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'TIMEOUT',
      syncTimestamp,
    };
    status = 504;
  } else if (error instanceof NetworkError) {
    errorResponse = {
      success: false,
      error: error.message,
      code: 'NETWORK_ERROR',
      syncTimestamp,
    };
    status = 503;
  } else {
    // Generic error
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    errorResponse = {
      success: false,
      error: message,
      code: 'SCRAPE_ERROR',
      syncTimestamp,
    };
    status = 500;
  }

  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// =============================================================================
// Utilities
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
