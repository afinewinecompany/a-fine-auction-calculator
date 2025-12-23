/**
 * Roster Panel Types
 *
 * Type definitions for RosterPanel component and budget tracking.
 * Enables type-safe props for budget, roster, and league settings.
 *
 * Story: 7.1 - Create RosterPanel Component Foundation
 * Story: 7.2 - Display Real-Time Budget Tracking
 * Story: 7.3 - Display Money Spent Breakdown by Position
 */

import type { Player } from './player.types';

/**
 * Valid position values for fantasy baseball
 */
export type Position = 'C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'SP' | 'RP' | 'UTIL' | 'BN';

/**
 * Position requirements configuration
 */
export interface PositionRequirements {
  C?: number;
  '1B'?: number;
  '2B'?: number;
  SS?: number;
  '3B'?: number;
  OF?: number;
  SP?: number;
  RP?: number;
  UTIL?: number;
  BN?: number;
}

/**
 * Default position requirements for standard fantasy baseball
 * Exported for use across components (DRY)
 */
export const DEFAULT_POSITION_REQUIREMENTS: PositionRequirements = {
  C: 1,
  '1B': 1,
  '2B': 1,
  SS: 1,
  '3B': 1,
  OF: 5,
  SP: 5,
  RP: 3,
};

/**
 * Budget data for tracking spending during draft
 */
export interface BudgetData {
  /** Total auction budget amount */
  total: number;
  /** Amount already spent */
  spent: number;
  /** Remaining budget (total - spent) */
  remaining: number;
}

/**
 * Roster composition by category
 */
export interface RosterData {
  /** Drafted hitters */
  hitters: Player[];
  /** Drafted pitchers */
  pitchers: Player[];
  /** Drafted bench players */
  bench: Player[];
}

/**
 * League settings relevant to roster management
 */
export interface LeagueSettingsData {
  /** Number of teams in the league */
  teamCount: number;
  /** Number of hitter roster spots */
  rosterSpotsHitters: number;
  /** Number of pitcher roster spots */
  rosterSpotsPitchers: number;
  /** Number of bench roster spots */
  rosterSpotsBench: number;
}

/**
 * Props for RosterPanel component
 * Story: 7.1 - Create RosterPanel Component Foundation
 */
export interface RosterPanelProps {
  /** Budget tracking data */
  budget: BudgetData;
  /** Current roster composition */
  roster: RosterData;
  /** League roster settings */
  leagueSettings: LeagueSettingsData;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for BudgetDisplay component
 * Story: 7.2 - Display Real-Time Budget Tracking
 */
export interface BudgetDisplayProps {
  /** Total auction budget */
  total: number;
  /** Amount spent */
  spent: number;
  /** Remaining budget */
  remaining: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Low budget threshold constant
 * Warning is shown when remaining budget falls below this value
 */
export const LOW_BUDGET_THRESHOLD = 20;

/**
 * Drafted player for spending breakdown
 * Story: 7.3 - Display Money Spent Breakdown by Position
 *
 * NOTE: This is the canonical DraftedPlayer type - used by:
 * - SpendingBreakdown (7-3)
 * - RosterDisplay (7-5)
 * - SlotTracker (7-6)
 * - PositionNeeds (7-7)
 */
export interface DraftedPlayer {
  /** Unique player identifier */
  playerId: string;
  /** Player display name */
  name: string;
  /** Player's primary position */
  position: Position | string; // Allow string for flexibility with unknown positions
  /** Price paid at auction */
  auctionPrice: number;
}

/**
 * Props for SpendingBreakdown component
 * Story: 7.3 - Display Money Spent Breakdown by Position
 */
export interface SpendingBreakdownProps {
  /** Roster data with drafted players by category */
  roster: {
    hitters: DraftedPlayer[];
    pitchers: DraftedPlayer[];
    bench: DraftedPlayer[];
  };
  /** Optional CSS class name */
  className?: string;
}

/**
 * Pace status for spending indicator
 * Story: 7.4 - Display Spending Pace Indicator
 */
export type PaceStatus = 'ON_PACE' | 'SPENDING_FAST' | 'SPENDING_SLOW' | 'NOT_STARTED';

/**
 * Props for PaceIndicator component
 * Story: 7.4 - Display Spending Pace Indicator
 */
export interface PaceIndicatorProps {
  /** Total auction budget */
  totalBudget: number;
  /** Amount already spent */
  moneySpent: number;
  /** Number of roster spots filled */
  spotsFilled: number;
  /** Total roster spots available */
  totalRosterSpots: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Pace tolerance percentage for "On Pace" status
 * Values within this range (0.9 to 1.1) are considered "On Pace"
 */
export const PACE_TOLERANCE = 0.1;
