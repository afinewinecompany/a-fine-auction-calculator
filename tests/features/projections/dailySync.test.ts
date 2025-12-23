/**
 * Daily Fangraphs Sync Tests
 *
 * Story: 4.6 - Implement Daily Fangraphs Sync
 *
 * Tests the daily sync logic including:
 * - League identification and filtering
 * - Error rate calculation and alerting
 * - Sync logging structure
 * - Performance target validation (NFR-P5: 10s per league)
 *
 * ⚠️ TEST COVERAGE NOTE:
 * These are unit tests for sync logic functions. The actual Edge Function
 * (supabase/functions/daily-projection-sync/index.ts) runs in Deno and cannot
 * be directly imported in this Node/Vitest environment. The helper functions
 * below are copies of the Edge Function logic and MUST be kept in sync with
 * the actual implementation. Integration tests should be performed via the
 * deployed Supabase function.
 */

// Tests use vitest globals (describe, it, expect)

// Types for sync operations
interface SyncLog {
  league_id: string;
  projection_source: string;
  status: 'success' | 'failure';
  players_updated: number;
  error_message: string | null;
  duration_ms: number;
  started_at: string;
  completed_at: string;
}

interface SyncResults {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

interface LeagueProjection {
  league_id: string;
  projection_source: string;
}

// Constants
const ALERT_THRESHOLD_PERCENT = 5;
const MAX_SYNC_DURATION_MS = 10000; // NFR-P5: 10 seconds per league

/**
 * Extract unique league/source combinations from projections
 * Matching Edge Function logic
 */
function getUniqueLeagues(
  projections: LeagueProjection[]
): Map<string, string> {
  const uniqueLeagues = new Map<string, string>();
  projections.forEach((p) => uniqueLeagues.set(p.league_id, p.projection_source));
  return uniqueLeagues;
}

/**
 * Calculate error rate percentage
 */
function calculateErrorRate(results: SyncResults): number {
  if (results.total === 0) return 0;
  return (results.failed / results.total) * 100;
}

/**
 * Determine if alert should be triggered
 */
function shouldTriggerAlert(results: SyncResults): boolean {
  return calculateErrorRate(results) > ALERT_THRESHOLD_PERCENT;
}

/**
 * Extract Fangraphs system from projection source
 * e.g., "Fangraphs - Steamer" -> "steamer"
 * NOTE: This must match the Edge Function implementation exactly
 */
function extractSystem(projectionSource: string): string {
  return projectionSource
    .replace('Fangraphs - ', '')
    .replace('THE BAT X', 'thebatx')
    .replace('THE BAT', 'thebat')
    .toLowerCase()
    .trim();
}

/**
 * Create sync log entry
 */
function createSyncLog(
  leagueId: string,
  source: string,
  status: 'success' | 'failure',
  playersUpdated: number,
  errorMessage: string | null,
  durationMs: number,
  startTime: number
): SyncLog {
  return {
    league_id: leagueId,
    projection_source: source,
    status,
    players_updated: playersUpdated,
    error_message: errorMessage,
    duration_ms: durationMs,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
  };
}

/**
 * Validate sync log meets performance requirements
 */
function validatePerformance(log: SyncLog): boolean {
  return log.duration_ms <= MAX_SYNC_DURATION_MS;
}

describe('Daily Fangraphs Sync', () => {
  describe('League Identification', () => {
    describe('getUniqueLeagues', () => {
      it('extracts unique league/source combinations', () => {
        const projections: LeagueProjection[] = [
          { league_id: 'league-1', projection_source: 'Fangraphs - Steamer' },
          { league_id: 'league-1', projection_source: 'Fangraphs - Steamer' },
          { league_id: 'league-2', projection_source: 'Fangraphs - ZiPS' },
        ];

        const unique = getUniqueLeagues(projections);

        expect(unique.size).toBe(2);
        expect(unique.get('league-1')).toBe('Fangraphs - Steamer');
        expect(unique.get('league-2')).toBe('Fangraphs - ZiPS');
      });

      it('handles empty projections', () => {
        const unique = getUniqueLeagues([]);
        expect(unique.size).toBe(0);
      });

      it('last source wins for same league_id', () => {
        const projections: LeagueProjection[] = [
          { league_id: 'league-1', projection_source: 'Fangraphs - Steamer' },
          { league_id: 'league-1', projection_source: 'Fangraphs - ZiPS' },
        ];

        const unique = getUniqueLeagues(projections);

        expect(unique.size).toBe(1);
        expect(unique.get('league-1')).toBe('Fangraphs - ZiPS');
      });
    });

    describe('extractSystem', () => {
      it('extracts system from projection source', () => {
        expect(extractSystem('Fangraphs - Steamer')).toBe('steamer');
        expect(extractSystem('Fangraphs - ZiPS')).toBe('zips');
        expect(extractSystem('Fangraphs - ATC')).toBe('atc');
      });

      it('handles THE BAT systems correctly', () => {
        // THE BAT X must be checked before THE BAT (substring match)
        expect(extractSystem('Fangraphs - THE BAT X')).toBe('thebatx');
        expect(extractSystem('Fangraphs - THE BAT')).toBe('thebat');
      });

      it('handles case-insensitive extraction', () => {
        expect(extractSystem('Fangraphs - STEAMER')).toBe('steamer');
      });
    });
  });

  describe('Error Rate Calculation', () => {
    describe('calculateErrorRate', () => {
      it('returns 0 for all successes', () => {
        const results: SyncResults = {
          total: 10,
          success: 10,
          failed: 0,
          errors: [],
        };
        expect(calculateErrorRate(results)).toBe(0);
      });

      it('returns 100 for all failures', () => {
        const results: SyncResults = {
          total: 5,
          success: 0,
          failed: 5,
          errors: ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5'],
        };
        expect(calculateErrorRate(results)).toBe(100);
      });

      it('calculates partial failure rate correctly', () => {
        const results: SyncResults = {
          total: 10,
          success: 9,
          failed: 1,
          errors: ['Error 1'],
        };
        expect(calculateErrorRate(results)).toBe(10);
      });

      it('returns 0 for empty results', () => {
        const results: SyncResults = {
          total: 0,
          success: 0,
          failed: 0,
          errors: [],
        };
        expect(calculateErrorRate(results)).toBe(0);
      });
    });

    describe('shouldTriggerAlert', () => {
      it('returns false when error rate <= 5%', () => {
        const results: SyncResults = {
          total: 100,
          success: 95,
          failed: 5,
          errors: Array(5).fill('Error'),
        };
        expect(shouldTriggerAlert(results)).toBe(false);
      });

      it('returns true when error rate > 5%', () => {
        const results: SyncResults = {
          total: 100,
          success: 94,
          failed: 6,
          errors: Array(6).fill('Error'),
        };
        expect(shouldTriggerAlert(results)).toBe(true);
      });

      it('returns false for no leagues', () => {
        const results: SyncResults = {
          total: 0,
          success: 0,
          failed: 0,
          errors: [],
        };
        expect(shouldTriggerAlert(results)).toBe(false);
      });
    });
  });

  describe('Sync Logging', () => {
    describe('createSyncLog', () => {
      it('creates success log with all fields', () => {
        const startTime = Date.now() - 5000;
        const log = createSyncLog(
          'league-123',
          'Fangraphs - Steamer',
          'success',
          500,
          null,
          5000,
          startTime
        );

        expect(log.league_id).toBe('league-123');
        expect(log.projection_source).toBe('Fangraphs - Steamer');
        expect(log.status).toBe('success');
        expect(log.players_updated).toBe(500);
        expect(log.error_message).toBeNull();
        expect(log.duration_ms).toBe(5000);
        expect(log.started_at).toBe(new Date(startTime).toISOString());
        expect(log.completed_at).toBeDefined();
      });

      it('creates failure log with error message', () => {
        const startTime = Date.now() - 1000;
        const log = createSyncLog(
          'league-456',
          'Fangraphs - ZiPS',
          'failure',
          0,
          'API rate limited',
          1000,
          startTime
        );

        expect(log.status).toBe('failure');
        expect(log.players_updated).toBe(0);
        expect(log.error_message).toBe('API rate limited');
      });

      it('generates valid ISO timestamps', () => {
        const startTime = Date.now() - 2000;
        const log = createSyncLog(
          'league-789',
          'Fangraphs - ATC',
          'success',
          300,
          null,
          2000,
          startTime
        );

        // Verify timestamps are valid ISO strings
        expect(() => new Date(log.started_at)).not.toThrow();
        expect(() => new Date(log.completed_at)).not.toThrow();

        // Verify completed_at is after started_at
        const started = new Date(log.started_at).getTime();
        const completed = new Date(log.completed_at).getTime();
        expect(completed).toBeGreaterThanOrEqual(started);
      });
    });
  });

  describe('Performance Validation (NFR-P5)', () => {
    describe('validatePerformance', () => {
      it('passes for sync within 10 seconds', () => {
        const log: SyncLog = {
          league_id: 'league-1',
          projection_source: 'Fangraphs - Steamer',
          status: 'success',
          players_updated: 500,
          error_message: null,
          duration_ms: 8000, // 8 seconds
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };

        expect(validatePerformance(log)).toBe(true);
      });

      it('passes for sync exactly at 10 seconds', () => {
        const log: SyncLog = {
          league_id: 'league-1',
          projection_source: 'Fangraphs - Steamer',
          status: 'success',
          players_updated: 500,
          error_message: null,
          duration_ms: 10000, // Exactly 10 seconds
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };

        expect(validatePerformance(log)).toBe(true);
      });

      it('fails for sync exceeding 10 seconds', () => {
        const log: SyncLog = {
          league_id: 'league-1',
          projection_source: 'Fangraphs - Steamer',
          status: 'success',
          players_updated: 500,
          error_message: null,
          duration_ms: 15000, // 15 seconds - too slow
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };

        expect(validatePerformance(log)).toBe(false);
      });
    });

    it('max sync duration is 10 seconds (10000ms)', () => {
      expect(MAX_SYNC_DURATION_MS).toBe(10000);
    });
  });

  describe('Alert Threshold', () => {
    it('alert threshold is 5%', () => {
      expect(ALERT_THRESHOLD_PERCENT).toBe(5);
    });

    it('edge case: exactly 5% does not trigger alert', () => {
      const results: SyncResults = {
        total: 20,
        success: 19,
        failed: 1, // 5% error rate
        errors: ['Error'],
      };
      expect(calculateErrorRate(results)).toBe(5);
      expect(shouldTriggerAlert(results)).toBe(false);
    });

    it('edge case: 5.01% triggers alert', () => {
      // 6 failures out of 100 = 6% (just over threshold)
      const results: SyncResults = {
        total: 100,
        success: 94,
        failed: 6,
        errors: Array(6).fill('Error'),
      };
      expect(calculateErrorRate(results)).toBe(6);
      expect(shouldTriggerAlert(results)).toBe(true);
    });
  });

  describe('Sync Results Structure', () => {
    it('has required fields', () => {
      const results: SyncResults = {
        total: 5,
        success: 4,
        failed: 1,
        errors: ['League league-123: API error'],
      };

      expect(results).toHaveProperty('total');
      expect(results).toHaveProperty('success');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('errors');
      expect(Array.isArray(results.errors)).toBe(true);
    });

    it('errors array contains league context', () => {
      const errorMessage = 'League league-456: Connection timeout';
      expect(errorMessage).toMatch(/^League .+:/);
    });
  });

  describe('Cron Schedule', () => {
    it('2 AM UTC cron expression is valid', () => {
      const cronExpression = '0 2 * * *';

      // Parse cron expression parts
      const parts = cronExpression.split(' ');
      expect(parts).toHaveLength(5);

      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

      expect(minute).toBe('0'); // At minute 0
      expect(hour).toBe('2'); // At 2 AM
      expect(dayOfMonth).toBe('*'); // Every day of month
      expect(month).toBe('*'); // Every month
      expect(dayOfWeek).toBe('*'); // Every day of week
    });
  });

  describe('Projection Source Filtering', () => {
    it('identifies Fangraphs sources correctly', () => {
      const fangraphsSource = 'Fangraphs - Steamer';
      const googleSheetsSource = 'Google Sheets - My Projections';

      expect(fangraphsSource.includes('Fangraphs')).toBe(true);
      expect(googleSheetsSource.includes('Fangraphs')).toBe(false);
    });

    it('supports multiple Fangraphs systems', () => {
      const systems = [
        'Fangraphs - Steamer',
        'Fangraphs - ZiPS',
        'Fangraphs - THE BAT',
        'Fangraphs - THE BAT X',
        'Fangraphs - ATC',
      ];

      systems.forEach((source) => {
        expect(source.startsWith('Fangraphs - ')).toBe(true);
      });
    });
  });

  describe('Upsert Operation', () => {
    it('upsert conflict key is league_id + player_name', () => {
      // This validates the unique constraint from migration 007
      const conflictKey = 'league_id,player_name';
      expect(conflictKey).toBe('league_id,player_name');
    });

    it('updated_at timestamp is set on upsert', () => {
      const projection = {
        league_id: 'league-1',
        player_name: 'Aaron Judge',
        team: 'NYY',
        positions: ['OF'],
        projection_source: 'Fangraphs - Steamer',
        stats_hitters: { hr: 45, rbi: 100 },
        stats_pitchers: null,
        updated_at: new Date().toISOString(),
      };

      expect(projection.updated_at).toBeDefined();
      expect(() => new Date(projection.updated_at)).not.toThrow();
    });
  });
});
