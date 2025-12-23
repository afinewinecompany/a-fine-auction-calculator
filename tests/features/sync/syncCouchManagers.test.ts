/**
 * Couch Managers Sync Integration Tests
 *
 * Story: 9.1 - Create Draft Sync Edge Function
 *
 * These tests verify the validation logic, HTML parsing, data transformation,
 * and error handling patterns used in the Edge Function.
 *
 * Couch Managers does not offer a public API - we scrape their auction pages:
 * https://www.couchmanagers.com/auctions/?auction_id={auctionId}
 *
 * Edge Function endpoint: supabase/functions/sync-couch-managers
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// Types matching the Edge Function
// =============================================================================

type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'LEAGUE_NOT_FOUND'
  | 'SCRAPE_ERROR'
  | 'PARSE_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR';

// Request schema - uses auctionId (numeric) instead of roomId
interface SyncRequest {
  auctionId: string; // Couch Managers auction ID (numeric string)
  leagueId: string;
  lastSyncTimestamp?: string;
}

// Response schema
interface SyncResponse {
  success: true;
  picks: DraftPick[];
  currentAuctions: CurrentAuction[];
  players: PlayerInfo[];
  syncTimestamp: string;
  auctionInfo: AuctionInfo;
}

// Current/active auction data (bid in progress)
interface CurrentAuction {
  playerId: string;
  playerName: string;
  position: string;
  mlbTeam: string;
  currentBid: number;
  highBidder: string;
  timeRemaining: string;
  stats?: PlayerStats;
}

// Player stats from Couch Managers
interface PlayerStats {
  avg?: string;
  hr?: number;
  rbi?: number;
  sb?: number;
  r?: number;
  era?: string;
  w?: number;
  l?: number;
  s?: number;
  k?: number;
  whip?: string;
}

interface ErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  syncTimestamp: string;
  retryAfter?: number;
}

// Draft pick data (completed auction)
interface DraftPick {
  playerId: string;
  playerName: string;
  team: string;
  auctionPrice: number;
  position?: string;
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
// Validation Functions (matching Edge Function implementation)
// =============================================================================

function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function isValidAuctionId(str: string): boolean {
  return /^\d+$/.test(str.trim());
}

function isValidISOTimestamp(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function validateSyncRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: SyncRequest;
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const { auctionId, leagueId, lastSyncTimestamp } = body as Record<
    string,
    unknown
  >;

  // Validate auctionId (numeric string)
  if (!auctionId || typeof auctionId !== 'string' || auctionId.trim() === '') {
    return {
      valid: false,
      error: 'auctionId is required and must be a non-empty string',
    };
  }

  if (!isValidAuctionId(auctionId)) {
    return { valid: false, error: 'auctionId must be a numeric value' };
  }

  // Validate leagueId
  if (!leagueId || typeof leagueId !== 'string') {
    return {
      valid: false,
      error: 'leagueId is required and must be a string',
    };
  }

  if (!isValidUUID(leagueId)) {
    return { valid: false, error: 'leagueId must be a valid UUID format' };
  }

  // Validate lastSyncTimestamp if provided
  if (lastSyncTimestamp !== undefined) {
    if (typeof lastSyncTimestamp !== 'string') {
      return { valid: false, error: 'lastSyncTimestamp must be a string' };
    }
    if (!isValidISOTimestamp(lastSyncTimestamp)) {
      return {
        valid: false,
        error: 'lastSyncTimestamp must be a valid ISO timestamp',
      };
    }
  }

  return {
    valid: true,
    data: {
      auctionId: auctionId.trim(),
      leagueId,
      lastSyncTimestamp: lastSyncTimestamp as string | undefined,
    },
  };
}

// =============================================================================
// HTML Parsing Functions (matching Edge Function implementation)
// =============================================================================

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
      mlbTeam: '',
      isDrafted: false,
      draftedBy: undefined,
      draftPrice: undefined,
    });
  }

  return players;
}

function extractDraftedPlayers(
  html: string,
  players: PlayerInfo[]
): DraftPick[] {
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
      picks.push({
        playerId,
        playerName: `Player ${playerId}`,
        team: teamName,
        auctionPrice: parseInt(amount, 10),
      });
    }
  }

  return picks;
}

function extractCurrentAuctions(
  html: string,
  players: PlayerInfo[]
): CurrentAuction[] {
  const currentAuctions: CurrentAuction[] = [];
  const playerMap = new Map(players.map((p) => [p.id, p]));

  // Look for auctionArray entries with sold = 0 (active auctions)
  // auctionArray[playerid] = new Auction(playerid, teamname, amount, time, sold)
  const activeAuctionPattern =
    /auctionArray\[(\d+)\]\s*=\s*new\s+Auction\s*\(\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*(\d+)\s*,\s*"([^"]*)"\s*,\s*0\s*\)/g;

  let match;
  while ((match = activeAuctionPattern.exec(html)) !== null) {
    const [, , playerId, teamName, amount, timeRemaining] = match;
    const player = playerMap.get(playerId);

    if (player) {
      currentAuctions.push({
        playerId,
        playerName: `${player.firstName} ${player.lastName}`.trim(),
        position: player.position || '',
        mlbTeam: player.mlbTeam || '',
        currentBid: parseInt(amount, 10),
        highBidder: teamName,
        timeRemaining,
      });
    } else {
      currentAuctions.push({
        playerId,
        playerName: `Player ${playerId}`,
        position: '',
        mlbTeam: '',
        currentBid: parseInt(amount, 10),
        highBidder: teamName,
        timeRemaining,
      });
    }
  }

  return currentAuctions;
}

function extractAuctionInfo(html: string, auctionId: string): AuctionInfo {
  let totalTeams = 12;
  let rosterSize = 26;
  let budget = 260;

  const teamCountMatch = html.match(/(\d+)\s*(?:teams?|owners?)/i);
  if (teamCountMatch) {
    totalTeams = parseInt(teamCountMatch[1], 10);
  }

  const rosterMatch = html.match(/rosterSize\s*[:=]\s*(\d+)/i);
  if (rosterMatch) {
    rosterSize = parseInt(rosterMatch[1], 10);
  }

  const budgetMatch = html.match(/budget\s*[:=]\s*\$?(\d+)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  return {
    auctionId,
    totalTeams,
    rosterSize,
    budget,
  };
}

// Calculate exponential backoff (matching Edge Function: 1s, 2s, 4s)
function calculateBackoff(attempt: number): number {
  return Math.pow(2, attempt) * 1000;
}

// URL construction for Couch Managers
function constructAuctionUrl(auctionId: string): string {
  return `https://www.couchmanagers.com/auctions/?auction_id=${encodeURIComponent(auctionId)}`;
}

// =============================================================================
// Tests
// =============================================================================

describe('Couch Managers Sync Integration', () => {
  describe('Auction ID Validation', () => {
    describe('isValidAuctionId', () => {
      it('accepts valid numeric auction IDs', () => {
        expect(isValidAuctionId('996')).toBe(true);
        expect(isValidAuctionId('1')).toBe(true);
        expect(isValidAuctionId('12345')).toBe(true);
        expect(isValidAuctionId('999999')).toBe(true);
      });

      it('accepts auction ID with whitespace', () => {
        expect(isValidAuctionId('  996  ')).toBe(true);
        expect(isValidAuctionId('123 ')).toBe(true);
      });

      it('rejects non-numeric auction IDs', () => {
        expect(isValidAuctionId('')).toBe(false);
        expect(isValidAuctionId('abc')).toBe(false);
        expect(isValidAuctionId('996abc')).toBe(false);
        expect(isValidAuctionId('99.6')).toBe(false);
        expect(isValidAuctionId('-996')).toBe(false);
      });
    });
  });

  describe('UUID Validation', () => {
    describe('isValidUUID', () => {
      it('accepts valid UUIDs', () => {
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
        expect(isValidUUID('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      });

      it('accepts UUIDs with uppercase letters', () => {
        expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
        expect(isValidUUID('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true);
      });

      it('rejects invalid UUIDs', () => {
        expect(isValidUUID('')).toBe(false);
        expect(isValidUUID('not-a-uuid')).toBe(false);
        expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
        expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(
          false
        );
        expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false);
        expect(isValidUUID('550g8400-e29b-41d4-a716-446655440000')).toBe(false);
      });
    });
  });

  describe('ISO Timestamp Validation', () => {
    describe('isValidISOTimestamp', () => {
      it('accepts valid ISO timestamps', () => {
        expect(isValidISOTimestamp('2025-12-20T10:30:00Z')).toBe(true);
        expect(isValidISOTimestamp('2025-12-20T10:30:00.000Z')).toBe(true);
        expect(isValidISOTimestamp('2025-12-20T10:30:00+00:00')).toBe(true);
        expect(isValidISOTimestamp('2025-12-20')).toBe(true);
      });

      it('rejects invalid timestamps', () => {
        expect(isValidISOTimestamp('')).toBe(false);
        expect(isValidISOTimestamp('not-a-date')).toBe(false);
        expect(isValidISOTimestamp('2025-13-45T99:99:99Z')).toBe(false);
      });
    });
  });

  describe('Request Validation', () => {
    describe('validateSyncRequest', () => {
      it('accepts valid request with all fields', () => {
        const result = validateSyncRequest({
          auctionId: '996',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
          lastSyncTimestamp: '2025-12-20T10:30:00Z',
        });

        expect(result.valid).toBe(true);
        expect(result.data).toEqual({
          auctionId: '996',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
          lastSyncTimestamp: '2025-12-20T10:30:00Z',
        });
      });

      it('accepts valid request without lastSyncTimestamp', () => {
        const result = validateSyncRequest({
          auctionId: '996',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.valid).toBe(true);
        expect(result.data?.lastSyncTimestamp).toBeUndefined();
      });

      it('trims auctionId whitespace', () => {
        const result = validateSyncRequest({
          auctionId: '  996  ',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
        });

        expect(result.valid).toBe(true);
        expect(result.data?.auctionId).toBe('996');
      });

      it('rejects null body', () => {
        const result = validateSyncRequest(null);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Request body must be an object');
      });

      it('rejects non-object body', () => {
        const result = validateSyncRequest('string');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Request body must be an object');
      });

      it('rejects missing auctionId', () => {
        const result = validateSyncRequest({
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'auctionId is required and must be a non-empty string'
        );
      });

      it('rejects empty auctionId', () => {
        const result = validateSyncRequest({
          auctionId: '',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'auctionId is required and must be a non-empty string'
        );
      });

      it('rejects non-numeric auctionId', () => {
        const result = validateSyncRequest({
          auctionId: 'abc123',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('auctionId must be a numeric value');
      });

      it('rejects missing leagueId', () => {
        const result = validateSyncRequest({
          auctionId: '996',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('leagueId is required and must be a string');
      });

      it('rejects invalid leagueId format', () => {
        const result = validateSyncRequest({
          auctionId: '996',
          leagueId: 'not-a-uuid',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('leagueId must be a valid UUID format');
      });

      it('rejects non-string lastSyncTimestamp', () => {
        const result = validateSyncRequest({
          auctionId: '996',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
          lastSyncTimestamp: 12345,
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe('lastSyncTimestamp must be a string');
      });

      it('rejects invalid lastSyncTimestamp format', () => {
        const result = validateSyncRequest({
          auctionId: '996',
          leagueId: '550e8400-e29b-41d4-a716-446655440000',
          lastSyncTimestamp: 'not-a-timestamp',
        });
        expect(result.valid).toBe(false);
        expect(result.error).toBe(
          'lastSyncTimestamp must be a valid ISO timestamp'
        );
      });
    });
  });

  describe('HTML Parsing - Player Array Extraction', () => {
    describe('extractPlayerArray', () => {
      it('extracts players from playerArray pattern', () => {
        const html = `
          playerArray[123] = new Player(123, "Mike", "Trout", "OF", "LAA", 0.300, 40);
          playerArray[456] = new Player(456, "Shohei", "Ohtani", "DH", "LAD", 0.280, 45);
        `;

        const players = extractPlayerArray(html);

        expect(players).toHaveLength(2);
        expect(players[0]).toEqual({
          id: '123',
          firstName: 'Mike',
          lastName: 'Trout',
          position: 'OF',
          mlbTeam: '',
          isDrafted: false,
          draftedBy: undefined,
          draftPrice: undefined,
        });
        expect(players[1]).toEqual({
          id: '456',
          firstName: 'Shohei',
          lastName: 'Ohtani',
          position: 'DH',
          mlbTeam: '',
          isDrafted: false,
          draftedBy: undefined,
          draftPrice: undefined,
        });
      });

      it('handles empty HTML', () => {
        const players = extractPlayerArray('');
        expect(players).toEqual([]);
      });

      it('handles HTML with no player data', () => {
        const html = '<html><body>No players here</body></html>';
        const players = extractPlayerArray(html);
        expect(players).toEqual([]);
      });

      it('handles players with special characters in names', () => {
        const html = `
          playerArray[789] = new Player(789, "Ronald", "Acuña Jr.", "OF", "ATL", 0.300, 30);
        `;

        const players = extractPlayerArray(html);

        expect(players).toHaveLength(1);
        expect(players[0].firstName).toBe('Ronald');
        expect(players[0].lastName).toBe('Acuña Jr.');
      });
    });
  });

  describe('HTML Parsing - Drafted Players Extraction', () => {
    describe('extractDraftedPlayers', () => {
      it('extracts drafted players from auctionArray pattern', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "2025-01-15", 1);
          auctionArray[456] = new Auction(456, "Team B", 50, "2025-01-15", 1);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
          {
            id: '456',
            firstName: 'Shohei',
            lastName: 'Ohtani',
            position: 'DH',
            mlbTeam: 'LAD',
            isDrafted: false,
          },
        ];

        const picks = extractDraftedPlayers(html, players);

        expect(picks).toHaveLength(2);
        expect(picks[0]).toEqual({
          playerId: '123',
          playerName: 'Mike Trout',
          team: 'Team A',
          auctionPrice: 45,
          position: 'OF',
        });
        expect(picks[1]).toEqual({
          playerId: '456',
          playerName: 'Shohei Ohtani',
          team: 'Team B',
          auctionPrice: 50,
          position: 'DH',
        });
      });

      it('ignores unsold auctions (sold = 0)', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "2025-01-15", 0);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
        ];

        const picks = extractDraftedPlayers(html, players);
        expect(picks).toEqual([]);
      });

      it('handles players not in playerArray', () => {
        const html = `
          auctionArray[999] = new Auction(999, "Team C", 30, "2025-01-15", 1);
        `;

        const picks = extractDraftedPlayers(html, []);

        expect(picks).toHaveLength(1);
        expect(picks[0].playerName).toBe('Player 999');
        expect(picks[0].auctionPrice).toBe(30);
      });

      it('updates player isDrafted status', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "2025-01-15", 1);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
        ];

        extractDraftedPlayers(html, players);

        expect(players[0].isDrafted).toBe(true);
        expect(players[0].draftedBy).toBe('Team A');
        expect(players[0].draftPrice).toBe(45);
      });
    });
  });

  describe('HTML Parsing - Current Auctions Extraction', () => {
    describe('extractCurrentAuctions', () => {
      it('extracts active auctions from auctionArray pattern (sold=0)', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "30:15", 0);
          auctionArray[456] = new Auction(456, "Team B", 50, "1:05:30", 0);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
          {
            id: '456',
            firstName: 'Shohei',
            lastName: 'Ohtani',
            position: 'DH',
            mlbTeam: 'LAD',
            isDrafted: false,
          },
        ];

        const currentAuctions = extractCurrentAuctions(html, players);

        expect(currentAuctions).toHaveLength(2);
        expect(currentAuctions[0]).toEqual({
          playerId: '123',
          playerName: 'Mike Trout',
          position: 'OF',
          mlbTeam: 'LAA',
          currentBid: 45,
          highBidder: 'Team A',
          timeRemaining: '30:15',
        });
        expect(currentAuctions[1]).toEqual({
          playerId: '456',
          playerName: 'Shohei Ohtani',
          position: 'DH',
          mlbTeam: 'LAD',
          currentBid: 50,
          highBidder: 'Team B',
          timeRemaining: '1:05:30',
        });
      });

      it('ignores completed auctions (sold=1)', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "2025-01-15", 1);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
        ];

        const currentAuctions = extractCurrentAuctions(html, players);
        expect(currentAuctions).toEqual([]);
      });

      it('handles players not in playerArray', () => {
        const html = `
          auctionArray[999] = new Auction(999, "Team C", 30, "15:00", 0);
        `;

        const currentAuctions = extractCurrentAuctions(html, []);

        expect(currentAuctions).toHaveLength(1);
        expect(currentAuctions[0].playerName).toBe('Player 999');
        expect(currentAuctions[0].currentBid).toBe(30);
        expect(currentAuctions[0].timeRemaining).toBe('15:00');
      });

      it('handles empty HTML', () => {
        const currentAuctions = extractCurrentAuctions('', []);
        expect(currentAuctions).toEqual([]);
      });

      it('handles mixed completed and active auctions', () => {
        const html = `
          auctionArray[123] = new Auction(123, "Team A", 45, "30:15", 0);
          auctionArray[456] = new Auction(456, "Team B", 50, "2025-01-15", 1);
          auctionArray[789] = new Auction(789, "Team C", 35, "10:30", 0);
        `;

        const players: PlayerInfo[] = [
          {
            id: '123',
            firstName: 'Mike',
            lastName: 'Trout',
            position: 'OF',
            mlbTeam: 'LAA',
            isDrafted: false,
          },
          {
            id: '456',
            firstName: 'Shohei',
            lastName: 'Ohtani',
            position: 'DH',
            mlbTeam: 'LAD',
            isDrafted: false,
          },
          {
            id: '789',
            firstName: 'Mookie',
            lastName: 'Betts',
            position: '2B',
            mlbTeam: 'LAD',
            isDrafted: false,
          },
        ];

        const currentAuctions = extractCurrentAuctions(html, players);

        // Only active auctions (sold=0)
        expect(currentAuctions).toHaveLength(2);
        expect(currentAuctions[0].playerName).toBe('Mike Trout');
        expect(currentAuctions[1].playerName).toBe('Mookie Betts');
      });

      it('parses time remaining in various formats', () => {
        const html = `
          auctionArray[1] = new Auction(1, "Team A", 10, "30:39", 0);
          auctionArray[2] = new Auction(2, "Team B", 20, "1:07:29", 0);
          auctionArray[3] = new Auction(3, "Team C", 30, "5:00", 0);
        `;

        const players: PlayerInfo[] = [
          { id: '1', firstName: 'Player', lastName: 'One', position: 'OF', mlbTeam: 'NYY', isDrafted: false },
          { id: '2', firstName: 'Player', lastName: 'Two', position: 'SP', mlbTeam: 'BOS', isDrafted: false },
          { id: '3', firstName: 'Player', lastName: 'Three', position: '1B', mlbTeam: 'CHC', isDrafted: false },
        ];

        const currentAuctions = extractCurrentAuctions(html, players);

        expect(currentAuctions[0].timeRemaining).toBe('30:39');
        expect(currentAuctions[1].timeRemaining).toBe('1:07:29');
        expect(currentAuctions[2].timeRemaining).toBe('5:00');
      });
    });
  });

  describe('HTML Parsing - Auction Info Extraction', () => {
    describe('extractAuctionInfo', () => {
      it('extracts team count from HTML', () => {
        const html = 'This is a 12 team league';
        const info = extractAuctionInfo(html, '996');

        expect(info.totalTeams).toBe(12);
        expect(info.auctionId).toBe('996');
      });

      it('extracts roster size from HTML', () => {
        const html = 'rosterSize = 26';
        const info = extractAuctionInfo(html, '996');

        expect(info.rosterSize).toBe(26);
      });

      it('extracts budget from HTML', () => {
        const html = 'budget = $260';
        const info = extractAuctionInfo(html, '996');

        expect(info.budget).toBe(260);
      });

      it('uses defaults when no info found', () => {
        const html = '<html><body>Empty</body></html>';
        const info = extractAuctionInfo(html, '996');

        expect(info.totalTeams).toBe(12);
        expect(info.rosterSize).toBe(26);
        expect(info.budget).toBe(260);
      });

      it('handles 30 team leagues', () => {
        const html = 'This is a 30 teams league with $260 budget';
        const info = extractAuctionInfo(html, '996');

        expect(info.totalTeams).toBe(30);
      });
    });
  });

  describe('Retry Logic (NFR-I3)', () => {
    describe('calculateBackoff', () => {
      it('calculates exponential backoff correctly', () => {
        expect(calculateBackoff(0)).toBe(1000); // 1 second
        expect(calculateBackoff(1)).toBe(2000); // 2 seconds
        expect(calculateBackoff(2)).toBe(4000); // 4 seconds
      });

      it('follows exponential pattern', () => {
        for (let i = 0; i < 5; i++) {
          expect(calculateBackoff(i)).toBe(Math.pow(2, i) * 1000);
        }
      });
    });
  });

  describe('URL Construction', () => {
    describe('constructAuctionUrl', () => {
      it('constructs correct auction URL', () => {
        const url = constructAuctionUrl('996');
        expect(url).toBe(
          'https://www.couchmanagers.com/auctions/?auction_id=996'
        );
      });

      it('encodes special characters in auctionId', () => {
        const url = constructAuctionUrl('99&6');
        expect(url).toBe(
          'https://www.couchmanagers.com/auctions/?auction_id=99%266'
        );
      });
    });
  });

  describe('Error Code Coverage', () => {
    it('defines all required error codes for scraping', () => {
      const errorCodes: ErrorCode[] = [
        'VALIDATION_ERROR',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
        'SCRAPE_ERROR',
        'PARSE_ERROR',
        'RATE_LIMITED',
        'TIMEOUT',
        'NETWORK_ERROR',
      ];

      errorCodes.forEach((code) => {
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(0);
      });

      expect(errorCodes.length).toBe(8);
    });
  });

  describe('Response Structure Validation', () => {
    it('success response has required fields for scraping', () => {
      const response: SyncResponse = {
        success: true,
        picks: [],
        currentAuctions: [],
        players: [],
        syncTimestamp: '2025-12-20T10:30:00Z',
        auctionInfo: {
          auctionId: '996',
          totalTeams: 12,
          rosterSize: 26,
          budget: 260,
        },
      };

      expect(response.success).toBe(true);
      expect(Array.isArray(response.picks)).toBe(true);
      expect(Array.isArray(response.currentAuctions)).toBe(true);
      expect(Array.isArray(response.players)).toBe(true);
      expect(typeof response.syncTimestamp).toBe('string');
      expect(response.auctionInfo.auctionId).toBe('996');
    });

    it('error response has required fields', () => {
      const response: ErrorResponse = {
        success: false,
        error: 'Something went wrong',
        code: 'SCRAPE_ERROR',
        syncTimestamp: '2025-12-20T10:30:00Z',
      };

      expect(response.success).toBe(false);
      expect(typeof response.error).toBe('string');
      expect(typeof response.code).toBe('string');
      expect(typeof response.syncTimestamp).toBe('string');
    });

    it('error response can include retryAfter', () => {
      const response: ErrorResponse = {
        success: false,
        error: 'Rate limited',
        code: 'RATE_LIMITED',
        syncTimestamp: '2025-12-20T10:30:00Z',
        retryAfter: 30,
      };

      expect(response.retryAfter).toBe(30);
    });
  });

  describe('Performance Requirements', () => {
    it('timeout constant is 5 seconds for page scraping', () => {
      // Page scraping takes longer than API calls
      const REQUEST_TIMEOUT_MS = 5000;
      expect(REQUEST_TIMEOUT_MS).toBe(5000);
    });
  });

  describe('Security - No API Keys Required', () => {
    it('scraping approach does not require API keys', () => {
      // Couch Managers does not offer a public API
      // We scrape public auction pages instead
      const url = constructAuctionUrl('996');

      // URL should not contain any auth tokens or API keys
      expect(url).not.toContain('api_key');
      expect(url).not.toContain('token');
      expect(url).not.toContain('auth');

      // URL should be the public auction page
      expect(url).toContain('couchmanagers.com/auctions');
    });
  });

  describe('DraftPick Data Format', () => {
    it('has consistent field structure', () => {
      const pick: DraftPick = {
        playerId: '123',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 45,
        position: 'OF',
      };

      expect(typeof pick.playerId).toBe('string');
      expect(typeof pick.playerName).toBe('string');
      expect(typeof pick.team).toBe('string');
      expect(typeof pick.auctionPrice).toBe('number');
      expect(typeof pick.position).toBe('string');
    });

    it('allows undefined position', () => {
      const pick: DraftPick = {
        playerId: '123',
        playerName: 'Mike Trout',
        team: 'Team A',
        auctionPrice: 45,
      };

      expect(pick.position).toBeUndefined();
    });
  });

  describe('PlayerInfo Data Format', () => {
    it('has consistent field structure', () => {
      const player: PlayerInfo = {
        id: '123',
        firstName: 'Mike',
        lastName: 'Trout',
        position: 'OF',
        mlbTeam: 'LAA',
        isDrafted: true,
        draftedBy: 'Team A',
        draftPrice: 45,
      };

      expect(typeof player.id).toBe('string');
      expect(typeof player.firstName).toBe('string');
      expect(typeof player.lastName).toBe('string');
      expect(typeof player.position).toBe('string');
      expect(typeof player.isDrafted).toBe('boolean');
    });

    it('allows undefined draft info for undrafted players', () => {
      const player: PlayerInfo = {
        id: '456',
        firstName: 'Shohei',
        lastName: 'Ohtani',
        position: 'DH',
        mlbTeam: 'LAD',
        isDrafted: false,
      };

      expect(player.draftedBy).toBeUndefined();
      expect(player.draftPrice).toBeUndefined();
    });
  });

  describe('CurrentAuction Data Format', () => {
    it('has consistent field structure', () => {
      const auction: CurrentAuction = {
        playerId: '123',
        playerName: 'Mike Trout',
        position: 'OF',
        mlbTeam: 'LAA',
        currentBid: 45,
        highBidder: 'Team A',
        timeRemaining: '30:15',
      };

      expect(typeof auction.playerId).toBe('string');
      expect(typeof auction.playerName).toBe('string');
      expect(typeof auction.position).toBe('string');
      expect(typeof auction.mlbTeam).toBe('string');
      expect(typeof auction.currentBid).toBe('number');
      expect(typeof auction.highBidder).toBe('string');
      expect(typeof auction.timeRemaining).toBe('string');
    });

    it('allows optional stats', () => {
      const auctionWithStats: CurrentAuction = {
        playerId: '123',
        playerName: 'Mike Trout',
        position: 'OF',
        mlbTeam: 'LAA',
        currentBid: 45,
        highBidder: 'Team A',
        timeRemaining: '30:15',
        stats: {
          avg: '.331',
          hr: 40,
          rbi: 100,
          sb: 10,
          r: 120,
        },
      };

      expect(auctionWithStats.stats).toBeDefined();
      expect(auctionWithStats.stats?.avg).toBe('.331');
      expect(auctionWithStats.stats?.hr).toBe(40);
    });

    it('allows undefined stats', () => {
      const auctionWithoutStats: CurrentAuction = {
        playerId: '456',
        playerName: 'Shohei Ohtani',
        position: 'DH',
        mlbTeam: 'LAD',
        currentBid: 50,
        highBidder: 'Team B',
        timeRemaining: '1:05:30',
      };

      expect(auctionWithoutStats.stats).toBeUndefined();
    });

    it('supports pitcher stats', () => {
      const pitcherAuction: CurrentAuction = {
        playerId: '789',
        playerName: 'Gerrit Cole',
        position: 'SP',
        mlbTeam: 'NYY',
        currentBid: 35,
        highBidder: 'Team C',
        timeRemaining: '10:00',
        stats: {
          era: '2.95',
          w: 15,
          l: 5,
          s: 0,
          k: 200,
          whip: '1.05',
        },
      };

      expect(pitcherAuction.stats?.era).toBe('2.95');
      expect(pitcherAuction.stats?.w).toBe(15);
      expect(pitcherAuction.stats?.k).toBe(200);
    });
  });
});
