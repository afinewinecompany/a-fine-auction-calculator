/**
 * Tier Types for Player Value Classification
 *
 * Type definitions for player tier assignments in the draft queue.
 * Tiers are used for inflation calculations and visual categorization.
 *
 * Story: 6.9 - Display Player Tier Assignments
 * Story: 8.7 - Implement Progressive Disclosure for Tier Details
 */

import type { PlayerTier } from './player.types';

/**
 * Information about a player tier for display
 */
export interface TierInfo {
  /** The tier identifier */
  tier: PlayerTier;
  /** Display label for the tier */
  label: string;
  /** Description of the tier criteria */
  description: string;
  /** Tailwind background color class */
  bgColor: string;
  /** Tailwind text color class */
  textColor: string;
  /** Tailwind border color class */
  borderColor: string;
}

/**
 * Tier configuration mapping
 *
 * Defines the visual styling and descriptions for each tier.
 * Colors follow the UX spec:
 * - T1 (Elite): Amber/gold for premium players
 * - T2 (Mid): Slate for middle-tier players
 * - T3 (Lower): Darker slate for lower-tier players
 */
export const TIER_CONFIG: Record<PlayerTier, TierInfo> = {
  ELITE: {
    tier: 'ELITE',
    label: 'Elite',
    description: 'Top 10% by projected value',
    bgColor: 'bg-amber-500/20',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  MID: {
    tier: 'MID',
    label: 'Mid',
    description: 'Middle 40% by projected value',
    bgColor: 'bg-slate-500/20',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-500/30',
  },
  LOWER: {
    tier: 'LOWER',
    label: 'Lower',
    description: 'Bottom 50% by projected value',
    bgColor: 'bg-slate-600/20',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-600/30',
  },
};

/**
 * Get tier info for a given tier
 *
 * @param tier - The player tier
 * @returns TierInfo object with styling and description
 */
export function getTierInfo(tier: PlayerTier): TierInfo {
  return TIER_CONFIG[tier] ?? TIER_CONFIG.LOWER;
}

/**
 * Tier display names for T1/T2/T3 format
 */
export const TIER_SHORT_LABELS: Record<PlayerTier, string> = {
  ELITE: 'T1',
  MID: 'T2',
  LOWER: 'T3',
};

/**
 * Get short label (T1, T2, T3) for a tier
 *
 * @param tier - The player tier
 * @returns Short label string
 */
export function getTierShortLabel(tier: PlayerTier): string {
  return TIER_SHORT_LABELS[tier] ?? 'T3';
}

/**
 * Value thresholds for tier classification (Story 8.7)
 * Used for progressive disclosure to explain tier criteria
 */
export const TIER_VALUE_THRESHOLDS: Record<PlayerTier, { min: number; description: string }> = {
  ELITE: {
    min: 35,
    description: 'Elite tier = top 10% by projected value (>$35)',
  },
  MID: {
    min: 15,
    description: 'Mid tier = middle 40% by projected value ($15-$35)',
  },
  LOWER: {
    min: 0,
    description: 'Lower tier = bottom 50% by projected value (<$15)',
  },
};

/**
 * Get tier threshold info for a given tier
 *
 * @param tier - The player tier
 * @returns Threshold info with min value and description
 */
export function getTierThreshold(tier: PlayerTier): { min: number; description: string } {
  return TIER_VALUE_THRESHOLDS[tier] ?? TIER_VALUE_THRESHOLDS.LOWER;
}
