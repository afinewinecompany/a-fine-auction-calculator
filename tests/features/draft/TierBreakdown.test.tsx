/**
 * Tests for TierBreakdown Component
 *
 * Story: 8.5 - Display Tier-Specific Inflation Breakdown
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TierBreakdown } from '@/features/draft/components/TierBreakdown';
import { PlayerTier } from '@/features/inflation/types/inflation.types';

// Mock TooltipProvider since it needs context
const renderWithProvider = (tierRates: Record<PlayerTier, number>) => {
  return render(<TierBreakdown tierRates={tierRates} />);
};

describe('TierBreakdown', () => {
  const defaultTierRates = {
    [PlayerTier.ELITE]: 0.08,
    [PlayerTier.MID]: 0.15,
    [PlayerTier.LOWER]: -0.02,
  };

  describe('progressive disclosure', () => {
    it('should be collapsed by default', () => {
      renderWithProvider(defaultTierRates);

      expect(screen.getByText('Click for breakdown')).toBeInTheDocument();
      expect(screen.queryByText('Elite (T1)')).not.toBeInTheDocument();
    });

    it('should expand when clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      const trigger = screen.getByRole('button');
      await user.click(trigger);

      expect(screen.getByText('Elite (T1)')).toBeInTheDocument();
      expect(screen.getByText('Mid (T2)')).toBeInTheDocument();
      expect(screen.getByText('Lower (T3)')).toBeInTheDocument();
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      const trigger = screen.getByRole('button');
      await user.click(trigger); // Expand
      await user.click(trigger); // Collapse

      expect(screen.getByText('Click for breakdown')).toBeInTheDocument();
      expect(screen.queryByText('Elite (T1)')).not.toBeInTheDocument();
    });

    it('should have correct aria-label when collapsed', () => {
      renderWithProvider(defaultTierRates);

      expect(screen.getByLabelText('Show tier breakdown')).toBeInTheDocument();
    });

    it('should have correct aria-label when expanded', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      expect(screen.getByLabelText('Hide tier breakdown')).toBeInTheDocument();
    });
  });

  describe('tier display', () => {
    it('should display all three tiers in order: Elite, Mid, Lower', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      const tiers = screen.getAllByText(/\(T[123]\)/);
      expect(tiers[0]).toHaveTextContent('Elite (T1)');
      expect(tiers[1]).toHaveTextContent('Mid (T2)');
      expect(tiers[2]).toHaveTextContent('Lower (T3)');
    });

    it('should format positive rates with plus sign', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('+8.0%')).toBeInTheDocument();
      expect(screen.getByText('+15.0%')).toBeInTheDocument();
    });

    it('should format negative rates with minus sign', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('-2.0%')).toBeInTheDocument();
    });

    it('should format zero rates correctly', async () => {
      const user = userEvent.setup();
      const zeroRates = {
        [PlayerTier.ELITE]: 0,
        [PlayerTier.MID]: 0,
        [PlayerTier.LOWER]: 0,
      };
      renderWithProvider(zeroRates);

      await user.click(screen.getByRole('button'));

      const zeroElements = screen.getAllByText('0.0%');
      expect(zeroElements).toHaveLength(3);
    });
  });

  describe('color coding', () => {
    it('should use emerald for positive rates', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      const positiveRate = screen.getByText('+8.0%');
      expect(positiveRate).toHaveClass('text-emerald-500');
    });

    it('should use red for negative rates', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      const negativeRate = screen.getByText('-2.0%');
      expect(negativeRate).toHaveClass('text-red-500');
    });

    it('should use slate for zero rates', async () => {
      const user = userEvent.setup();
      const zeroRates = {
        [PlayerTier.ELITE]: 0,
        [PlayerTier.MID]: 0.05,
        [PlayerTier.LOWER]: 0,
      };
      renderWithProvider(zeroRates);

      await user.click(screen.getByRole('button'));

      // Find zero elements (should have slate color)
      const zeroElements = screen.getAllByText('0.0%');
      zeroElements.forEach(el => {
        expect(el).toHaveClass('text-slate-400');
      });
    });
  });

  describe('highest tier highlighting', () => {
    it('should highlight the tier with highest inflation', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      // Mid has highest rate (15%)
      const midTierRow = screen.getByText('Mid (T2)').closest('div');
      expect(midTierRow).toHaveClass('ring-1');
      expect(midTierRow).toHaveClass('ring-yellow-500/30');
    });

    it('should not highlight when highest tier is at zero', async () => {
      const user = userEvent.setup();
      const zeroRates = {
        [PlayerTier.ELITE]: 0,
        [PlayerTier.MID]: 0,
        [PlayerTier.LOWER]: 0,
      };
      renderWithProvider(zeroRates);

      await user.click(screen.getByRole('button'));

      // No tier should have yellow ring
      const rows = screen.getAllByText(/\(T[123]\)/).map(el => el.closest('div'));
      rows.forEach(row => {
        expect(row).not.toHaveClass('ring-yellow-500/30');
      });
    });

    it('should highlight Elite when it has highest rate', async () => {
      const user = userEvent.setup();
      const eliteHighest = {
        [PlayerTier.ELITE]: 0.20,
        [PlayerTier.MID]: 0.15,
        [PlayerTier.LOWER]: 0.05,
      };
      renderWithProvider(eliteHighest);

      await user.click(screen.getByRole('button'));

      const eliteRow = screen.getByText('Elite (T1)').closest('div');
      expect(eliteRow).toHaveClass('ring-1');
      expect(eliteRow).toHaveClass('ring-yellow-500/30');
    });

    it('should highlight Lower when it has highest rate', async () => {
      const user = userEvent.setup();
      const lowerHighest = {
        [PlayerTier.ELITE]: 0.02,
        [PlayerTier.MID]: 0.05,
        [PlayerTier.LOWER]: 0.10,
      };
      renderWithProvider(lowerHighest);

      await user.click(screen.getByRole('button'));

      const lowerRow = screen.getByText('Lower (T3)').closest('div');
      expect(lowerRow).toHaveClass('ring-1');
      expect(lowerRow).toHaveClass('ring-yellow-500/30');
    });
  });

  describe('real-time updates', () => {
    it('should update when tierRates prop changes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('+8.0%')).toBeInTheDocument();

      // Update rates
      const newRates = {
        [PlayerTier.ELITE]: 0.12,
        [PlayerTier.MID]: 0.18,
        [PlayerTier.LOWER]: -0.05,
      };
      rerender(<TierBreakdown tierRates={newRates} />);

      expect(screen.getByText('+12.0%')).toBeInTheDocument();
      expect(screen.getByText('+18.0%')).toBeInTheDocument();
      expect(screen.getByText('-5.0%')).toBeInTheDocument();
    });

    it('should maintain expanded state when props change', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithProvider(defaultTierRates);

      await user.click(screen.getByRole('button'));

      // Should be expanded
      expect(screen.getByText('Elite (T1)')).toBeInTheDocument();

      // Update rates
      const newRates = {
        [PlayerTier.ELITE]: 0.20,
        [PlayerTier.MID]: 0.10,
        [PlayerTier.LOWER]: 0,
      };
      rerender(<TierBreakdown tierRates={newRates} />);

      // Should still be expanded
      expect(screen.getByText('Elite (T1)')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProvider(defaultTierRates);

      const trigger = screen.getByRole('button');
      trigger.focus();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByText('Elite (T1)')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      renderWithProvider(defaultTierRates);

      expect(screen.getByText('Tiers')).toBeInTheDocument();
    });
  });
});
