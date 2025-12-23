/**
 * SlotTracker Component Tests
 *
 * Tests for the SlotTracker component that displays filled vs remaining
 * roster slots with visual progress bar.
 *
 * Story: 7.6 - Display Filled vs Remaining Roster Slots
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SlotTracker, type SlotPlayer, type SlotLeagueSettings } from '@/features/draft/components/SlotTracker';

// Mock player data
const mockHitters: SlotPlayer[] = [
  { playerId: '1', name: 'Mike Trout', position: 'OF', auctionPrice: 42 },
  { playerId: '2', name: 'Freddie Freeman', position: '1B', auctionPrice: 35 },
  { playerId: '3', name: 'Mookie Betts', position: '2B', auctionPrice: 38 },
];

const mockPitchers: SlotPlayer[] = [
  { playerId: '4', name: 'Gerrit Cole', position: 'SP', auctionPrice: 28 },
  { playerId: '5', name: 'Josh Hader', position: 'RP', auctionPrice: 15 },
];

const mockBench: SlotPlayer[] = [
  { playerId: '6', name: 'Backup Player', position: 'BN', auctionPrice: 1 },
];

const defaultLeagueSettings: SlotLeagueSettings = {
  rosterSpotsHitters: 14,
  rosterSpotsPitchers: 9,
  rosterSpotsBench: 0,
};

describe('SlotTracker', () => {
  describe('rendering', () => {
    it('renders the component with correct test id', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );
      expect(screen.getByTestId('slot-tracker')).toBeInTheDocument();
    });

    it('has correct aria label for accessibility', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );
      expect(screen.getByRole('region', { name: /roster slot tracking/i })).toBeInTheDocument();
    });
  });

  describe('overall count', () => {
    it('displays correct overall slot count', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      // 3 hitters + 2 pitchers = 5 filled, 14 + 9 = 23 total
      expect(screen.getByTestId('overall-count')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText(/roster spots filled/i)).toBeInTheDocument();
    });

    it('displays 0 when no players drafted', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar section', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('progress-section')).toBeInTheDocument();
    });

    it('displays correct completion percentage', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      // 5/23 = 21.7% rounded to 22%
      expect(screen.getByText(/22% complete/i)).toBeInTheDocument();
    });

    it('shows 0% when no players drafted', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    });

    it('shows 100% when roster is complete', () => {
      // Create full roster matching league settings
      const fullHitters: SlotPlayer[] = Array(14).fill(null).map((_, i) => ({
        playerId: `h${i}`,
        name: `Hitter ${i}`,
        position: 'OF',
        auctionPrice: 10,
      }));
      const fullPitchers: SlotPlayer[] = Array(9).fill(null).map((_, i) => ({
        playerId: `p${i}`,
        name: `Pitcher ${i}`,
        position: 'SP',
        auctionPrice: 10,
      }));

      render(
        <SlotTracker
          roster={{ hitters: fullHitters, pitchers: fullPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByText(/100% complete/i)).toBeInTheDocument();
    });
  });

  describe('category breakdown', () => {
    it('displays category breakdown section', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('category-breakdown')).toBeInTheDocument();
    });

    it('displays hitters slot count', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('slot-hitters')).toBeInTheDocument();
      expect(screen.getByTestId('slot-hitters')).toHaveTextContent('Hitters:');
      expect(screen.getByTestId('slot-hitters')).toHaveTextContent('3/14');
    });

    it('displays pitchers slot count', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('slot-pitchers')).toBeInTheDocument();
      expect(screen.getByTestId('slot-pitchers')).toHaveTextContent('Pitchers:');
      expect(screen.getByTestId('slot-pitchers')).toHaveTextContent('2/9');
    });

    it('displays bench slot count when bench spots > 0', () => {
      const settingsWithBench: SlotLeagueSettings = {
        ...defaultLeagueSettings,
        rosterSpotsBench: 3,
      };

      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: mockBench }}
          leagueSettings={settingsWithBench}
        />
      );

      expect(screen.getByTestId('slot-bench')).toBeInTheDocument();
      expect(screen.getByTestId('slot-bench')).toHaveTextContent('Bench:');
      expect(screen.getByTestId('slot-bench')).toHaveTextContent('1/3');
    });

    it('hides bench when bench spots = 0', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.queryByTestId('slot-bench')).not.toBeInTheDocument();
    });
  });

  describe('completion indicators', () => {
    it('shows checkmark when hitters category is complete', () => {
      const fullHitters: SlotPlayer[] = Array(14).fill(null).map((_, i) => ({
        playerId: `h${i}`,
        name: `Hitter ${i}`,
        position: 'OF',
        auctionPrice: 10,
      }));

      render(
        <SlotTracker
          roster={{ hitters: fullHitters, pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('check-hitters')).toBeInTheDocument();
    });

    it('shows checkmark when pitchers category is complete', () => {
      const fullPitchers: SlotPlayer[] = Array(9).fill(null).map((_, i) => ({
        playerId: `p${i}`,
        name: `Pitcher ${i}`,
        position: 'SP',
        auctionPrice: 10,
      }));

      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: fullPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.getByTestId('check-pitchers')).toBeInTheDocument();
    });

    it('does not show checkmark when category is incomplete', () => {
      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={defaultLeagueSettings}
        />
      );

      expect(screen.queryByTestId('check-hitters')).not.toBeInTheDocument();
      expect(screen.queryByTestId('check-pitchers')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero total slots gracefully', () => {
      const zeroSettings: SlotLeagueSettings = {
        rosterSpotsHitters: 0,
        rosterSpotsPitchers: 0,
        rosterSpotsBench: 0,
      };

      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={zeroSettings}
        />
      );

      expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
    });

    it('handles overfilled roster (more players than slots)', () => {
      const smallSettings: SlotLeagueSettings = {
        rosterSpotsHitters: 2,
        rosterSpotsPitchers: 1,
        rosterSpotsBench: 0,
      };

      render(
        <SlotTracker
          roster={{ hitters: mockHitters, pitchers: mockPitchers, bench: [] }}
          leagueSettings={smallSettings}
        />
      );

      // Should show actual counts even if over limit
      expect(screen.getByTestId('slot-hitters')).toHaveTextContent('3/2');
      expect(screen.getByTestId('slot-pitchers')).toHaveTextContent('2/1');
    });
  });

  describe('custom className', () => {
    it('applies custom className to container', () => {
      render(
        <SlotTracker
          roster={{ hitters: [], pitchers: [], bench: [] }}
          leagueSettings={defaultLeagueSettings}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('slot-tracker');
      expect(container.className).toContain('custom-class');
    });
  });
});
