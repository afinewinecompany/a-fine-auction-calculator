/**
 * Summary Types
 *
 * Type definitions for the post-draft summary component.
 * Provides interfaces for DraftSummary props, metrics, and display data.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 */

import type { DraftedPlayer } from './draft.types';
import type { InflationState } from '@/features/inflation';
import type { PlayerProjection } from '@/features/projections';

/**
 * Budget state tracking for draft summary.
 * Tracks initial budget, spending, and remaining funds.
 */
export interface BudgetState {
  /** Starting auction budget (typically $260) */
  initial: number;
  /** Remaining budget after all draft picks */
  remaining: number;
  /** Total amount spent on players */
  spent: number;
}

/**
 * Position slot tracking for roster summary.
 */
export interface PositionSlotInfo {
  /** Number of slots filled at this position */
  filled: number;
  /** Total slots available for this position */
  total: number;
}

/**
 * Roster composition summary by position.
 */
export interface RosterByPosition {
  C: PositionSlotInfo;
  '1B': PositionSlotInfo;
  '2B': PositionSlotInfo;
  SS: PositionSlotInfo;
  '3B': PositionSlotInfo;
  OF: PositionSlotInfo;
  UTIL: PositionSlotInfo;
  SP: PositionSlotInfo;
  RP: PositionSlotInfo;
  BN: PositionSlotInfo;
}

/**
 * Overall roster summary statistics.
 */
export interface RosterSummary {
  /** Total roster slots in the league */
  totalSlots: number;
  /** Number of slots currently filled */
  filledSlots: number;
  /** Breakdown by position */
  byPosition: RosterByPosition;
}

/**
 * Calculated summary metrics for post-draft analysis.
 */
export interface SummaryMetrics {
  /** Total amount spent on all players */
  totalSpent: number;
  /** Remaining budget after draft */
  budgetRemaining: number;
  /** Number of players on the roster */
  playersRostered: number;
  /** Number of "steals" (players acquired below value) */
  totalSteals: number;
  /** Total projected value of roster */
  totalValue: number;
  /** Value gained over budget spent (positive = good value) */
  valueOverBudget: number;
  /** Average value per rostered player */
  averageValuePerPlayer: number;
}

/**
 * Props for the DraftSummary component.
 * Provides all data needed to render post-draft analytics.
 */
export interface DraftSummaryProps {
  /** Array of drafted players on the user's roster */
  roster: DraftedPlayer[];
  /** Budget state (initial, spent, remaining) */
  budget: BudgetState;
  /** Player projections for value calculations */
  projections: PlayerProjection[];
  /** Inflation state at draft completion */
  inflationData: InflationState;
}

/**
 * Props for RosterOverview section placeholder.
 * Will display complete roster organized by position.
 */
export interface RosterOverviewProps {
  /** Drafted players to display */
  roster: DraftedPlayer[];
  /** Roster composition summary */
  rosterSummary?: RosterSummary;
}

/**
 * Position spending data structure
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */
export interface PositionSpending {
  amount: number;
  percentage: number;
}

/**
 * Spending breakdown by position category
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */
export interface SpendingByPosition {
  hitters: PositionSpending;
  pitchers: PositionSpending;
  bench: PositionSpending;
}

/**
 * Props for BudgetUtilization section.
 * Displays spending breakdown and budget analysis.
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */
export interface BudgetUtilizationProps {
  /** Budget state data */
  budget: BudgetState;
  /** Spending breakdown by position category */
  spendingByPosition?: SpendingByPosition;
}

/**
 * Props for ValueAnalysis section placeholder.
 * Will display value comparison and steals analysis.
 */
export interface ValueAnalysisProps {
  /** Drafted players for value comparison */
  roster: DraftedPlayer[];
  /** Projections for calculating value differences */
  projections: PlayerProjection[];
  /** Inflation data for adjusted value calculations */
  inflationData: InflationState;
}

/**
 * Value classification for a drafted player.
 * Used to highlight steals vs overpays.
 */
export type ValueClassification = 'steal' | 'fair' | 'overpay';

/**
 * Player value analysis result.
 */
export interface PlayerValueAnalysis {
  /** Player ID */
  playerId: string;
  /** Player name */
  playerName: string;
  /** Amount paid in auction */
  pricePaid: number;
  /** Projected value at time of draft */
  projectedValue: number;
  /** Difference (positive = steal, negative = overpay) */
  valueDifference: number;
  /** Classification based on value difference */
  classification: ValueClassification;
}

/**
 * Creates default budget state for initialization.
 */
export function createDefaultBudgetState(initialBudget: number = 260): BudgetState {
  return {
    initial: initialBudget,
    remaining: initialBudget,
    spent: 0,
  };
}

/**
 * Creates default roster summary for initialization.
 */
export function createDefaultRosterSummary(): RosterSummary {
  return {
    totalSlots: 23,
    filledSlots: 0,
    byPosition: {
      C: { filled: 0, total: 1 },
      '1B': { filled: 0, total: 1 },
      '2B': { filled: 0, total: 1 },
      SS: { filled: 0, total: 1 },
      '3B': { filled: 0, total: 1 },
      OF: { filled: 0, total: 5 },
      UTIL: { filled: 0, total: 1 },
      SP: { filled: 0, total: 6 },
      RP: { filled: 0, total: 3 },
      BN: { filled: 0, total: 3 },
    },
  };
}

/**
 * Creates empty summary metrics for initialization.
 */
export function createDefaultSummaryMetrics(): SummaryMetrics {
  return {
    totalSpent: 0,
    budgetRemaining: 0,
    playersRostered: 0,
    totalSteals: 0,
    totalValue: 0,
    valueOverBudget: 0,
    averageValuePerPlayer: 0,
  };
}
