/**
 * Inflation Performance Logger Service
 *
 * Provides non-blocking performance logging for inflation calculations.
 * Logs are sent to the database asynchronously to avoid impacting calculation performance.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 * NFR: NFR-M4 (Track median, p95, p99 latency), NFR-M5 (Real-time performance display)
 *
 * ## Usage
 *
 * For automatic instrumentation, use `withPerformanceLogging`:
 * ```typescript
 * const wrappedCalculation = withPerformanceLogging(
 *   calculateOverallInflation,
 *   'basic'
 * );
 * const result = await wrappedCalculation(draftedPlayers, projections);
 * ```
 *
 * For manual instrumentation:
 * ```typescript
 * const start = performance.now();
 * const result = calculateOverallInflation(draftedPlayers, projections);
 * const latencyMs = Math.round(performance.now() - start);
 * logInflationPerformance({ calculationType: 'basic', latencyMs, playerCount: 100 });
 * ```
 *
 * @module performanceLogger
 */

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Type of inflation calculation being logged
 */
export type CalculationType = 'basic' | 'position' | 'tier' | 'budget_depletion';

/**
 * Performance log entry for an inflation calculation
 */
export interface PerformanceLogEntry {
  /** Type of calculation performed */
  calculationType: CalculationType;
  /** Execution time in milliseconds */
  latencyMs: number;
  /** Number of players processed (optional, for context) */
  playerCount?: number;
  /** Associated draft ID (optional, for correlation) */
  draftId?: string;
}

/**
 * Logs inflation calculation performance asynchronously.
 *
 * This function is fire-and-forget - it will not throw errors or block the caller.
 * Failed logs are silently dropped to ensure calculation performance is not impacted.
 *
 * @param entry - Performance log entry to record
 *
 * @remarks
 * - Logging is completely non-blocking (<1ms overhead)
 * - Failed logs are silently ignored (logged to console in development)
 * - If Supabase is not configured, the function returns immediately
 *
 * @example
 * ```typescript
 * logInflationPerformance({
 *   calculationType: 'basic',
 *   latencyMs: 45,
 *   playerCount: 200,
 *   draftId: 'uuid-here',
 * });
 * ```
 */
export function logInflationPerformance(entry: PerformanceLogEntry): void {
  // Early exit if Supabase is not configured
  if (!isSupabaseConfigured()) {
    return;
  }

  // Fire-and-forget async logging
  (async () => {
    try {
      const supabase = getSupabase();
      await supabase.from('inflation_performance_logs').insert({
        calculation_type: entry.calculationType,
        latency_ms: entry.latencyMs,
        player_count: entry.playerCount ?? null,
        draft_id: entry.draftId ?? null,
      });
    } catch (error) {
      // Log error in development only, never throw
      if (import.meta.env.DEV) {
        console.warn('[performanceLogger] Failed to log performance:', error);
      }
    }
  })();
}

/**
 * Higher-order function that wraps an inflation calculation with performance logging.
 *
 * Automatically measures execution time and logs it to the database.
 * The wrapped function maintains the same signature as the original.
 *
 * @param calculationFn - The inflation calculation function to wrap
 * @param calculationType - Type of calculation for logging
 * @param options - Optional configuration for the wrapper
 * @returns Wrapped function that logs performance after execution
 *
 * @example
 * ```typescript
 * import { calculateOverallInflation } from './inflationCalculations';
 *
 * const trackedCalculation = withPerformanceLogging(
 *   calculateOverallInflation,
 *   'basic'
 * );
 *
 * // Use exactly like the original function
 * const rate = trackedCalculation(draftedPlayers, projections);
 * ```
 */
export function withPerformanceLogging<TArgs extends unknown[], TResult>(
  calculationFn: (...args: TArgs) => TResult,
  calculationType: CalculationType,
  options?: {
    /** Extract player count from arguments (for logging context) */
    getPlayerCount?: (...args: TArgs) => number;
    /** Extract draft ID from arguments (for correlation) */
    getDraftId?: (...args: TArgs) => string | undefined;
  }
): (...args: TArgs) => TResult {
  return (...args: TArgs): TResult => {
    const start = performance.now();

    // Execute the actual calculation
    const result = calculationFn(...args);

    // Calculate latency and log (non-blocking)
    const latencyMs = Math.round(performance.now() - start);

    logInflationPerformance({
      calculationType,
      latencyMs,
      playerCount: options?.getPlayerCount?.(...args),
      draftId: options?.getDraftId?.(...args),
    });

    return result;
  };
}

/**
 * Creates a performance measurement context for manual instrumentation.
 *
 * Use this when you need more control over what gets logged or when
 * the calculation spans multiple function calls.
 *
 * @param calculationType - Type of calculation being measured
 * @returns Object with stop() method to end measurement and log
 *
 * @example
 * ```typescript
 * const perf = startPerformanceMeasurement('basic');
 *
 * // Do multiple operations...
 * const rate = calculateOverallInflation(players, projections);
 * const adjusted = calculateAdjustedValues(players, state);
 *
 * // Stop and log when done
 * perf.stop({ playerCount: players.length, draftId: 'uuid' });
 * ```
 */
export function startPerformanceMeasurement(calculationType: CalculationType): {
  stop: (options?: { playerCount?: number; draftId?: string }) => number;
} {
  const start = performance.now();

  return {
    stop: (options?: { playerCount?: number; draftId?: string }) => {
      const latencyMs = Math.round(performance.now() - start);

      logInflationPerformance({
        calculationType,
        latencyMs,
        playerCount: options?.playerCount,
        draftId: options?.draftId,
      });

      return latencyMs;
    },
  };
}
