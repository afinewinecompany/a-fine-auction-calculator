/**
 * PlayerCard Component Tests
 *
 * Tests for individual player display card in roster overview.
 * Displays player name, position(s), auction price, and projected stats.
 *
 * Story: 12.2 - Display Complete Roster Organized by Position
 */

import { render, screen } from '@testing-library/react';
import { PlayerCard } from '@/features/draft/components/PlayerCard';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';

const createMockPlayer = (overrides: Partial<DraftedPlayer> = {}): DraftedPlayer => ({
  playerId: 'player-1',
  playerName: 'Mike Trout',
  position: 'OF',
  purchasePrice: 45,
  projectedValue: 42,
  variance: 3,
  draftedBy: 'user',
  draftedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('PlayerCard', () => {
  describe('rendering', () => {
    it('should render player name', () => {
      const player = createMockPlayer({ playerName: 'Shohei Ohtani' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('Shohei Ohtani')).toBeInTheDocument();
    });

    it('should render player position', () => {
      const player = createMockPlayer({ position: 'OF' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('OF')).toBeInTheDocument();
    });

    it('should render multi-position players correctly', () => {
      const player = createMockPlayer({ position: 'OF,2B,DH' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('OF,2B,DH')).toBeInTheDocument();
    });

    it('should render auction price formatted as currency', () => {
      const player = createMockPlayer({ purchasePrice: 45 });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('$45')).toBeInTheDocument();
    });

    it('should render single-digit price with dollar sign', () => {
      const player = createMockPlayer({ purchasePrice: 1 });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('$1')).toBeInTheDocument();
    });

    it('should render projected value formatted as currency', () => {
      const player = createMockPlayer({ projectedValue: 42 });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('$42')).toBeInTheDocument();
    });
  });

  describe('variance display', () => {
    it('should show positive variance with + sign for good value', () => {
      const player = createMockPlayer({ variance: -5 }); // paid 5 less than value = good
      render(<PlayerCard player={player} />);

      // Negative variance (paid less than value) should show as positive savings
      expect(screen.getByText('+$5')).toBeInTheDocument();
    });

    it('should show negative variance with - sign for overpay', () => {
      const player = createMockPlayer({ variance: 5 }); // paid 5 more than value = bad
      render(<PlayerCard player={player} />);

      // Positive variance (paid more than value) should show as loss
      expect(screen.getByText('-$5')).toBeInTheDocument();
    });

    it('should show zero variance as $0', () => {
      const player = createMockPlayer({ variance: 0 });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('$0')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply dark slate theme styling', () => {
      const player = createMockPlayer();
      const { container } = render(<PlayerCard player={player} />);

      // Card should have dark background
      const card = container.firstChild;
      expect(card).toHaveClass('bg-slate-800');
    });

    it('should apply emerald accent for good value (steal)', () => {
      const player = createMockPlayer({ variance: -10 }); // paid 10 less = steal
      render(<PlayerCard player={player} />);

      const varianceElement = screen.getByText('+$10');
      expect(varianceElement).toHaveClass('text-emerald-400');
    });

    it('should apply red accent for overpay', () => {
      const player = createMockPlayer({ variance: 10 }); // paid 10 more = overpay
      render(<PlayerCard player={player} />);

      const varianceElement = screen.getByText('-$10');
      expect(varianceElement).toHaveClass('text-red-400');
    });

    it('should apply neutral color for fair value', () => {
      const player = createMockPlayer({ variance: 0 });
      render(<PlayerCard player={player} />);

      const varianceElement = screen.getByText('$0');
      expect(varianceElement).toHaveClass('text-slate-400');
    });
  });

  describe('tier display', () => {
    it('should show ELITE tier badge when provided', () => {
      const player = createMockPlayer({ tier: 'ELITE' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('ELITE')).toBeInTheDocument();
    });

    it('should show MID tier badge when provided', () => {
      const player = createMockPlayer({ tier: 'MID' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('MID')).toBeInTheDocument();
    });

    it('should show LOWER tier badge when provided', () => {
      const player = createMockPlayer({ tier: 'LOWER' });
      render(<PlayerCard player={player} />);

      expect(screen.getByText('LOWER')).toBeInTheDocument();
    });

    it('should not show tier badge when tier is undefined', () => {
      const player = createMockPlayer({ tier: undefined });
      render(<PlayerCard player={player} />);

      expect(screen.queryByText('ELITE')).not.toBeInTheDocument();
      expect(screen.queryByText('MID')).not.toBeInTheDocument();
      expect(screen.queryByText('LOWER')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have appropriate structure as article', () => {
      const player = createMockPlayer();
      render(<PlayerCard player={player} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have player name as heading', () => {
      const player = createMockPlayer({ playerName: 'Mike Trout' });
      render(<PlayerCard player={player} />);

      expect(
        screen.getByRole('heading', { name: 'Mike Trout', level: 3 })
      ).toBeInTheDocument();
    });
  });
});
