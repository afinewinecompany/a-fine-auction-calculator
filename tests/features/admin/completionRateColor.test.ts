/**
 * Completion Rate Color Tests
 *
 * Tests for the completion rate color coding function.
 *
 * Story: 13.8 - Track Draft Completion Rates
 */

import { describe, it, expect } from 'vitest';
import {
  getCompletionRateColor,
  COMPLETION_RATE_THRESHOLDS,
} from '@/features/admin/types/admin.types';

describe('getCompletionRateColor', () => {
  describe('Green zone (>= 80%)', () => {
    it('should return green for rate of 80%', () => {
      expect(getCompletionRateColor(80)).toBe('green');
    });

    it('should return green for rate above 80%', () => {
      expect(getCompletionRateColor(85)).toBe('green');
      expect(getCompletionRateColor(95)).toBe('green');
      expect(getCompletionRateColor(100)).toBe('green');
    });

    it('should return green for rate of 80.01%', () => {
      expect(getCompletionRateColor(80.01)).toBe('green');
    });
  });

  describe('Yellow zone (70-80%)', () => {
    it('should return yellow for rate of 70%', () => {
      expect(getCompletionRateColor(70)).toBe('yellow');
    });

    it('should return yellow for rate between 70% and 80%', () => {
      expect(getCompletionRateColor(75)).toBe('yellow');
      expect(getCompletionRateColor(79)).toBe('yellow');
      expect(getCompletionRateColor(79.99)).toBe('yellow');
    });
  });

  describe('Red zone (< 70%)', () => {
    it('should return red for rate below 70%', () => {
      expect(getCompletionRateColor(69)).toBe('red');
      expect(getCompletionRateColor(50)).toBe('red');
      expect(getCompletionRateColor(0)).toBe('red');
    });

    it('should return red for rate of 69.99%', () => {
      expect(getCompletionRateColor(69.99)).toBe('red');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative rates as red', () => {
      expect(getCompletionRateColor(-10)).toBe('red');
    });

    it('should handle rates above 100 as green', () => {
      expect(getCompletionRateColor(150)).toBe('green');
    });

    it('should handle decimal values correctly', () => {
      expect(getCompletionRateColor(79.999)).toBe('yellow');
      expect(getCompletionRateColor(80.001)).toBe('green');
      expect(getCompletionRateColor(69.999)).toBe('red');
      expect(getCompletionRateColor(70.001)).toBe('yellow');
    });
  });
});

describe('COMPLETION_RATE_THRESHOLDS', () => {
  it('should have GREEN threshold at 80', () => {
    expect(COMPLETION_RATE_THRESHOLDS.GREEN).toBe(80);
  });

  it('should have YELLOW threshold at 70', () => {
    expect(COMPLETION_RATE_THRESHOLDS.YELLOW).toBe(70);
  });
});
