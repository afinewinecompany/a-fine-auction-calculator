/**
 * Tests for Inflation Trend Calculations
 *
 * Story: 8.4 - Display Inflation Trend Indicators
 */

import { describe, it, expect } from 'vitest';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  calculateInflationTrend,
  getTrendIcon,
  getTrendColor,
  getTrendLabel,
  formatTrendTooltip,
  DEFAULT_WINDOW_SIZE,
  TREND_THRESHOLD,
  type TrendDirection,
  type TrendResult,
} from '@/features/inflation/utils/trendCalculations';
import type { InflationHistoryEntry } from '@/features/inflation/types/inflation.types';

describe('trendCalculations', () => {
  describe('constants', () => {
    it('should have correct DEFAULT_WINDOW_SIZE', () => {
      expect(DEFAULT_WINDOW_SIZE).toBe(10);
    });

    it('should have correct TREND_THRESHOLD', () => {
      expect(TREND_THRESHOLD).toBe(2);
    });
  });

  describe('calculateInflationTrend', () => {
    it('should return stable trend for early draft (< 10 picks)', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 1, rate: 5.0, timestamp: Date.now() },
        { pickNumber: 5, rate: 8.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 5);

      expect(result.direction).toBe('stable');
      expect(result.change).toBe(0);
      expect(result.pickWindow).toBe(5);
    });

    it('should return stable trend when history has < 2 entries', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 15, rate: 10.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15);

      expect(result.direction).toBe('stable');
      expect(result.change).toBe(0);
    });

    it('should return stable trend for empty history', () => {
      const result = calculateInflationTrend([], 20);

      expect(result.direction).toBe('stable');
      expect(result.change).toBe(0);
    });

    it('should calculate heating trend when change >= +2%', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 5.0, timestamp: Date.now() },
        { pickNumber: 10, rate: 6.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 7.5, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('heating');
      expect(result.change).toBe(2.5); // 7.5 - 5.0
      expect(result.pickWindow).toBe(10);
    });

    it('should calculate cooling trend when change <= -2%', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 10.0, timestamp: Date.now() },
        { pickNumber: 10, rate: 9.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 7.5, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('cooling');
      expect(result.change).toBe(-2.5); // 7.5 - 10.0
      expect(result.pickWindow).toBe(10);
    });

    it('should calculate stable trend when change is between -2% and +2%', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 10.0, timestamp: Date.now() },
        { pickNumber: 10, rate: 10.5, timestamp: Date.now() },
        { pickNumber: 15, rate: 11.5, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('stable');
      expect(result.change).toBe(1.5); // 11.5 - 10.0
      expect(result.pickWindow).toBe(10);
    });

    it('should find closest earlier pick when exact pick not in history', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 3, rate: 5.0, timestamp: Date.now() },
        { pickNumber: 7, rate: 6.0, timestamp: Date.now() },
        { pickNumber: 17, rate: 10.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 17, 10);

      // Should use pick 7 (closest to 17-10=7)
      expect(result.direction).toBe('heating');
      expect(result.change).toBe(4.0); // 10.0 - 6.0
      expect(result.pickWindow).toBe(10);
    });

    it('should use first entry when no suitable previous entry found', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 12, rate: 8.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 10.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.change).toBe(2.0); // 10.0 - 8.0
    });

    it('should use custom window size', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 5.0, timestamp: Date.now() },
        { pickNumber: 10, rate: 6.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 8.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 5);

      expect(result.direction).toBe('heating');
      expect(result.change).toBe(2.0); // 8.0 - 6.0
      expect(result.pickWindow).toBe(5);
    });

    it('should handle exact threshold values correctly (+2%)', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 10.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 12.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('heating'); // Exactly +2% should be heating
      expect(result.change).toBe(2.0);
    });

    it('should handle exact threshold values correctly (-2%)', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 10.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 8.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('cooling'); // Exactly -2% should be cooling
      expect(result.change).toBe(-2.0);
    });

    it('should handle negative inflation rates', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: -2.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 1.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15, 10);

      expect(result.direction).toBe('heating');
      expect(result.change).toBe(3.0); // 1.0 - (-2.0)
    });

    it('should use DEFAULT_WINDOW_SIZE when not specified', () => {
      const history: InflationHistoryEntry[] = [
        { pickNumber: 5, rate: 5.0, timestamp: Date.now() },
        { pickNumber: 15, rate: 10.0, timestamp: Date.now() },
      ];

      const result = calculateInflationTrend(history, 15);

      expect(result.pickWindow).toBe(10); // DEFAULT_WINDOW_SIZE
    });
  });

  describe('getTrendIcon', () => {
    it('should return TrendingUp for heating', () => {
      expect(getTrendIcon('heating')).toBe(TrendingUp);
    });

    it('should return TrendingDown for cooling', () => {
      expect(getTrendIcon('cooling')).toBe(TrendingDown);
    });

    it('should return Minus for stable', () => {
      expect(getTrendIcon('stable')).toBe(Minus);
    });
  });

  describe('getTrendColor', () => {
    it('should return orange for heating', () => {
      expect(getTrendColor('heating')).toBe('text-orange-500');
    });

    it('should return blue for cooling', () => {
      expect(getTrendColor('cooling')).toBe('text-blue-500');
    });

    it('should return slate for stable', () => {
      expect(getTrendColor('stable')).toBe('text-slate-400');
    });
  });

  describe('getTrendLabel', () => {
    it('should return "Heating" for heating', () => {
      expect(getTrendLabel('heating')).toBe('Heating');
    });

    it('should return "Cooling" for cooling', () => {
      expect(getTrendLabel('cooling')).toBe('Cooling');
    });

    it('should return "Stable" for stable', () => {
      expect(getTrendLabel('stable')).toBe('Stable');
    });
  });

  describe('formatTrendTooltip', () => {
    it('should format heating tooltip correctly', () => {
      const trend: TrendResult = {
        direction: 'heating',
        change: 3.5,
        pickWindow: 10,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toBe('Inflation has increased 3.5% in the last 10 picks');
    });

    it('should format cooling tooltip correctly', () => {
      const trend: TrendResult = {
        direction: 'cooling',
        change: -4.2,
        pickWindow: 10,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toBe('Inflation has decreased 4.2% in the last 10 picks');
    });

    it('should format stable tooltip correctly', () => {
      const trend: TrendResult = {
        direction: 'stable',
        change: 1.0,
        pickWindow: 10,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toBe('Inflation has changed by 1.0% in the last 10 picks (stable)');
    });

    it('should show early draft message when pickWindow < DEFAULT_WINDOW_SIZE', () => {
      const trend: TrendResult = {
        direction: 'stable',
        change: 0,
        pickWindow: 5,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toBe('Not enough draft history to calculate trend');
    });

    it('should format change with one decimal place', () => {
      const trend: TrendResult = {
        direction: 'heating',
        change: 3.456,
        pickWindow: 10,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toContain('3.5%');
    });

    it('should use absolute value for display', () => {
      const trend: TrendResult = {
        direction: 'cooling',
        change: -3.5,
        pickWindow: 10,
      };

      const tooltip = formatTrendTooltip(trend);

      expect(tooltip).toContain('3.5%'); // Not -3.5%
    });
  });
});
