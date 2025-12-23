/**
 * Tests for PaceIndicator Component
 *
 * Story: 7.4 - Display Spending Pace Indicator
 *
 * Tests the pace indicator component that shows spending pace
 * relative to target budget allocation with color-coded status.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PaceIndicator,
  calculatePaceRatio,
  getPaceStatus,
  getStatusConfig,
} from '@/features/draft/components/PaceIndicator';
import { PACE_TOLERANCE } from '@/features/draft/types/roster.types';

describe('PaceIndicator', () => {
  describe('rendering', () => {
    it('should render the pace indicator container', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-indicator')).toBeInTheDocument();
    });

    it('should render the status label', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toBeInTheDocument();
    });

    it('should have proper aria-label', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      const indicator = screen.getByTestId('pace-indicator');
      expect(indicator).toHaveAttribute('aria-label');
      expect(indicator.getAttribute('aria-label')).toContain('Spending pace');
    });

    it('should have status role', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-indicator')).toHaveAttribute(
        'role',
        'status'
      );
    });
  });

  describe('On Pace status', () => {
    it('should show On Pace when ratio is exactly 1.0', () => {
      // $260 budget, 23 spots = $11.30/slot target
      // 5 spots filled at $56.50 spent = $11.30/slot actual
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={56.5}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'On Pace'
      );
    });

    it('should show On Pace when ratio is within 10% tolerance (1.05)', () => {
      // Target: $11.30/slot, Actual: $11.87/slot (105%)
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={59.35}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'On Pace'
      );
    });

    it('should show On Pace when ratio is within 10% tolerance (0.95)', () => {
      // Target: $11.30/slot, Actual: $10.74/slot (95%)
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={53.7}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'On Pace'
      );
    });

    it('should apply green color when On Pace', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={56.5}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      const indicator = screen.getByTestId('pace-indicator');
      expect(indicator).toHaveClass('text-green-400');
      expect(indicator).toHaveClass('bg-green-400/20');
    });
  });

  describe('Spending Fast status', () => {
    it('should show Spending Fast when ratio > 1.1', () => {
      // Target: $11.30/slot, Actual: $16.00/slot (142%)
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={80}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'Spending Fast'
      );
    });

    it('should apply yellow color when Spending Fast', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={80}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      const indicator = screen.getByTestId('pace-indicator');
      expect(indicator).toHaveClass('text-yellow-400');
      expect(indicator).toHaveClass('bg-yellow-400/20');
    });
  });

  describe('Spending Slow status', () => {
    it('should show Spending Slow when ratio < 0.9', () => {
      // Target: $11.30/slot, Actual: $10.00/slot (88%)
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={50}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'Spending Slow'
      );
    });

    it('should apply blue color when Spending Slow', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={50}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );
      const indicator = screen.getByTestId('pace-indicator');
      expect(indicator).toHaveClass('text-blue-400');
      expect(indicator).toHaveClass('bg-blue-400/20');
    });
  });

  describe('edge cases', () => {
    it('should show Draft Not Started when no spots filled', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={0}
          spotsFilled={0}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'Draft Not Started'
      );
    });

    it('should apply slate color when not started', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={0}
          spotsFilled={0}
          totalRosterSpots={23}
        />
      );
      const indicator = screen.getByTestId('pace-indicator');
      expect(indicator).toHaveClass('text-slate-400');
    });

    it('should handle zero total budget gracefully', () => {
      render(
        <PaceIndicator
          totalBudget={0}
          moneySpent={0}
          spotsFilled={0}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'Draft Not Started'
      );
    });

    it('should handle zero roster spots gracefully', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={0}
          spotsFilled={0}
          totalRosterSpots={0}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'Draft Not Started'
      );
    });

    it('should handle all spots filled', () => {
      // All 23 spots filled with total budget spent
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={260}
          spotsFilled={23}
          totalRosterSpots={23}
        />
      );
      expect(screen.getByTestId('pace-status-label')).toHaveTextContent(
        'On Pace'
      );
    });
  });

  describe('tooltip', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );

      const indicator = screen.getByTestId('pace-indicator');
      await user.hover(indicator);

      // Wait for tooltip to appear
      const tooltip = await screen.findByTestId('pace-tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    it('should display actual pace in tooltip', async () => {
      const user = userEvent.setup();
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );

      await user.hover(screen.getByTestId('pace-indicator'));
      const tooltip = await screen.findByTestId('pace-tooltip');
      expect(tooltip).toHaveTextContent('$12/slot');
    });

    it('should display target pace in tooltip', async () => {
      const user = userEvent.setup();
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );

      await user.hover(screen.getByTestId('pace-indicator'));
      const tooltip = await screen.findByTestId('pace-tooltip');
      expect(tooltip).toHaveTextContent('$11/slot');
    });

    it('should display spots filled info in tooltip', async () => {
      const user = userEvent.setup();
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
        />
      );

      await user.hover(screen.getByTestId('pace-indicator'));
      const tooltip = await screen.findByTestId('pace-tooltip');
      expect(tooltip).toHaveTextContent('5 of 23 spots filled');
    });

    it('should show Not Started message in tooltip when no spots filled', async () => {
      const user = userEvent.setup();
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={0}
          spotsFilled={0}
          totalRosterSpots={23}
        />
      );

      await user.hover(screen.getByTestId('pace-indicator'));
      const tooltip = await screen.findByTestId('pace-tooltip');
      expect(tooltip).toHaveTextContent('No players drafted yet');
    });
  });

  describe('className prop', () => {
    it('should apply custom className', () => {
      render(
        <PaceIndicator
          totalBudget={260}
          moneySpent={60}
          spotsFilled={5}
          totalRosterSpots={23}
          className="custom-class"
        />
      );
      expect(screen.getByTestId('pace-indicator')).toHaveClass('custom-class');
    });
  });
});

describe('calculatePaceRatio', () => {
  it('should return 1.0 when actual matches target', () => {
    // $260 / 23 = $11.30/slot, 5 * $11.30 = $56.50
    const ratio = calculatePaceRatio(260, 56.52, 5, 23);
    expect(ratio).toBeCloseTo(1.0, 1);
  });

  it('should return > 1 when spending fast', () => {
    const ratio = calculatePaceRatio(260, 80, 5, 23);
    expect(ratio).toBeGreaterThan(1.1);
  });

  it('should return < 1 when spending slow', () => {
    const ratio = calculatePaceRatio(260, 40, 5, 23);
    expect(ratio).toBeLessThan(0.9);
  });

  it('should return 0 when no spots filled', () => {
    const ratio = calculatePaceRatio(260, 0, 0, 23);
    expect(ratio).toBe(0);
  });

  it('should return 0 when zero budget', () => {
    const ratio = calculatePaceRatio(0, 0, 5, 23);
    expect(ratio).toBe(0);
  });

  it('should return 0 when zero roster spots', () => {
    const ratio = calculatePaceRatio(260, 60, 5, 0);
    expect(ratio).toBe(0);
  });
});

describe('getPaceStatus', () => {
  it('should return NOT_STARTED when no spots filled', () => {
    expect(getPaceStatus(0, 0)).toBe('NOT_STARTED');
  });

  it('should return ON_PACE when ratio is 1.0', () => {
    expect(getPaceStatus(1.0, 5)).toBe('ON_PACE');
  });

  it('should return ON_PACE when ratio is within tolerance', () => {
    expect(getPaceStatus(1 + PACE_TOLERANCE, 5)).toBe('ON_PACE');
    expect(getPaceStatus(1 - PACE_TOLERANCE, 5)).toBe('ON_PACE');
  });

  it('should return SPENDING_FAST when ratio > 1.1', () => {
    expect(getPaceStatus(1.2, 5)).toBe('SPENDING_FAST');
    expect(getPaceStatus(1.5, 5)).toBe('SPENDING_FAST');
  });

  it('should return SPENDING_SLOW when ratio < 0.9', () => {
    expect(getPaceStatus(0.8, 5)).toBe('SPENDING_SLOW');
    expect(getPaceStatus(0.5, 5)).toBe('SPENDING_SLOW');
  });
});

describe('getStatusConfig', () => {
  it('should return green config for ON_PACE', () => {
    const config = getStatusConfig('ON_PACE');
    expect(config.label).toBe('On Pace');
    expect(config.textColor).toBe('text-green-400');
    expect(config.bgColor).toBe('bg-green-400/20');
  });

  it('should return yellow config for SPENDING_FAST', () => {
    const config = getStatusConfig('SPENDING_FAST');
    expect(config.label).toBe('Spending Fast');
    expect(config.textColor).toBe('text-yellow-400');
    expect(config.bgColor).toBe('bg-yellow-400/20');
  });

  it('should return blue config for SPENDING_SLOW', () => {
    const config = getStatusConfig('SPENDING_SLOW');
    expect(config.label).toBe('Spending Slow');
    expect(config.textColor).toBe('text-blue-400');
    expect(config.bgColor).toBe('bg-blue-400/20');
  });

  it('should return slate config for NOT_STARTED', () => {
    const config = getStatusConfig('NOT_STARTED');
    expect(config.label).toBe('Draft Not Started');
    expect(config.textColor).toBe('text-slate-400');
    expect(config.bgColor).toBe('bg-slate-400/20');
  });
});
