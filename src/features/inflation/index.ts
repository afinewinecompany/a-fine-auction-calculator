/**
 * Inflation Feature Module
 *
 * Exports all public types and utilities for the inflation engine.
 * The inflation engine calculates real-time, tier-specific, position-aware
 * inflation adjustments during live auction drafts.
 *
 * @module inflation
 */

// Types
export type {
  Position,
  PositionInflationRate,
  TierInflationRate,
  InflationState,
  InflationMetrics,
  InflationSnapshot,
  PlayerValue,
  BudgetDepletionFactor,
  DraftedPlayerInput,
  ProjectionInput,
} from './types/inflation.types';

// Enums, Constants, and Type Aliases
export { PlayerTier, POSITIONS, PLAYER_TIERS } from './types/inflation.types';
export type { Tier } from './types/inflation.types';

// Type Guards
export { isPosition, isPlayerTier } from './types/inflation.types';

// Factory Functions
export {
  createDefaultPositionRates,
  createDefaultTierRates,
  createDefaultInflationState,
} from './types/inflation.types';

// Calculation Utilities
export {
  calculateOverallInflation,
  calculatePositionInflation,
  calculateTierInflation,
  calculateBudgetDepletionFactor,
  calculateAdjustedValues,
  calculateSingleAdjustedValue,
  assignPlayerTier,
  getPercentile,
  BUDGET_DEPLETION_MIN_MULTIPLIER,
  BUDGET_DEPLETION_MAX_MULTIPLIER,
  type PositionDraftedPlayerInput,
  type PositionProjectionInput,
  type TierDraftedPlayerInput,
  type TierProjectionInput,
  type BudgetDepletionResult,
  type AdjustedValuePlayerInput,
  type AdjustedValueInflationState,
} from './utils/inflationCalculations';

// Store
export {
  useInflationStore,
  useOverallInflation,
  usePositionInflation,
  usePositionInflationRate,
  useTierInflation,
  useTierInflationRate,
  useBudgetDepleted,
  useBudgetDepletion,
  useAdjustedValue,
  useAdjustedValues,
  useInflationCalculating,
  useInflationLastUpdated,
  useInflationError,
  usePlayersRemaining,
  type InflationDraftedPlayer,
  type InflationProjection,
  type BudgetContext,
  type InflationStoreState,
  type InflationStoreActions,
  type InflationStore,
} from './stores/inflationStore';

// Hooks
export {
  useInflationIntegration,
  setupInflationSubscription,
  type UseInflationIntegrationOptions,
  type UseInflationIntegrationResult,
} from './hooks/useInflationIntegration';

// Trend Calculations (Story 8.4)
export {
  calculateInflationTrend,
  getTrendIcon,
  getTrendColor,
  getTrendLabel,
  formatTrendTooltip,
  DEFAULT_WINDOW_SIZE,
  TREND_THRESHOLD,
  type TrendDirection,
  type TrendResult,
} from './utils/trendCalculations';

// Types - Inflation History (Story 8.4)
export type { InflationHistoryEntry } from './types/inflation.types';

// Performance Logging (Story 13.11)
export {
  logInflationPerformance,
  withPerformanceLogging,
  startPerformanceMeasurement,
  type CalculationType,
  type PerformanceLogEntry,
} from './services/performanceLogger';
