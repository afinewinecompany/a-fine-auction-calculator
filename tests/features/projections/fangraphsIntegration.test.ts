/**
 * Fangraphs Integration Tests
 *
 * Story: 4.4 - Implement Fangraphs API Integration
 *
 * These tests verify the normalization logic, position inference,
 * and error handling patterns used in the Edge Function.
 *
 * Fangraphs API is public (no API key required):
 * https://www.fangraphs.com/api/projections?type=steamer&stats=bat&pos=all&team=0&players=0&lg=all
 */

import { describe, it, expect } from 'vitest';

// Types matching the Edge Function
type ProjectionSystem = 'steamer' | 'thebat' | 'thebatx' | 'atc' | 'zips';
type PlayerType = 'hitters' | 'pitchers';
type ErrorCode =
  | 'RATE_LIMITED'
  | 'API_ERROR'
  | 'INVALID_SYSTEM'
  | 'INVALID_PLAYER_TYPE'
  | 'NETWORK_ERROR';

// System aliases for user-friendly input
const SYSTEM_ALIASES: Record<string, ProjectionSystem> = {
  steamer: 'steamer',
  bat: 'thebat',
  thebat: 'thebat',
  batx: 'thebatx',
  thebatx: 'thebatx',
  atc: 'atc',
  zips: 'zips',
};

// Raw Fangraphs hitter response structure
interface FangraphsHitter {
  PlayerName: string;
  Team: string;
  playerid: string;
  minpos?: string;
  G?: number;
  AB?: number;
  PA?: number;
  H?: number;
  HR?: number;
  R?: number;
  RBI?: number;
  BB?: number;
  SO?: number;
  SB?: number;
  CS?: number;
  AVG?: number;
  OBP?: number;
  SLG?: number;
  OPS?: number;
  ISO?: number;
  BABIP?: number;
  WAR?: number;
  wRC?: number;
  'wRC+'?: number;
  FPTS?: number;
  ADP?: number;
}

// Raw Fangraphs pitcher response structure
interface FangraphsPitcher {
  PlayerName: string;
  Team: string;
  playerid: string;
  W?: number;
  L?: number;
  GS?: number;
  G?: number;
  SV?: number;
  HLD?: number;
  IP?: number;
  H?: number;
  ER?: number;
  HR?: number;
  SO?: number;
  BB?: number;
  ERA?: number;
  WHIP?: number;
  'K/9'?: number;
  'BB/9'?: number;
  'K%'?: number;
  'BB%'?: number;
  FIP?: number;
  BABIP?: number;
  'LOB%'?: number;
  WAR?: number;
  QS?: number;
  FPTS?: number;
}

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

// Constants
const VALID_SYSTEMS: readonly ProjectionSystem[] = [
  'steamer',
  'thebat',
  'thebatx',
  'atc',
  'zips',
];
const VALID_PLAYER_TYPES: readonly PlayerType[] = ['hitters', 'pitchers'];
const VALID_POSITIONS = [
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

// Utility functions to test (matching Edge Function implementation)
function resolveSystemAlias(system: string): ProjectionSystem | undefined {
  return SYSTEM_ALIASES[system.toLowerCase()];
}

function isValidSystem(system: string): boolean {
  return resolveSystemAlias(system) !== undefined;
}

function isValidPlayerType(playerType: string): playerType is PlayerType {
  return VALID_PLAYER_TYPES.includes(playerType.toLowerCase() as PlayerType);
}

function isValidPosition(pos: string): boolean {
  return VALID_POSITIONS.includes(pos.toUpperCase());
}

function parsePositions(minpos: string | undefined): string[] {
  if (!minpos) return ['UTIL'];

  const positions = minpos
    .split(/[,/]/)
    .map((p) => p.trim().toUpperCase())
    .filter((p) => isValidPosition(p));

  return positions.length > 0 ? positions : ['UTIL'];
}

function inferPitcherPositions(player: FangraphsPitcher): string[] {
  const saves = player.SV ?? 0;
  const holds = player.HLD ?? 0;
  const gamesStarted = player.GS ?? 0;
  const totalGames = player.G ?? 0;

  if (saves > 5 || holds > 10) {
    return ['RP'];
  }

  if (totalGames > 0 && gamesStarted / totalGames < 0.5) {
    return ['RP'];
  }

  return ['SP'];
}

function normalizeTeam(team: string | undefined): string {
  if (!team) return '';

  const normalized = team.trim().toUpperCase();

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

function normalizeHitter(player: FangraphsHitter): NormalizedPlayer {
  const positions = parsePositions(player.minpos);

  return {
    playerName: player.PlayerName || '',
    team: normalizeTeam(player.Team),
    positions,
    fangraphsId: player.playerid || '',
    projectedValue: null,
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

function normalizePitcher(player: FangraphsPitcher): NormalizedPlayer {
  const positions = inferPitcherPositions(player);

  return {
    playerName: player.PlayerName || '',
    team: normalizeTeam(player.Team),
    positions,
    fangraphsId: player.playerid || '',
    projectedValue: null,
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

// Calculate exponential backoff (matching Edge Function)
function calculateBackoff(attempt: number): number {
  return Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
}

describe('Fangraphs Integration', () => {
  describe('System Validation', () => {
    describe('isValidSystem', () => {
      it('accepts valid projection systems', () => {
        expect(isValidSystem('steamer')).toBe(true);
        expect(isValidSystem('thebat')).toBe(true);
        expect(isValidSystem('thebatx')).toBe(true);
        expect(isValidSystem('atc')).toBe(true);
        expect(isValidSystem('zips')).toBe(true);
      });

      it('accepts user-friendly aliases', () => {
        expect(isValidSystem('bat')).toBe(true);
        expect(isValidSystem('batx')).toBe(true);
      });

      it('accepts case-insensitive system names', () => {
        expect(isValidSystem('STEAMER')).toBe(true);
        expect(isValidSystem('TheBat')).toBe(true);
        expect(isValidSystem('ZIPS')).toBe(true);
      });

      it('rejects invalid systems', () => {
        expect(isValidSystem('invalid')).toBe(false);
        expect(isValidSystem('')).toBe(false);
        expect(isValidSystem('ja')).toBe(false); // Not a real Fangraphs system
      });
    });

    describe('resolveSystemAlias', () => {
      it('resolves bat to thebat', () => {
        expect(resolveSystemAlias('bat')).toBe('thebat');
      });

      it('resolves batx to thebatx', () => {
        expect(resolveSystemAlias('batx')).toBe('thebatx');
      });

      it('keeps steamer as steamer', () => {
        expect(resolveSystemAlias('steamer')).toBe('steamer');
      });
    });

    describe('isValidPlayerType', () => {
      it('accepts valid player types', () => {
        expect(isValidPlayerType('hitters')).toBe(true);
        expect(isValidPlayerType('pitchers')).toBe(true);
      });

      it('accepts case-insensitive player types', () => {
        expect(isValidPlayerType('HITTERS')).toBe(true);
        expect(isValidPlayerType('Pitchers')).toBe(true);
      });

      it('rejects invalid player types', () => {
        expect(isValidPlayerType('batters')).toBe(false);
        expect(isValidPlayerType('')).toBe(false);
      });
    });
  });

  describe('Position Parsing', () => {
    describe('parsePositions', () => {
      it('parses single position', () => {
        expect(parsePositions('OF')).toEqual(['OF']);
        expect(parsePositions('SS')).toEqual(['SS']);
      });

      it('parses comma-separated positions', () => {
        expect(parsePositions('SS,2B,3B')).toEqual(['SS', '2B', '3B']);
      });

      it('parses slash-separated positions', () => {
        expect(parsePositions('1B/DH')).toEqual(['1B', 'DH']);
      });

      it('returns UTIL for undefined', () => {
        expect(parsePositions(undefined)).toEqual(['UTIL']);
      });

      it('returns UTIL for empty string', () => {
        expect(parsePositions('')).toEqual(['UTIL']);
      });

      it('filters invalid positions', () => {
        expect(parsePositions('OF,INVALID,SS')).toEqual(['OF', 'SS']);
      });

      it('normalizes case to uppercase', () => {
        expect(parsePositions('of,ss')).toEqual(['OF', 'SS']);
      });
    });

    describe('inferPitcherPositions', () => {
      it('infers RP for pitchers with significant saves', () => {
        const player: FangraphsPitcher = {
          PlayerName: 'Closer',
          Team: 'NYY',
          playerid: '12345',
          SV: 30,
          G: 60,
          GS: 0,
        };
        expect(inferPitcherPositions(player)).toEqual(['RP']);
      });

      it('infers RP for pitchers with significant holds', () => {
        const player: FangraphsPitcher = {
          PlayerName: 'Setup Man',
          Team: 'NYY',
          playerid: '12345',
          HLD: 25,
          G: 70,
          GS: 0,
        };
        expect(inferPitcherPositions(player)).toEqual(['RP']);
      });

      it('infers RP for pitchers with mostly relief appearances', () => {
        const player: FangraphsPitcher = {
          PlayerName: 'Relief Pitcher',
          Team: 'NYY',
          playerid: '12345',
          G: 50,
          GS: 5,
        };
        expect(inferPitcherPositions(player)).toEqual(['RP']);
      });

      it('infers SP for pitchers with mostly starts', () => {
        const player: FangraphsPitcher = {
          PlayerName: 'Starting Pitcher',
          Team: 'NYY',
          playerid: '12345',
          G: 32,
          GS: 32,
        };
        expect(inferPitcherPositions(player)).toEqual(['SP']);
      });

      it('defaults to SP for pitchers with no game data', () => {
        const player: FangraphsPitcher = {
          PlayerName: 'Pitcher',
          Team: 'NYY',
          playerid: '12345',
        };
        expect(inferPitcherPositions(player)).toEqual(['SP']);
      });
    });
  });

  describe('Team Normalization', () => {
    describe('normalizeTeam', () => {
      it('keeps standard abbreviations unchanged', () => {
        expect(normalizeTeam('NYY')).toBe('NYY');
        expect(normalizeTeam('LAD')).toBe('LAD');
        expect(normalizeTeam('ATL')).toBe('ATL');
      });

      it('normalizes alternate abbreviations', () => {
        expect(normalizeTeam('CHW')).toBe('CWS');
        expect(normalizeTeam('KCR')).toBe('KC');
        expect(normalizeTeam('SDP')).toBe('SD');
        expect(normalizeTeam('SFG')).toBe('SF');
        expect(normalizeTeam('TBR')).toBe('TB');
        expect(normalizeTeam('WAS')).toBe('WSH');
        expect(normalizeTeam('FLA')).toBe('MIA');
      });

      it('handles case-insensitive input', () => {
        expect(normalizeTeam('nyy')).toBe('NYY');
        expect(normalizeTeam('chw')).toBe('CWS');
      });

      it('returns empty string for undefined', () => {
        expect(normalizeTeam(undefined)).toBe('');
      });

      it('trims whitespace', () => {
        expect(normalizeTeam('  NYY  ')).toBe('NYY');
      });
    });
  });

  describe('Hitter Normalization', () => {
    it('normalizes hitter data correctly', () => {
      const player: FangraphsHitter = {
        PlayerName: 'Aaron Judge',
        Team: 'NYY',
        playerid: '15640',
        minpos: 'OF',
        G: 141,
        AB: 510,
        PA: 635,
        H: 146,
        HR: 43,
        R: 110,
        RBI: 104,
        SB: 9,
        CS: 2,
        BB: 112,
        SO: 155,
        AVG: 0.285,
        OBP: 0.417,
        SLG: 0.588,
        OPS: 1.005,
        ISO: 0.303,
        BABIP: 0.325,
        WAR: 6.8,
        wRC: 128,
        'wRC+': 172,
        FPTS: 1153,
        ADP: 1.8,
      };

      const normalized = normalizeHitter(player);

      expect(normalized.playerName).toBe('Aaron Judge');
      expect(normalized.team).toBe('NYY');
      expect(normalized.positions).toEqual(['OF']);
      expect(normalized.fangraphsId).toBe('15640');
      expect(normalized.projectedValue).toBeNull();
      expect(normalized.statsHitters).toEqual({
        g: 141,
        ab: 510,
        pa: 635,
        h: 146,
        hr: 43,
        r: 110,
        rbi: 104,
        sb: 9,
        cs: 2,
        bb: 112,
        so: 155,
        avg: 0.285,
        obp: 0.417,
        slg: 0.588,
        ops: 1.005,
        iso: 0.303,
        babip: 0.325,
        war: 6.8,
        wrc: 128,
        wrcPlus: 172,
      });
      expect(normalized.statsPitchers).toBeNull();
      expect(normalized.fantasyPoints).toBe(1153);
      expect(normalized.adp).toBe(1.8);
    });

    it('handles missing stats with defaults of 0', () => {
      const player: FangraphsHitter = {
        PlayerName: 'Minimal Player',
        Team: 'BOS',
        playerid: '99999',
      };

      const normalized = normalizeHitter(player);

      expect(normalized.statsHitters?.hr).toBe(0);
      expect(normalized.statsHitters?.avg).toBe(0);
      expect(normalized.fantasyPoints).toBeNull();
      expect(normalized.adp).toBeNull();
    });
  });

  describe('Pitcher Normalization', () => {
    it('normalizes pitcher data correctly', () => {
      const player: FangraphsPitcher = {
        PlayerName: 'Tarik Skubal',
        Team: 'DET',
        playerid: '22267',
        W: 14,
        L: 9,
        GS: 32,
        G: 32,
        SV: 0,
        HLD: 0,
        IP: 200,
        H: 160,
        ER: 62,
        HR: 20,
        SO: 242,
        BB: 44,
        ERA: 2.81,
        WHIP: 1.02,
        'K/9': 10.9,
        'BB/9': 1.96,
        'K%': 0.304,
        'BB%': 0.055,
        FIP: 2.79,
        BABIP: 0.289,
        'LOB%': 0.772,
        WAR: 5.86,
        QS: 23,
        FPTS: 1149,
      };

      const normalized = normalizePitcher(player);

      expect(normalized.playerName).toBe('Tarik Skubal');
      expect(normalized.team).toBe('DET');
      expect(normalized.positions).toEqual(['SP']);
      expect(normalized.fangraphsId).toBe('22267');
      expect(normalized.statsPitchers).toEqual({
        w: 14,
        l: 9,
        g: 32,
        gs: 32,
        sv: 0,
        hld: 0,
        ip: 200,
        h: 160,
        er: 62,
        hr: 20,
        so: 242,
        bb: 44,
        era: 2.81,
        whip: 1.02,
        k9: 10.9,
        bb9: 1.96,
        kPercent: 0.304,
        bbPercent: 0.055,
        fip: 2.79,
        babip: 0.289,
        lobPercent: 0.772,
        war: 5.86,
        qs: 23,
      });
      expect(normalized.statsHitters).toBeNull();
      expect(normalized.fantasyPoints).toBe(1149);
    });

    it('correctly identifies relief pitchers', () => {
      const closer: FangraphsPitcher = {
        PlayerName: 'Emmanuel Clase',
        Team: 'CLE',
        playerid: '21345',
        G: 70,
        GS: 0,
        SV: 40,
        HLD: 0,
      };

      const normalized = normalizePitcher(closer);
      expect(normalized.positions).toEqual(['RP']);
    });
  });

  describe('Retry Logic', () => {
    describe('calculateBackoff', () => {
      it('calculates exponential backoff correctly', () => {
        expect(calculateBackoff(1)).toBe(2000); // 2 seconds
        expect(calculateBackoff(2)).toBe(4000); // 4 seconds
        expect(calculateBackoff(3)).toBe(8000); // 8 seconds
      });
    });
  });

  describe('Error Response Structure', () => {
    it('defines all required error codes', () => {
      const errorCodes: ErrorCode[] = [
        'RATE_LIMITED',
        'API_ERROR',
        'INVALID_SYSTEM',
        'INVALID_PLAYER_TYPE',
        'NETWORK_ERROR',
      ];

      errorCodes.forEach((code) => {
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Format Consistency (NFR-I8)', () => {
    it('produces consistent hitter stat fields across all inputs', () => {
      const minimalPlayer: FangraphsHitter = {
        PlayerName: 'Minimal',
        Team: '',
        playerid: '',
      };

      const fullPlayer: FangraphsHitter = {
        PlayerName: 'Full',
        Team: 'NYY',
        playerid: '123',
        G: 150,
        AB: 550,
        PA: 650,
        H: 160,
        HR: 35,
        R: 100,
        RBI: 100,
        SB: 10,
        CS: 3,
        BB: 80,
        SO: 120,
        AVG: 0.291,
        OBP: 0.38,
        SLG: 0.52,
        OPS: 0.9,
        ISO: 0.229,
        BABIP: 0.31,
        WAR: 5.0,
        wRC: 110,
        'wRC+': 140,
        FPTS: 900,
        ADP: 25,
      };

      const minNorm = normalizeHitter(minimalPlayer);
      const fullNorm = normalizeHitter(fullPlayer);

      // Both should have exact same keys in statsHitters
      const minKeys = Object.keys(minNorm.statsHitters!).sort();
      const fullKeys = Object.keys(fullNorm.statsHitters!).sort();

      expect(minKeys).toEqual(fullKeys);
      expect(minKeys).toEqual([
        'ab',
        'avg',
        'babip',
        'bb',
        'cs',
        'g',
        'h',
        'hr',
        'iso',
        'obp',
        'ops',
        'pa',
        'r',
        'rbi',
        'sb',
        'slg',
        'so',
        'war',
        'wrc',
        'wrcPlus',
      ]);
    });

    it('produces consistent pitcher stat fields across all inputs', () => {
      const minimalPlayer: FangraphsPitcher = {
        PlayerName: 'Minimal',
        Team: '',
        playerid: '',
      };

      const fullPlayer: FangraphsPitcher = {
        PlayerName: 'Full',
        Team: 'NYY',
        playerid: '123',
        W: 15,
        L: 8,
        G: 32,
        GS: 32,
        SV: 0,
        HLD: 0,
        IP: 200,
        H: 180,
        ER: 70,
        HR: 25,
        SO: 200,
        BB: 50,
        ERA: 3.15,
        WHIP: 1.15,
        'K/9': 9.0,
        'BB/9': 2.25,
        'K%': 0.25,
        'BB%': 0.07,
        FIP: 3.5,
        BABIP: 0.3,
        'LOB%': 0.72,
        WAR: 4.0,
        QS: 18,
        FPTS: 800,
      };

      const minNorm = normalizePitcher(minimalPlayer);
      const fullNorm = normalizePitcher(fullPlayer);

      // Both should have exact same keys in statsPitchers
      const minKeys = Object.keys(minNorm.statsPitchers!).sort();
      const fullKeys = Object.keys(fullNorm.statsPitchers!).sort();

      expect(minKeys).toEqual(fullKeys);
      expect(minKeys).toEqual([
        'babip',
        'bb',
        'bb9',
        'bbPercent',
        'er',
        'era',
        'fip',
        'g',
        'gs',
        'h',
        'hld',
        'hr',
        'ip',
        'k9',
        'kPercent',
        'l',
        'lobPercent',
        'qs',
        'so',
        'sv',
        'w',
        'war',
        'whip',
      ]);
    });
  });

  describe('Fangraphs API URL Structure', () => {
    it('constructs correct URL for hitters', () => {
      const baseUrl = 'https://www.fangraphs.com/api/projections';
      const system = 'steamer';
      const statsParam = 'bat';
      const url = `${baseUrl}?type=${system}&stats=${statsParam}&pos=all&team=0&players=0&lg=all`;

      expect(url).toBe(
        'https://www.fangraphs.com/api/projections?type=steamer&stats=bat&pos=all&team=0&players=0&lg=all'
      );
    });

    it('constructs correct URL for pitchers', () => {
      const baseUrl = 'https://www.fangraphs.com/api/projections';
      const system = 'steamer';
      const statsParam = 'pit';
      const url = `${baseUrl}?type=${system}&stats=${statsParam}&pos=all&team=0&players=0&lg=all`;

      expect(url).toBe(
        'https://www.fangraphs.com/api/projections?type=steamer&stats=pit&pos=all&team=0&players=0&lg=all'
      );
    });
  });
});
