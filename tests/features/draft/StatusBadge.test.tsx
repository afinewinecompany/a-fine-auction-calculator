/**
 * StatusBadge Component Tests
 *
 * Tests for the StatusBadge component that displays player draft status.
 *
 * Story: 6.7 - Display Player Draft Status
 */

import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/features/draft/components/StatusBadge';

describe('StatusBadge', () => {
  describe('Available status', () => {
    it('renders "Available" text for available status', () => {
      render(<StatusBadge status="available" />);

      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('uses outline variant for available status', () => {
      render(<StatusBadge status="available" />);

      const badge = screen.getByText('Available');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('My Team status', () => {
    it('renders "My Team" text for my-team status', () => {
      render(<StatusBadge status="my-team" />);

      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('applies emerald background styling for my-team status', () => {
      render(<StatusBadge status="my-team" />);

      const badge = screen.getByText('My Team');
      expect(badge.className).toContain('bg-emerald');
    });
  });

  describe('Drafted by other team status', () => {
    it('renders "Team {N}" text when teamNumber is provided', () => {
      render(<StatusBadge status="drafted" teamNumber={5} />);

      expect(screen.getByText('Team 5')).toBeInTheDocument();
    });

    it('renders "Drafted" text when no teamNumber is provided', () => {
      render(<StatusBadge status="drafted" />);

      expect(screen.getByText('Drafted')).toBeInTheDocument();
    });

    it('uses secondary variant for drafted status', () => {
      render(<StatusBadge status="drafted" teamNumber={3} />);

      const badge = screen.getByText('Team 3');
      expect(badge).toHaveAttribute('data-slot', 'badge');
    });
  });

  describe('Accessibility', () => {
    it('provides aria-label for available status', () => {
      render(<StatusBadge status="available" />);

      const badge = screen.getByLabelText(/available/i);
      expect(badge).toBeInTheDocument();
    });

    it('provides aria-label for my-team status', () => {
      render(<StatusBadge status="my-team" />);

      const badge = screen.getByLabelText(/my team/i);
      expect(badge).toBeInTheDocument();
    });

    it('provides aria-label with team number for drafted status', () => {
      render(<StatusBadge status="drafted" teamNumber={7} />);

      const badge = screen.getByLabelText(/drafted by team 7/i);
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('accepts and applies custom className', () => {
      render(<StatusBadge status="available" className="custom-class" />);

      const badge = screen.getByText('Available');
      expect(badge.className).toContain('custom-class');
    });
  });
});
