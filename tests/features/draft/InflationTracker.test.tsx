/**
 * Tests for InflationTracker Component
 *
 * Story: 8.1 - Create InflationTracker Component
 * Story: 8.2 - Display Current Inflation Rate Percentage
 * Story: 8.6 - Display Position-Specific Inflation Breakdown
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InflationTracker } from '@/features/draft/components/InflationTracker';
import type { InflationTrackerProps } from '@/features/draft/components/InflationTracker';
import type { Position, Tier } from '@/features/inflation/types/inflation.types';

// Helper to render with TooltipProvider
const renderWithTooltip = (props: InflationTrackerProps) => {
  const user = userEvent.setup();
  return {
    user,
    ...render(
      <TooltipProvider>
        <InflationTracker {...props} />
      </TooltipProvider>
    ),
  };
};

const defaultPositionRates: Record<Position, number> = {
  C: 5.2,
  '1B': 3.1,
  '2B': 2.8,
  '3B': 4.5,
  SS: 6.2,
  OF: 2.1,
  SP: 8.3,
  RP: 1.5,
  UT: 0.5,
};

const defaultTierRates: Record<Tier, number> = {
  ELITE: 15.2,
  MID: 8.5,
  LOWER: 2.3,
};

const defaultProps: InflationTrackerProps = {
  inflationRate: 12.5,
  positionRates: defaultPositionRates,
  tierRates: defaultTierRates,
};

describe('InflationTracker', () => {
  describe('basic rendering', () => {
    it('should render the component', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Inflation Insights')).toBeInTheDocument();
    });

    it('should render Market Temperature section', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Market Temperature')).toBeInTheDocument();
    });

    it('should render Variance section', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Variance')).toBeInTheDocument();
    });

    it('should render Trend section', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    it('should render Tier Breakdown section', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Tiers')).toBeInTheDocument();
    });
  });

  describe('inflation rate display', () => {
    it('should display positive inflation rate with + prefix', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 12.5 });
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });

    it('should display negative inflation rate', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: -5.3 });
      expect(screen.getByText('-5.3%')).toBeInTheDocument();
    });

    it('should display zero inflation without prefix', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 0 });
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('should apply emerald color for positive inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 12.5 });
      const rateElement = screen.getByText('+12.5%');
      expect(rateElement).toHaveClass('text-emerald-500');
    });

    it('should apply red color for negative inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: -5.3 });
      const rateElement = screen.getByText('-5.3%');
      expect(rateElement).toHaveClass('text-red-500');
    });

    it('should apply slate color for zero inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 0 });
      const rateElement = screen.getByText('0.0%');
      expect(rateElement).toHaveClass('text-slate-400');
    });

    it('should use text-3xl font size for inflation rate', () => {
      renderWithTooltip(defaultProps);
      const rateElement = screen.getByText('+12.5%');
      expect(rateElement).toHaveClass('text-3xl');
    });

    it('should use font-bold for inflation rate', () => {
      renderWithTooltip(defaultProps);
      const rateElement = screen.getByText('+12.5%');
      expect(rateElement).toHaveClass('font-bold');
    });
  });

  describe('market badge', () => {
    it('should show "Hot" badge for positive inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 12.5 });
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('should show "Cool" badge for negative inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: -5.3 });
      expect(screen.getByText('Cool')).toBeInTheDocument();
    });

    it('should show "Stable" badge for zero inflation', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 0 });
      // Find the badge specifically (it's a span with data-slot="badge")
      const badges = screen.getAllByText('Stable');
      const stableBadge = badges.find(el => el.getAttribute('data-slot') === 'badge');
      expect(stableBadge).toBeInTheDocument();
    });
  });

  describe('variance display', () => {
    it('should display variance when provided', () => {
      renderWithTooltip({
        ...defaultProps,
        variance: { steals: 5, overpays: 3 },
      });
      expect(screen.getByText('5/3')).toBeInTheDocument();
    });

    it('should show placeholder when variance not provided', () => {
      renderWithTooltip(defaultProps);
      // Find the variance section's value (second "--" after Variance label)
      const varianceSection = screen.getByText('Variance').parentElement;
      expect(varianceSection).toHaveTextContent('--');
    });
  });

  describe('trend and tier sections', () => {
    it('should show Trend section with trend indicator', () => {
      renderWithTooltip(defaultProps);
      const trendSection = screen.getByText('Trend').parentElement;
      expect(trendSection).toBeInTheDocument();
      // Should show some trend label (Stable is default when no history)
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });

    it('should show Tiers section with collapsible content', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Tiers')).toBeInTheDocument();
      expect(screen.getByText('Click for breakdown')).toBeInTheDocument();
    });
  });

  describe('2x2 grid layout', () => {
    it('should use 2-column grid layout', () => {
      renderWithTooltip(defaultProps);
      // Find the grid container
      const cardContent = screen.getByText('Market Temperature').parentElement?.parentElement;
      expect(cardContent).toHaveClass('grid', 'grid-cols-2');
    });
  });

  describe('position breakdown section (Story 8.6)', () => {
    it('should render Position Breakdown toggle button', () => {
      renderWithTooltip(defaultProps);
      expect(screen.getByText('Position Breakdown')).toBeInTheDocument();
    });

    it('should be collapsed by default', () => {
      renderWithTooltip(defaultProps);
      const toggleButton = screen.getByRole('button', { name: /position breakdown/i });
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('region', { name: /position-specific inflation rates/i })).not.toBeInTheDocument();
    });

    it('should expand when toggle button is clicked', async () => {
      const { user } = renderWithTooltip(defaultProps);
      const toggleButton = screen.getByRole('button', { name: /position breakdown/i });

      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('region', { name: /position-specific inflation rates/i })).toBeInTheDocument();
    });

    it('should collapse when toggle button is clicked again', async () => {
      const { user } = renderWithTooltip(defaultProps);
      const toggleButton = screen.getByRole('button', { name: /position breakdown/i });

      await user.click(toggleButton); // Expand
      await user.click(toggleButton); // Collapse

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('region', { name: /position-specific inflation rates/i })).not.toBeInTheDocument();
    });

    it('should display all positions when expanded', async () => {
      const { user } = renderWithTooltip(defaultProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      // Check for each position (excluding UT)
      expect(screen.getByText('C:')).toBeInTheDocument();
      expect(screen.getByText('1B:')).toBeInTheDocument();
      expect(screen.getByText('2B:')).toBeInTheDocument();
      expect(screen.getByText('3B:')).toBeInTheDocument();
      expect(screen.getByText('SS:')).toBeInTheDocument();
      expect(screen.getByText('OF:')).toBeInTheDocument();
      expect(screen.getByText('SP:')).toBeInTheDocument();
      expect(screen.getByText('RP:')).toBeInTheDocument();
    });

    it('should display position rates with correct format', async () => {
      const { user } = renderWithTooltip(defaultProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      // Check for formatted rates with + prefix for positive
      expect(screen.getByText('+5.2%')).toBeInTheDocument(); // C
      expect(screen.getByText('+8.3%')).toBeInTheDocument(); // SP
      expect(screen.getByText('+1.5%')).toBeInTheDocument(); // RP
    });

    it('should sort positions by inflation rate (highest first)', async () => {
      const { user } = renderWithTooltip(defaultProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      const positionBreakdown = screen.getByRole('region', { name: /position-specific inflation rates/i });
      const positionLabels = positionBreakdown.querySelectorAll('.text-slate-300');
      const positions = Array.from(positionLabels).map((el) => el.textContent?.replace(':', ''));

      // SP has highest rate (8.3), SS second (6.2), C third (5.2)
      expect(positions[0]).toBe('SP');
      expect(positions[1]).toBe('SS');
      expect(positions[2]).toBe('C');
    });

    it('should apply red color for high inflation positions (>=15%)', async () => {
      const highInflationProps = {
        ...defaultProps,
        positionRates: { ...defaultPositionRates, C: 22 },
      };
      const { user } = renderWithTooltip(highInflationProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      const cRate = screen.getByText('+22.0%');
      expect(cRate).toHaveClass('text-red-500');
    });

    it('should apply orange color for moderately high inflation positions (>=10%)', async () => {
      const modHighInflationProps = {
        ...defaultProps,
        positionRates: { ...defaultPositionRates, C: 12 },
      };
      const { user } = renderWithTooltip(modHighInflationProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      const cRate = screen.getByText('+12.0%');
      expect(cRate).toHaveClass('text-orange-500');
    });

    it('should apply blue color for negative inflation positions', async () => {
      const negativeInflationProps = {
        ...defaultProps,
        positionRates: { ...defaultPositionRates, RP: -3 },
      };
      const { user } = renderWithTooltip(negativeInflationProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      const rpRate = screen.getByText('-3.0%');
      expect(rpRate).toHaveClass('text-blue-400');
    });

    it('should display explanation text in expanded section', async () => {
      const { user } = renderWithTooltip(defaultProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      expect(screen.getByText(/Sorted by inflation rate/)).toBeInTheDocument();
      expect(screen.getByText(/Red\/orange indicates position scarcity/)).toBeInTheDocument();
    });

    it('should have proper aria-label for each position rate', async () => {
      const { user } = renderWithTooltip(defaultProps);
      await user.click(screen.getByRole('button', { name: /position breakdown/i }));

      expect(screen.getByLabelText('SP inflation rate: +8.3%')).toBeInTheDocument();
      expect(screen.getByLabelText('C inflation rate: +5.2%')).toBeInTheDocument();
    });
  });

  describe('dark theme styling', () => {
    it('should apply dark slate background to card', () => {
      const { container } = renderWithTooltip(defaultProps);
      const card = container.querySelector('[class*="bg-slate-900"]');
      expect(card).toBeInTheDocument();
    });

    it('should apply dark background to metric boxes', () => {
      renderWithTooltip(defaultProps);
      const marketTempBox = screen.getByText('Market Temperature').parentElement;
      expect(marketTempBox).toHaveClass('bg-slate-800');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for inflation rate', () => {
      renderWithTooltip({ ...defaultProps, inflationRate: 12.5 });
      const rateElement = screen.getByLabelText(/Market temperature: positive 12.5 percent/i);
      expect(rateElement).toBeInTheDocument();
    });

    it('should have multiple interactive button elements', () => {
      renderWithTooltip(defaultProps);
      const buttons = screen.getAllByRole('button');
      // Should have position breakdown toggle and tier breakdown toggle
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have keyboard accessible position breakdown toggle', () => {
      renderWithTooltip(defaultProps);
      const positionToggle = screen.getByRole('button', { name: /position breakdown/i });
      expect(positionToggle).toBeInTheDocument();
      expect(positionToggle).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
