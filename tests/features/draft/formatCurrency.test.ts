/**
 * Tests for formatCurrency Utility
 *
 * Story: 6.5 - Display Adjusted Values with Prominent Styling
 *
 * Tests the currency formatting utility used across the application.
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, formatBudget } from '@/features/draft/utils/formatCurrency';

describe('formatCurrency', () => {
  // ============================================================================
  // Basic Formatting Tests
  // ============================================================================
  describe('basic formatting', () => {
    it('should add dollar sign prefix', () => {
      expect(formatCurrency(45)).toBe('$45');
    });

    it('should handle single digit values', () => {
      expect(formatCurrency(5)).toBe('$5');
    });

    it('should handle double digit values', () => {
      expect(formatCurrency(42)).toBe('$42');
    });

    it('should handle triple digit values', () => {
      expect(formatCurrency(123)).toBe('$123');
    });
  });

  // ============================================================================
  // Rounding Tests
  // ============================================================================
  describe('rounding', () => {
    it('should round down values below .5', () => {
      expect(formatCurrency(45.3)).toBe('$45');
      expect(formatCurrency(45.4)).toBe('$45');
    });

    it('should round up values at .5 or higher', () => {
      expect(formatCurrency(45.5)).toBe('$46');
      expect(formatCurrency(45.7)).toBe('$46');
      expect(formatCurrency(45.9)).toBe('$46');
    });

    it('should handle very small decimals', () => {
      expect(formatCurrency(45.001)).toBe('$45');
      expect(formatCurrency(45.999)).toBe('$46');
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================
  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should convert negative values to $0', () => {
      expect(formatCurrency(-5)).toBe('$0');
      expect(formatCurrency(-100)).toBe('$0');
      expect(formatCurrency(-0.5)).toBe('$0');
    });

    it('should handle NaN by returning $0', () => {
      expect(formatCurrency(NaN)).toBe('$0');
    });

    it('should handle Infinity', () => {
      // Infinity is positive, so it will be formatted
      // Math.round(Infinity) returns Infinity
      expect(formatCurrency(Infinity)).toBe('$Infinity');
    });

    it('should handle negative Infinity by returning $0', () => {
      expect(formatCurrency(-Infinity)).toBe('$0');
    });
  });

  // ============================================================================
  // Large Value Tests
  // ============================================================================
  describe('large values', () => {
    it('should handle values over 100', () => {
      expect(formatCurrency(150)).toBe('$150');
    });

    it('should handle values over 1000', () => {
      expect(formatCurrency(1050)).toBe('$1050');
    });

    it('should handle very large values', () => {
      expect(formatCurrency(999999)).toBe('$999999');
    });
  });
});

// ============================================================================
// formatBudget Tests (locale-aware formatting with commas)
// ============================================================================
describe('formatBudget', () => {
  describe('basic formatting', () => {
    it('should add dollar sign prefix', () => {
      expect(formatBudget(45)).toBe('$45');
    });

    it('should format small values without commas', () => {
      expect(formatBudget(260)).toBe('$260');
    });
  });

  describe('locale formatting', () => {
    it('should add commas for thousands', () => {
      expect(formatBudget(1000)).toBe('$1,000');
    });

    it('should format large budgets with commas', () => {
      expect(formatBudget(10000)).toBe('$10,000');
      expect(formatBudget(100000)).toBe('$100,000');
    });

    it('should format millions with commas', () => {
      expect(formatBudget(1000000)).toBe('$1,000,000');
    });
  });

  describe('rounding', () => {
    it('should round to whole numbers', () => {
      expect(formatBudget(1000.5)).toBe('$1,001');
      expect(formatBudget(1000.4)).toBe('$1,000');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(formatBudget(0)).toBe('$0');
    });

    it('should convert negative values to $0', () => {
      expect(formatBudget(-1000)).toBe('$0');
    });

    it('should handle NaN by returning $0', () => {
      expect(formatBudget(NaN)).toBe('$0');
    });
  });
});
