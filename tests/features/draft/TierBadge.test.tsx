/**
 * TierBadge Component Tests
 *
 * Tests for the TierBadge component that displays player tier assignments.
 *
 * Story: 6.9 - Display Player Tier Assignments
 * Story: 8.7 - Implement Progressive Disclosure for Tier Details
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TierBadge } from '@/features/draft/components/TierBadge';

describe('TierBadge', () => {
  describe('Tier display', () => {
    it('renders T1 for ELITE tier', () => {
      render(<TierBadge tier="ELITE" />);

      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders T2 for MID tier', () => {
      render(<TierBadge tier="MID" />);

      expect(screen.getByText('T2')).toBeInTheDocument();
    });

    it('renders T3 for LOWER tier', () => {
      render(<TierBadge tier="LOWER" />);

      expect(screen.getByText('T3')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies amber styling for ELITE tier', () => {
      render(<TierBadge tier="ELITE" />);

      const badge = screen.getByLabelText(/elite/i);
      expect(badge.className).toContain('text-amber');
    });

    it('applies slate-300 styling for MID tier', () => {
      render(<TierBadge tier="MID" />);

      const badge = screen.getByLabelText(/mid/i);
      expect(badge.className).toContain('text-slate-300');
    });

    it('applies slate-400 styling for LOWER tier', () => {
      render(<TierBadge tier="LOWER" />);

      const badge = screen.getByLabelText(/lower/i);
      expect(badge.className).toContain('text-slate-400');
    });
  });

  describe('Accessibility', () => {
    it('provides aria-label for ELITE tier', () => {
      render(<TierBadge tier="ELITE" />);

      const badge = screen.getByLabelText(/elite/i);
      expect(badge).toBeInTheDocument();
    });

    it('provides aria-label for MID tier', () => {
      render(<TierBadge tier="MID" />);

      const badge = screen.getByLabelText(/mid/i);
      expect(badge).toBeInTheDocument();
    });

    it('provides aria-label for LOWER tier', () => {
      render(<TierBadge tier="LOWER" />);

      const badge = screen.getByLabelText(/lower/i);
      expect(badge).toBeInTheDocument();
    });

    it('includes tier description in aria-label', () => {
      render(<TierBadge tier="ELITE" />);

      const badge = screen.getByLabelText(/top 10%/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('renders with tooltip by default', () => {
      render(<TierBadge tier="ELITE" />);

      const trigger = screen.getByText('T1');
      expect(trigger.closest('[data-slot="tooltip-trigger"]')).toBeInTheDocument();
    });

    it('renders without tooltip when showTooltip is false', () => {
      render(<TierBadge tier="ELITE" showTooltip={false} />);

      const badge = screen.getByText('T1');
      expect(badge.closest('[data-slot="tooltip-trigger"]')).not.toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('accepts and applies custom className', () => {
      render(<TierBadge tier="ELITE" className="custom-class" />);

      const badge = screen.getByLabelText(/elite/i);
      expect(badge.className).toContain('custom-class');
    });
  });

  describe('Progressive Disclosure (Story 8.7)', () => {
    it('does not show disclosure panel by default', () => {
      render(<TierBadge tier="ELITE" />);

      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });

    it('renders as button when enableProgressiveDisclosure is true', () => {
      render(<TierBadge tier="ELITE" enableProgressiveDisclosure />);

      const badge = screen.getByRole('button');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands detail panel when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
          tierInflationRate={8}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('region', { name: /elite tier details/i })).toBeInTheDocument();
    });

    it('collapses when clicked again', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
          tierInflationRate={8}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button); // Expand
      await user.click(button); // Collapse

      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });

    it('displays tier criteria when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
          tierInflationRate={8}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText(/Elite tier = top 10% by projected value/i)).toBeInTheDocument();
    });

    it('displays player projected value when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
          tierInflationRate={8}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('$42')).toBeInTheDocument();
      expect(screen.getByText(/This player:/i)).toBeInTheDocument();
    });

    it('displays tier-specific inflation rate when expanded', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
          tierInflationRate={8}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('+8.0%')).toBeInTheDocument();
      expect(screen.getByText(/Elite tier inflating at/i)).toBeInTheDocument();
    });

    it('displays negative inflation rate correctly', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="LOWER"
          enableProgressiveDisclosure
          projectedValue={5}
          tierInflationRate={-3.5}
        />
      );

      await user.click(screen.getByRole('button'));

      expect(screen.getByText('-3.5%')).toBeInTheDocument();
    });

    it('calls onDisclosureToggle callback when toggled', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          onDisclosureToggle={onToggle}
        />
      );

      await user.click(screen.getByRole('button'));
      expect(onToggle).toHaveBeenCalledWith(true);

      await user.click(screen.getByRole('button'));
      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('closes when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button); // Expand
      expect(screen.getByRole('region')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('region')).not.toBeInTheDocument();
      });
    });

    it('can be opened with Enter key', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('can be opened with Space key', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="ELITE"
          enableProgressiveDisclosure
          projectedValue={42}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('shows chevron icon when progressive disclosure is enabled', () => {
      render(<TierBadge tier="ELITE" enableProgressiveDisclosure />);

      // ChevronDown should be visible when collapsed
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('works with MID tier values', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="MID"
          enableProgressiveDisclosure
          projectedValue={25}
          tierInflationRate={5.5}
        />
      );

      await user.click(screen.getByRole('button'));

      // Check for the tier label in the disclosure panel
      expect(screen.getByRole('region', { name: /mid tier details/i })).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
      expect(screen.getByText('+5.5%')).toBeInTheDocument();
    });

    it('works with LOWER tier values', async () => {
      const user = userEvent.setup();
      render(
        <TierBadge
          tier="LOWER"
          enableProgressiveDisclosure
          projectedValue={8}
          tierInflationRate={2.0}
        />
      );

      await user.click(screen.getByRole('button'));

      // Check for the tier label in the disclosure panel
      expect(screen.getByRole('region', { name: /lower tier details/i })).toBeInTheDocument();
      expect(screen.getByText('$8')).toBeInTheDocument();
      expect(screen.getByText('+2.0%')).toBeInTheDocument();
    });
  });
});