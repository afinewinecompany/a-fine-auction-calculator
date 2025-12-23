/**
 * Inflation Performance Types Tests
 *
 * Tests for type utilities and threshold functions.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

import { describe, it, expect } from 'vitest';
import {
  getLatencyThresholdLevel,
  isP99AlertTriggered,
  getLatencyColorClasses,
  LATENCY_THRESHOLDS,
} from '@/features/admin/types/admin.types';

describe('inflationPerformanceTypes', () => {
  describe('getLatencyThresholdLevel', () => {
    it('should return "excellent" for latency below 100ms', () => {
      expect(getLatencyThresholdLevel(0)).toBe('excellent');
      expect(getLatencyThresholdLevel(50)).toBe('excellent');
      expect(getLatencyThresholdLevel(99)).toBe('excellent');
      expect(getLatencyThresholdLevel(99.9)).toBe('excellent');
    });

    it('should return "warning" for latency between 100ms and 200ms', () => {
      expect(getLatencyThresholdLevel(100)).toBe('warning');
      expect(getLatencyThresholdLevel(150)).toBe('warning');
      expect(getLatencyThresholdLevel(199)).toBe('warning');
      expect(getLatencyThresholdLevel(199.9)).toBe('warning');
    });

    it('should return "critical" for latency above 200ms', () => {
      expect(getLatencyThresholdLevel(200)).toBe('critical');
      expect(getLatencyThresholdLevel(201)).toBe('critical');
      expect(getLatencyThresholdLevel(500)).toBe('critical');
      expect(getLatencyThresholdLevel(1000)).toBe('critical');
    });

    it('should use correct thresholds from LATENCY_THRESHOLDS', () => {
      // Just below excellent threshold
      expect(getLatencyThresholdLevel(LATENCY_THRESHOLDS.EXCELLENT - 1)).toBe('excellent');
      // At excellent threshold (transitions to warning)
      expect(getLatencyThresholdLevel(LATENCY_THRESHOLDS.EXCELLENT)).toBe('warning');
      // Just below warning threshold
      expect(getLatencyThresholdLevel(LATENCY_THRESHOLDS.WARNING - 1)).toBe('warning');
      // At warning threshold (transitions to critical)
      expect(getLatencyThresholdLevel(LATENCY_THRESHOLDS.WARNING)).toBe('critical');
    });
  });

  describe('isP99AlertTriggered', () => {
    it('should return false when p99 is at or below 500ms', () => {
      expect(isP99AlertTriggered(0)).toBe(false);
      expect(isP99AlertTriggered(250)).toBe(false);
      expect(isP99AlertTriggered(500)).toBe(false);
    });

    it('should return true when p99 exceeds 500ms', () => {
      expect(isP99AlertTriggered(501)).toBe(true);
      expect(isP99AlertTriggered(600)).toBe(true);
      expect(isP99AlertTriggered(1000)).toBe(true);
      expect(isP99AlertTriggered(500.1)).toBe(true);
    });

    it('should use correct threshold from LATENCY_THRESHOLDS', () => {
      expect(isP99AlertTriggered(LATENCY_THRESHOLDS.P99_ALERT)).toBe(false);
      expect(isP99AlertTriggered(LATENCY_THRESHOLDS.P99_ALERT + 1)).toBe(true);
    });
  });

  describe('getLatencyColorClasses', () => {
    it('should return emerald colors for excellent level', () => {
      const colors = getLatencyColorClasses('excellent');
      expect(colors.text).toContain('emerald');
      expect(colors.bg).toContain('emerald');
      expect(colors.indicator).toContain('emerald');
      expect(colors.chart).toBe('#10b981');
    });

    it('should return yellow colors for warning level', () => {
      const colors = getLatencyColorClasses('warning');
      expect(colors.text).toContain('yellow');
      expect(colors.bg).toContain('yellow');
      expect(colors.indicator).toContain('yellow');
      expect(colors.chart).toBe('#eab308');
    });

    it('should return red colors for critical level', () => {
      const colors = getLatencyColorClasses('critical');
      expect(colors.text).toContain('red');
      expect(colors.bg).toContain('red');
      expect(colors.indicator).toContain('red');
      expect(colors.chart).toBe('#ef4444');
    });

    it('should return all required color properties', () => {
      const levels = ['excellent', 'warning', 'critical'] as const;

      for (const level of levels) {
        const colors = getLatencyColorClasses(level);
        expect(colors).toHaveProperty('text');
        expect(colors).toHaveProperty('bg');
        expect(colors).toHaveProperty('border');
        expect(colors).toHaveProperty('indicator');
        expect(colors).toHaveProperty('chart');
      }
    });
  });

  describe('LATENCY_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(LATENCY_THRESHOLDS.EXCELLENT).toBe(100);
      expect(LATENCY_THRESHOLDS.WARNING).toBe(200);
      expect(LATENCY_THRESHOLDS.P99_ALERT).toBe(500);
    });
  });
});
