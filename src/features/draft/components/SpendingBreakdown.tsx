/**
 * SpendingBreakdown Component
 *
 * Displays money spent breakdown by position category during drafts.
 * Shows spending for Hitters (C, 1B, 2B, SS, 3B, OF), Pitchers (SP, RP), and Bench.
 * Includes validation to detect sum mismatches.
 *
 * Story: 7.3 - Display Money Spent Breakdown by Position
 */

import { memo, useMemo, useEffect } from 'react';
import { cn } from '@/components/ui/utils';
import { formatCurrency } from '../utils/formatCurrency';
import type { SpendingBreakdownProps, DraftedPlayer } from '../types/roster.types';

interface PositionSpending {
  position: string;
  total: number;
  count: number;
}

function calculatePositionSpending(players: DraftedPlayer[]): PositionSpending[] {
  const positionMap = new Map<string, { total: number; count: number }>();
  players.forEach(player => {
    const existing = positionMap.get(player.position) || { total: 0, count: 0 };
    positionMap.set(player.position, {
      total: existing.total + player.auctionPrice,
      count: existing.count + 1,
    });
  });
  return Array.from(positionMap.entries())
    .map(([position, data]) => ({ position, total: data.total, count: data.count }))
    .sort((a, b) => a.position.localeCompare(b.position));
}

function formatPlayerCount(count: number): string {
  return count === 1 ? '1 player' : `${count} players`;
}

function CategoryHeader({ title }: { title: string }) {
  return (
    <div className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">{title}</div>
  );
}

function PositionLine({ position, total, count }: PositionSpending) {
  return (
    <div
      className="flex justify-between items-center text-sm text-slate-200 py-0.5"
      data-testid={`position-line-${position}`}
    >
      <span className="font-medium">{position}:</span>
      <span>
        {formatCurrency(total)} ({formatPlayerCount(count)})
      </span>
    </div>
  );
}

function EmptyState({ category }: { category: string }) {
  return (
    <p className="text-sm text-slate-500 italic" data-testid={`empty-${category.toLowerCase()}`}>
      (No {category.toLowerCase()} drafted yet)
    </p>
  );
}

export const SpendingBreakdown = memo(function SpendingBreakdown({
  roster,
  className,
}: SpendingBreakdownProps) {
  const { hitterSpending, pitcherSpending, benchSpending, totals } = useMemo(() => {
    const hitterSpending = calculatePositionSpending(roster.hitters);
    const pitcherSpending = calculatePositionSpending(roster.pitchers);
    const benchSpending = calculatePositionSpending(roster.bench);
    const hitterTotal = hitterSpending.reduce((sum, p) => sum + p.total, 0);
    const pitcherTotal = pitcherSpending.reduce((sum, p) => sum + p.total, 0);
    const benchTotal = benchSpending.reduce((sum, p) => sum + p.total, 0);
    const expectedHitterTotal = roster.hitters.reduce((sum, p) => sum + p.auctionPrice, 0);
    const expectedPitcherTotal = roster.pitchers.reduce((sum, p) => sum + p.auctionPrice, 0);
    const expectedBenchTotal = roster.bench.reduce((sum, p) => sum + p.auctionPrice, 0);
    return {
      hitterSpending,
      pitcherSpending,
      benchSpending,
      totals: {
        hitter: hitterTotal,
        pitcher: pitcherTotal,
        bench: benchTotal,
        expectedHitter: expectedHitterTotal,
        expectedPitcher: expectedPitcherTotal,
        expectedBench: expectedBenchTotal,
      },
    };
  }, [roster]);

  // Side effect for development-time sum validation
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (totals.hitter !== totals.expectedHitter) {
        console.warn(
          `SpendingBreakdown: Hitter sum mismatch. Calculated: ${totals.hitter}, Expected: ${totals.expectedHitter}`
        );
      }
      if (totals.pitcher !== totals.expectedPitcher) {
        console.warn(
          `SpendingBreakdown: Pitcher sum mismatch. Calculated: ${totals.pitcher}, Expected: ${totals.expectedPitcher}`
        );
      }
      if (totals.bench !== totals.expectedBench) {
        console.warn(
          `SpendingBreakdown: Bench sum mismatch. Calculated: ${totals.bench}, Expected: ${totals.expectedBench}`
        );
      }
    }
  }, [totals]);

  return (
    <div
      className={cn('flex flex-col gap-3 mt-3', className)}
      data-testid="spending-breakdown"
      role="region"
      aria-label="Spending breakdown by position"
    >
      <div data-testid="hitters-section">
        <CategoryHeader title="Hitters" />
        {hitterSpending.length > 0 ? (
          hitterSpending.map(ps => (
            <PositionLine
              key={ps.position}
              position={ps.position}
              total={ps.total}
              count={ps.count}
            />
          ))
        ) : (
          <EmptyState category="hitters" />
        )}
      </div>
      <div data-testid="pitchers-section">
        <CategoryHeader title="Pitchers" />
        {pitcherSpending.length > 0 ? (
          pitcherSpending.map(ps => (
            <PositionLine
              key={ps.position}
              position={ps.position}
              total={ps.total}
              count={ps.count}
            />
          ))
        ) : (
          <EmptyState category="pitchers" />
        )}
      </div>
      <div data-testid="bench-section">
        <CategoryHeader title="Bench" />
        {benchSpending.length > 0 ? (
          benchSpending.map(ps => (
            <PositionLine
              key={ps.position}
              position={ps.position}
              total={ps.total}
              count={ps.count}
            />
          ))
        ) : (
          <EmptyState category="bench" />
        )}
      </div>
    </div>
  );
});

export default SpendingBreakdown;
