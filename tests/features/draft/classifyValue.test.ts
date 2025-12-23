/**
 * Tests for Value Classification Utility
 *
 * Story: 6.6 - Implement Color-Coded Value Indicators
 *
 * Tests the classification of draft picks based on actual price vs adjusted value.
 * Classification thresholds: >10% under = steal, ±10% = fair, >10% over = overpay
 */

import {
  classifyValue,
  getValueBackgroundColor,
  getValueLabel,
  calculatePercentDiff,
  VALUE_BACKGROUND_COLORS,
  VALUE_LABELS,
  CLASSIFICATION_THRESHOLD,
  type ValueClassification,
} from '@/features/draft/utils/classifyValue';

describe('classifyValue', () => {
  // ============================================================================
  // Steal Classification Tests (>10% under adjusted value)
  // ============================================================================
  describe('steal classification', () => {
    it('should return steal when price is >10% under adjusted value', () => {
      // $35 for $45 value = 22% under
      expect(classifyValue(35, 45)).toBe('steal');
    });

    it('should return steal at exactly 11% under', () => {
      // $44.50 for $50 value = 11% under
      expect(classifyValue(44.5, 50)).toBe('steal');
    });

    it('should return steal for significant discount', () => {
      // $20 for $40 value = 50% under
      expect(classifyValue(20, 40)).toBe('steal');
    });

    it('should return steal when price is $0 for positive value', () => {
      // Free player with $30 value = 100% under
      expect(classifyValue(0, 30)).toBe('steal');
    });

    it('should return steal for large value differentials', () => {
      // $50 for $100 value = 50% under
      expect(classifyValue(50, 100)).toBe('steal');
    });
  });

  // ============================================================================
  // Fair Value Classification Tests (within ±10% of adjusted value)
  // ============================================================================
  describe('fair value classification', () => {
    it('should return fair when price equals adjusted value', () => {
      expect(classifyValue(45, 45)).toBe('fair');
    });

    it('should return fair when price is exactly 10% under', () => {
      // $45 for $50 value = exactly 10% under (boundary)
      expect(classifyValue(45, 50)).toBe('fair');
    });

    it('should return fair when price is exactly 10% over', () => {
      // $55 for $50 value = exactly 10% over (boundary)
      expect(classifyValue(55, 50)).toBe('fair');
    });

    it('should return fair for slight discount', () => {
      // $42 for $45 value = 6.7% under
      expect(classifyValue(42, 45)).toBe('fair');
    });

    it('should return fair for slight overpay', () => {
      // $48 for $45 value = 6.7% over
      expect(classifyValue(48, 45)).toBe('fair');
    });

    it('should return fair at 9% under', () => {
      // $45.50 for $50 value = 9% under
      expect(classifyValue(45.5, 50)).toBe('fair');
    });

    it('should return fair at 9% over', () => {
      // $54.50 for $50 value = 9% over
      expect(classifyValue(54.5, 50)).toBe('fair');
    });
  });

  // ============================================================================
  // Overpay Classification Tests (>10% over adjusted value)
  // ============================================================================
  describe('overpay classification', () => {
    it('should return overpay when price is >10% over adjusted value', () => {
      // $55 for $45 value = 22% over
      expect(classifyValue(55, 45)).toBe('overpay');
    });

    it('should return overpay at exactly 11% over', () => {
      // $55.50 for $50 value = 11% over
      expect(classifyValue(55.5, 50)).toBe('overpay');
    });

    it('should return overpay for significant overspend', () => {
      // $60 for $40 value = 50% over
      expect(classifyValue(60, 40)).toBe('overpay');
    });

    it('should return overpay for large value differentials', () => {
      // $150 for $100 value = 50% over
      expect(classifyValue(150, 100)).toBe('overpay');
    });
  });

  // ============================================================================
  // Undrafted Player Tests (no classification)
  // ============================================================================
  describe('undrafted players', () => {
    it('should return none when actualPrice is undefined', () => {
      expect(classifyValue(undefined, 45)).toBe('none');
    });

    it('should return none for any adjusted value when undrafted', () => {
      expect(classifyValue(undefined, 0)).toBe('none');
      expect(classifyValue(undefined, 100)).toBe('none');
      expect(classifyValue(undefined, 1)).toBe('none');
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================
  describe('edge cases', () => {
    it('should handle zero adjusted value with positive price as overpay', () => {
      // Paid $10 for $0 value = overpay
      expect(classifyValue(10, 0)).toBe('overpay');
    });

    it('should handle zero adjusted value with zero price as fair', () => {
      // Paid $0 for $0 value = fair
      expect(classifyValue(0, 0)).toBe('fair');
    });

    it('should handle negative adjusted value with positive price as overpay', () => {
      // Paid $10 for -$5 value = overpay
      expect(classifyValue(10, -5)).toBe('overpay');
    });

    it('should handle very small differences correctly', () => {
      // $49.99 for $50 value = 0.02% under (fair)
      expect(classifyValue(49.99, 50)).toBe('fair');
    });

    it('should handle large numbers', () => {
      // $800 for $1000 value = 20% under (steal)
      expect(classifyValue(800, 1000)).toBe('steal');
    });

    it('should handle decimal adjusted values', () => {
      // $35 for $38.5 value = 9.1% under (fair)
      expect(classifyValue(35, 38.5)).toBe('fair');
    });
  });

  // ============================================================================
  // Boundary Tests
  // ============================================================================
  describe('boundary conditions', () => {
    it('should classify exactly at -10% as fair (inclusive boundary)', () => {
      // Exactly -10%: price = adjustedValue * 0.9
      const adjustedValue = 100;
      const price = 90; // exactly -10%
      expect(classifyValue(price, adjustedValue)).toBe('fair');
    });

    it('should classify just under -10% as steal', () => {
      // Just over -10%: price = adjustedValue * 0.899
      const adjustedValue = 100;
      const price = 89.9; // -10.1%
      expect(classifyValue(price, adjustedValue)).toBe('steal');
    });

    it('should classify exactly at +10% as fair (inclusive boundary)', () => {
      // Exactly +10%: price = adjustedValue * 1.1
      const adjustedValue = 100;
      const price = 110; // exactly +10%
      expect(classifyValue(price, adjustedValue)).toBe('fair');
    });

    it('should classify just over +10% as overpay', () => {
      // Just over +10%: price = adjustedValue * 1.101
      const adjustedValue = 100;
      const price = 110.1; // +10.1%
      expect(classifyValue(price, adjustedValue)).toBe('overpay');
    });
  });
});

// ============================================================================
// Background Color Tests
// ============================================================================
describe('getValueBackgroundColor', () => {
  it('should return emerald background for steal', () => {
    expect(getValueBackgroundColor('steal')).toBe('bg-emerald-900/20');
  });

  it('should return yellow background for fair', () => {
    expect(getValueBackgroundColor('fair')).toBe('bg-yellow-900/20');
  });

  it('should return red background for overpay', () => {
    expect(getValueBackgroundColor('overpay')).toBe('bg-red-900/20');
  });

  it('should return empty string for none', () => {
    expect(getValueBackgroundColor('none')).toBe('');
  });
});

// ============================================================================
// Label Tests
// ============================================================================
describe('getValueLabel', () => {
  it('should return "Steal" for steal classification', () => {
    expect(getValueLabel('steal')).toBe('Steal');
  });

  it('should return "Fair Value" for fair classification', () => {
    expect(getValueLabel('fair')).toBe('Fair Value');
  });

  it('should return "Overpay" for overpay classification', () => {
    expect(getValueLabel('overpay')).toBe('Overpay');
  });

  it('should return empty string for none', () => {
    expect(getValueLabel('none')).toBe('');
  });
});

// ============================================================================
// Calculate Percent Diff Tests
// ============================================================================
describe('calculatePercentDiff', () => {
  it('should return 0 when price equals value', () => {
    expect(calculatePercentDiff(50, 50)).toBe(0);
  });

  it('should return negative percentage for underpay', () => {
    // $40 for $50 = -20%
    expect(calculatePercentDiff(40, 50)).toBe(-20);
  });

  it('should return positive percentage for overpay', () => {
    // $60 for $50 = +20%
    expect(calculatePercentDiff(60, 50)).toBe(20);
  });

  it('should handle zero adjusted value', () => {
    expect(calculatePercentDiff(10, 0)).toBe(100);
    expect(calculatePercentDiff(0, 0)).toBe(0);
  });

  it('should calculate precise percentages', () => {
    // $45 for $50 = -10%
    expect(calculatePercentDiff(45, 50)).toBe(-10);
    // $55 for $50 = +10%
    expect(calculatePercentDiff(55, 50)).toBe(10);
  });
});

// ============================================================================
// Constants Tests
// ============================================================================
describe('constants', () => {
  it('should have classification threshold of 10', () => {
    expect(CLASSIFICATION_THRESHOLD).toBe(10);
  });

  it('should have all value classifications in background colors', () => {
    const classifications: ValueClassification[] = ['steal', 'fair', 'overpay', 'none'];
    classifications.forEach(classification => {
      expect(VALUE_BACKGROUND_COLORS).toHaveProperty(classification);
    });
  });

  it('should have all value classifications in labels', () => {
    const classifications: ValueClassification[] = ['steal', 'fair', 'overpay', 'none'];
    classifications.forEach(classification => {
      expect(VALUE_LABELS).toHaveProperty(classification);
    });
  });
});
