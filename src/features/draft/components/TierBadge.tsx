/**
 * TierBadge Component
 *
 * Displays a player tier assignment (Elite, Mid, Lower) with a tooltip
 * explaining the tier criteria. Uses shadcn/ui Badge and Tooltip components.
 *
 * Story: 6.9 - Display Player Tier Assignments
 * Story: 8.7 - Implement Progressive Disclosure for Tier Details
 *
 * Visual Treatment:
 * - Elite (T1): Amber/gold badge for premium players (top 10%)
 * - Mid (T2): Slate badge for middle-tier players (middle 40%)
 * - Lower (T3): Darker slate badge for lower-tier players (bottom 50%)
 *
 * Progressive Disclosure (8.7):
 * - Click/tap to expand inline detail panel
 * - Shows tier criteria, player's value assignment, and tier-specific inflation
 * - Click again or click elsewhere to collapse
 */

import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/components/ui/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PlayerTier } from '../types/player.types';
import { getTierInfo, getTierShortLabel, TIER_VALUE_THRESHOLDS } from '../types/tier.types';
import { formatCurrency } from '../utils/formatCurrency';

export interface TierBadgeProps {
  /** The player tier assignment */
  tier: PlayerTier;
  /** Whether to show the tooltip on hover (default: true) */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Enable progressive disclosure on click (Story 8.7) */
  enableProgressiveDisclosure?: boolean;
  /** Player's projected value for disclosure panel */
  projectedValue?: number;
  /** Tier-specific inflation rate for disclosure panel */
  tierInflationRate?: number;
  /** Callback when disclosure panel is toggled */
  onDisclosureToggle?: (isExpanded: boolean) => void;
}

/**
 * Format inflation rate for display
 */
const formatInflationRate = (rate: number): string => {
  const prefix = rate > 0 ? '+' : '';
  return `${prefix}${rate.toFixed(1)}%`;
};

/**
 * Get inflation rate color class
 */
const getInflationColor = (rate: number): string => {
  if (rate > 0) return 'text-emerald-400';
  if (rate < 0) return 'text-red-400';
  return 'text-slate-400';
};

/**
 * TierBadge component for displaying player tier assignments
 * with optional progressive disclosure panel
 */
export function TierBadge({
  tier,
  showTooltip = true,
  className,
  enableProgressiveDisclosure = false,
  projectedValue,
  tierInflationRate,
  onDisclosureToggle,
}: TierBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const tierInfo = getTierInfo(tier);
  const shortLabel = getTierShortLabel(tier);
  const tierThreshold = TIER_VALUE_THRESHOLDS[tier];

  // Handle click outside to close panel
  useEffect(() => {
    if (!isExpanded || !enableProgressiveDisclosure) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        onDisclosureToggle?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, enableProgressiveDisclosure, onDisclosureToggle]);

  const handleBadgeClick = () => {
    if (!enableProgressiveDisclosure) return;
    const newState = !isExpanded;
    setIsExpanded(newState);
    onDisclosureToggle?.(newState);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!enableProgressiveDisclosure) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleBadgeClick();
    }
    if (event.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
      onDisclosureToggle?.(false);
    }
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium px-2 py-0.5',
        tierInfo.bgColor,
        tierInfo.textColor,
        tierInfo.borderColor,
        enableProgressiveDisclosure && 'cursor-pointer hover:opacity-80',
        className
      )}
      aria-label={`Tier: ${tierInfo.label} - ${tierInfo.description}`}
      aria-expanded={enableProgressiveDisclosure ? isExpanded : undefined}
      onClick={enableProgressiveDisclosure ? handleBadgeClick : undefined}
      onKeyDown={enableProgressiveDisclosure ? handleKeyDown : undefined}
      tabIndex={enableProgressiveDisclosure ? 0 : undefined}
      role={enableProgressiveDisclosure ? 'button' : undefined}
    >
      <span className="flex items-center gap-1">
        {shortLabel}
        {enableProgressiveDisclosure &&
          (isExpanded ? (
            <ChevronUp className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          ))}
      </span>
    </Badge>
  );

  // Progressive disclosure mode
  if (enableProgressiveDisclosure) {
    return (
      <div ref={containerRef} className="relative inline-block">
        {badge}
        {isExpanded && (
          <div
            className={cn(
              'absolute z-50 mt-1 left-0 min-w-[220px] p-3 rounded-lg',
              'bg-slate-800 border border-slate-700 shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            role="region"
            aria-label={`${tierInfo.label} tier details`}
          >
            {/* Tier Criteria */}
            <div className="text-xs text-slate-400 mb-2">{tierThreshold.description}</div>

            {/* Player's Assignment */}
            {projectedValue !== undefined && (
              <div className="text-sm text-slate-200 mb-2">
                <span className="text-slate-400">This player: </span>
                <span className="font-semibold">{formatCurrency(projectedValue)}</span>
                <span className="text-slate-400"> projected → </span>
                <span className={cn('font-semibold', tierInfo.textColor)}>{tierInfo.label}</span>
              </div>
            )}

            {/* Tier-Specific Inflation */}
            {tierInflationRate !== undefined && (
              <div className="text-sm">
                <span className="text-slate-400">{tierInfo.label} tier inflating at </span>
                <span className={cn('font-semibold', getInflationColor(tierInflationRate))}>
                  {formatInflationRate(tierInflationRate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard tooltip mode
  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent className="bg-slate-800 text-slate-100 border-slate-700" sideOffset={4}>
        <div className="text-sm">
          <div className="font-semibold">
            {tierInfo.label} ({shortLabel})
          </div>
          <div className="text-slate-400">{tierInfo.description}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default TierBadge;
