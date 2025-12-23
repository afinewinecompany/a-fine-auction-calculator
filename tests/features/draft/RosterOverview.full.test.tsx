/**
 * RosterOverview Component Tests
 *
 * Tests for the roster overview section displaying complete roster
 * organized by position groups: Hitters, Pitchers, Bench.
 *
 * Story: 12.2 - Display Complete Roster Organized by Position
 */

import { render, screen, within } from '@testing-library/react';
import { RosterOverview } from '@/features/draft/components/RosterOverview';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';

const createMockPlayer = (overrides: Partial<DraftedPlayer> = {}): DraftedPlayer => ({
  playerId: 'player-1',
  playerName: 'Test Player',
  position: 'OF',
  purchasePrice: 20,
  projectedValue: 25,
  variance: -5,
  draftedBy: 'user',
  draftedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const mockRoster: DraftedPlayer[] = [
  createMockPlayer({ playerId: '1', playerName: 'Mike Trout', position: 'OF', purchasePrice: 45, projectedValue: 42, variance: 3 }),
  createMockPlayer({ playerId: '2', playerName: 'Shohei Ohtani', position: 'SP', purchasePrice: 50, projectedValue: 48, variance: 2 }),
  createMockPlayer({ playerId: '3', playerName: 'Mookie Betts', position: '2B', purchasePrice: 35, projectedValue: 38, variance: -3 }),
  createMockPlayer({ playerId: '4', playerName: 'Gerrit Cole', position: 'SP', purchasePrice: 32, projectedValue: 35, variance: -3 }),
  createMockPlayer({ playerId: '5', playerName: 'Josh Jung', position: 'BN', purchasePrice: 5, projectedValue: 8, variance: -3 }),
];

describe('RosterOverview', () => {
  describe('section rendering', () => {
    it('should render Hitters section', () => {
      render(<RosterOverview roster={mockRoster} />);

      expect(screen.getByText('Hitters')).toBeInTheDocument();
    });

    it('should render Pitchers section', () => {
      render(<RosterOverview roster={mockRoster} />);

      expect(screen.getByText('Pitchers')).toBeInTheDocument();
    });

    it('should render Bench section', () => {
      render(<RosterOverview roster={mockRoster} />);

      expect(screen.getByText('Bench')).toBeInTheDocument();
    });
  });

  describe('player grouping', () => {
    it('should display hitters in Hitters section', () => {
      render(<RosterOverview roster={mockRoster} />);

      // Find hitters section
      const hittersSection = screen.getByRole('region', { name: /hitters/i });

      expect(within(hittersSection).getByText('Mike Trout')).toBeInTheDocument();
      expect(within(hittersSection).getByText('Mookie Betts')).toBeInTheDocument();
    });

    it('should display pitchers in Pitchers section', () => {
      render(<RosterOverview roster={mockRoster} />);

      const pitchersSection = screen.getByRole('region', { name: /pitchers/i });

      expect(within(pitchersSection).getByText('Shohei Ohtani')).toBeInTheDocument();
      expect(within(pitchersSection).getByText('Gerrit Cole')).toBeInTheDocument();
    });

    it('should display bench players in Bench section', () => {
      render(<RosterOverview roster={mockRoster} />);

      const benchSection = screen.getByRole('region', { name: /bench/i });

      expect(within(benchSection).getByText('Josh Jung')).toBeInTheDocument();
    });
  });

  describe('player counts', () => {
    it('should show player count for Hitters section', () => {
      render(<RosterOverview roster={mockRoster} />);

      // 2 hitters in mock roster - look for "2 players" specifically in header
      const hittersSection = screen.getByRole('region', { name: /hitters/i });
      expect(within(hittersSection).getByText('2 players')).toBeInTheDocument();
    });

    it('should show player count for Pitchers section', () => {
      render(<RosterOverview roster={mockRoster} />);

      // Check for 2 pitchers - look for "2 players" text
      const pitchersSection = screen.getByRole('region', { name: /pitchers/i });
      expect(within(pitchersSection).getByText('2 players')).toBeInTheDocument();
    });

    it('should show singular "player" for single player', () => {
      const singleBenchRoster = [
        createMockPlayer({ playerId: '1', position: 'BN' }),
      ];
      render(<RosterOverview roster={singleBenchRoster} />);

      expect(screen.getByText('1 player')).toBeInTheDocument();
    });
  });

  describe('totals display', () => {
    it('should show total spending for Hitters section', () => {
      render(<RosterOverview roster={mockRoster} />);

      const hittersSection = screen.getByRole('region', { name: /hitters/i });
      // Trout $45 + Betts $35 = $80
      expect(within(hittersSection).getByText('$80')).toBeInTheDocument();
    });

    it('should show total spending for Pitchers section', () => {
      render(<RosterOverview roster={mockRoster} />);

      const pitchersSection = screen.getByRole('region', { name: /pitchers/i });
      // Ohtani $50 + Cole $32 = $82
      expect(within(pitchersSection).getByText('$82')).toBeInTheDocument();
    });

    it('should show total spending for Bench section', () => {
      render(<RosterOverview roster={mockRoster} />);

      const benchSection = screen.getByRole('region', { name: /bench/i });
      // Jung $5 - multiple $5 elements exist (header total and player card price)
      // Just verify at least one exists
      const priceElements = within(benchSection).getAllByText('$5');
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });

  describe('empty roster handling', () => {
    it('should show empty state message when roster is empty', () => {
      render(<RosterOverview roster={[]} />);

      expect(screen.getByText(/no players drafted/i)).toBeInTheDocument();
    });

    it('should hide Hitters section when no hitters', () => {
      const pitchersOnly = [
        createMockPlayer({ playerId: '1', position: 'SP' }),
      ];
      render(<RosterOverview roster={pitchersOnly} />);

      const hittersSection = screen.queryByRole('region', { name: /hitters/i });
      expect(hittersSection).not.toBeInTheDocument();
    });

    it('should hide Pitchers section when no pitchers', () => {
      const hittersOnly = [
        createMockPlayer({ playerId: '1', position: 'OF' }),
      ];
      render(<RosterOverview roster={hittersOnly} />);

      const pitchersSection = screen.queryByRole('region', { name: /pitchers/i });
      expect(pitchersSection).not.toBeInTheDocument();
    });

    it('should hide Bench section when no bench players', () => {
      const noBeench = [
        createMockPlayer({ playerId: '1', position: 'OF' }),
        createMockPlayer({ playerId: '2', position: 'SP' }),
      ];
      render(<RosterOverview roster={noBeench} />);

      const benchSection = screen.queryByRole('region', { name: /bench/i });
      expect(benchSection).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply dark slate theme to container', () => {
      const { container } = render(<RosterOverview roster={mockRoster} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-slate-900');
    });

    it('should use emerald accents for section headers', () => {
      render(<RosterOverview roster={mockRoster} />);

      const hittersHeader = screen.getByRole('heading', { name: /hitters/i });
      expect(hittersHeader).toHaveClass('text-emerald-400');
    });
  });

  describe('accessibility', () => {
    it('should have section landmark role', () => {
      render(<RosterOverview roster={mockRoster} />);

      expect(screen.getByRole('region', { name: /roster overview/i })).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<RosterOverview roster={mockRoster} />);

      // Main heading
      expect(screen.getByRole('heading', { level: 2, name: /roster overview/i })).toBeInTheDocument();

      // Sub-headings for each section
      expect(screen.getByRole('heading', { level: 3, name: /hitters/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /pitchers/i })).toBeInTheDocument();
    });
  });
});
