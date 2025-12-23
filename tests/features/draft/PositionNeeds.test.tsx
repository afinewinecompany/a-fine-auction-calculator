/**
 * PositionNeeds Component Tests
 *
 * Tests for the PositionNeeds component that displays unfilled positions
 * with counts using badge/chip components.
 *
 * Story: 7.7 - Display Position Needs Summary
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PositionNeeds,
  type PositionPlayer,
  type PositionRequirements,
} from '@/features/draft/components/PositionNeeds';

// Mock player data
const mockHitters: PositionPlayer[] = [
  { playerId: '1', name: 'Mike Trout', position: 'OF', auctionPrice: 42 },
  { playerId: '2', name: 'Freddie Freeman', position: '1B', auctionPrice: 35 },
];

const mockPitchers: PositionPlayer[] = [
  { playerId: '3', name: 'Gerrit Cole', position: 'SP', auctionPrice: 28 },
  { playerId: '4', name: 'Max Scherzer', position: 'SP', auctionPrice: 25 },
];

const defaultRequirements: PositionRequirements = {
  C: 1,
  '1B': 1,
  '2B': 1,
  SS: 1,
  '3B': 1,
  OF: 5,
  SP: 5,
  RP: 3,
};

describe('PositionNeeds', () => {
  describe('rendering', () => {
    it('renders the component with correct test id', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );
      expect(screen.getByTestId('position-needs')).toBeInTheDocument();
    });

    it('has correct aria label for accessibility', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );
      expect(screen.getByRole('region', { name: /position needs/i })).toBeInTheDocument();
    });

    it('renders "Still Needed" label', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );
      expect(screen.getByText(/still needed/i)).toBeInTheDocument();
    });
  });

  describe('position badges', () => {
    it('displays badges for unfilled positions', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      expect(screen.getByTestId('position-badges')).toBeInTheDocument();
      expect(screen.getByTestId('position-badge-C')).toBeInTheDocument();
      expect(screen.getByTestId('position-badge-1B')).toBeInTheDocument();
      expect(screen.getByTestId('position-badge-2B')).toBeInTheDocument();
    });

    it('displays correct count for each unfilled position', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      expect(screen.getByText('C: 1')).toBeInTheDocument();
      expect(screen.getByText('OF: 5')).toBeInTheDocument();
      expect(screen.getByText('SP: 5')).toBeInTheDocument();
      expect(screen.getByText('RP: 3')).toBeInTheDocument();
    });

    it('updates badge count based on drafted players', () => {
      // Drafted 1 OF player, need 4 more
      render(
        <PositionNeeds
          roster={{ hitters: mockHitters, pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // OF should show 4 (5 required - 1 drafted)
      expect(screen.getByText('OF: 4')).toBeInTheDocument();
      // 1B is filled (1 required - 1 drafted = 0), should not appear
      expect(screen.queryByTestId('position-badge-1B')).not.toBeInTheDocument();
    });
  });

  describe('hiding filled positions', () => {
    it('hides position badge when position is fully filled', () => {
      const filledHitters: PositionPlayer[] = [
        { playerId: '1', name: 'Catcher', position: 'C', auctionPrice: 10 },
      ];

      render(
        <PositionNeeds
          roster={{ hitters: filledHitters, pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // C should not appear since it's filled
      expect(screen.queryByTestId('position-badge-C')).not.toBeInTheDocument();
    });

    it('hides all badges when all positions are filled', () => {
      // Create full roster
      const fullHitters: PositionPlayer[] = [
        { playerId: '1', name: 'C1', position: 'C', auctionPrice: 10 },
        { playerId: '2', name: '1B1', position: '1B', auctionPrice: 10 },
        { playerId: '3', name: '2B1', position: '2B', auctionPrice: 10 },
        { playerId: '4', name: 'SS1', position: 'SS', auctionPrice: 10 },
        { playerId: '5', name: '3B1', position: '3B', auctionPrice: 10 },
        { playerId: '6', name: 'OF1', position: 'OF', auctionPrice: 10 },
        { playerId: '7', name: 'OF2', position: 'OF', auctionPrice: 10 },
        { playerId: '8', name: 'OF3', position: 'OF', auctionPrice: 10 },
        { playerId: '9', name: 'OF4', position: 'OF', auctionPrice: 10 },
        { playerId: '10', name: 'OF5', position: 'OF', auctionPrice: 10 },
      ];
      const fullPitchers: PositionPlayer[] = [
        { playerId: '11', name: 'SP1', position: 'SP', auctionPrice: 10 },
        { playerId: '12', name: 'SP2', position: 'SP', auctionPrice: 10 },
        { playerId: '13', name: 'SP3', position: 'SP', auctionPrice: 10 },
        { playerId: '14', name: 'SP4', position: 'SP', auctionPrice: 10 },
        { playerId: '15', name: 'SP5', position: 'SP', auctionPrice: 10 },
        { playerId: '16', name: 'RP1', position: 'RP', auctionPrice: 10 },
        { playerId: '17', name: 'RP2', position: 'RP', auctionPrice: 10 },
        { playerId: '18', name: 'RP3', position: 'RP', auctionPrice: 10 },
      ];

      render(
        <PositionNeeds
          roster={{ hitters: fullHitters, pitchers: fullPitchers, bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // Should show completion message instead of badges
      expect(screen.getByTestId('position-needs-complete')).toBeInTheDocument();
      expect(screen.queryByTestId('position-badges')).not.toBeInTheDocument();
    });
  });

  describe('completion state', () => {
    it('displays completion message when all positions filled', () => {
      const fullHitters: PositionPlayer[] = [
        { playerId: '1', name: 'C1', position: 'C', auctionPrice: 10 },
        { playerId: '2', name: '1B1', position: '1B', auctionPrice: 10 },
        { playerId: '3', name: '2B1', position: '2B', auctionPrice: 10 },
        { playerId: '4', name: 'SS1', position: 'SS', auctionPrice: 10 },
        { playerId: '5', name: '3B1', position: '3B', auctionPrice: 10 },
        { playerId: '6', name: 'OF1', position: 'OF', auctionPrice: 10 },
        { playerId: '7', name: 'OF2', position: 'OF', auctionPrice: 10 },
        { playerId: '8', name: 'OF3', position: 'OF', auctionPrice: 10 },
        { playerId: '9', name: 'OF4', position: 'OF', auctionPrice: 10 },
        { playerId: '10', name: 'OF5', position: 'OF', auctionPrice: 10 },
      ];
      const fullPitchers: PositionPlayer[] = [
        { playerId: '11', name: 'SP1', position: 'SP', auctionPrice: 10 },
        { playerId: '12', name: 'SP2', position: 'SP', auctionPrice: 10 },
        { playerId: '13', name: 'SP3', position: 'SP', auctionPrice: 10 },
        { playerId: '14', name: 'SP4', position: 'SP', auctionPrice: 10 },
        { playerId: '15', name: 'SP5', position: 'SP', auctionPrice: 10 },
        { playerId: '16', name: 'RP1', position: 'RP', auctionPrice: 10 },
        { playerId: '17', name: 'RP2', position: 'RP', auctionPrice: 10 },
        { playerId: '18', name: 'RP3', position: 'RP', auctionPrice: 10 },
      ];

      render(
        <PositionNeeds
          roster={{ hitters: fullHitters, pitchers: fullPitchers, bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      expect(screen.getByText(/all positions filled/i)).toBeInTheDocument();
    });

    it('has status role for completion message', () => {
      const fullHitters: PositionPlayer[] = [
        { playerId: '1', name: 'C1', position: 'C', auctionPrice: 10 },
        { playerId: '2', name: '1B1', position: '1B', auctionPrice: 10 },
        { playerId: '3', name: '2B1', position: '2B', auctionPrice: 10 },
        { playerId: '4', name: 'SS1', position: 'SS', auctionPrice: 10 },
        { playerId: '5', name: '3B1', position: '3B', auctionPrice: 10 },
        { playerId: '6', name: 'OF1', position: 'OF', auctionPrice: 10 },
        { playerId: '7', name: 'OF2', position: 'OF', auctionPrice: 10 },
        { playerId: '8', name: 'OF3', position: 'OF', auctionPrice: 10 },
        { playerId: '9', name: 'OF4', position: 'OF', auctionPrice: 10 },
        { playerId: '10', name: 'OF5', position: 'OF', auctionPrice: 10 },
      ];
      const fullPitchers: PositionPlayer[] = [
        { playerId: '11', name: 'SP1', position: 'SP', auctionPrice: 10 },
        { playerId: '12', name: 'SP2', position: 'SP', auctionPrice: 10 },
        { playerId: '13', name: 'SP3', position: 'SP', auctionPrice: 10 },
        { playerId: '14', name: 'SP4', position: 'SP', auctionPrice: 10 },
        { playerId: '15', name: 'SP5', position: 'SP', auctionPrice: 10 },
        { playerId: '16', name: 'RP1', position: 'RP', auctionPrice: 10 },
        { playerId: '17', name: 'RP2', position: 'RP', auctionPrice: 10 },
        { playerId: '18', name: 'RP3', position: 'RP', auctionPrice: 10 },
      ];

      render(
        <PositionNeeds
          roster={{ hitters: fullHitters, pitchers: fullPitchers, bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('position ordering', () => {
    it('displays positions in correct order (C, 1B, 2B, SS, 3B, OF, SP, RP)', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      const badges = screen.getAllByTestId(/position-badge-/);
      const positions = badges.map((badge) => badge.textContent?.split(':')[0]);

      // Verify order
      expect(positions).toEqual(['C', '1B', '2B', 'SS', '3B', 'OF', 'SP', 'RP']);
    });
  });

  describe('edge cases', () => {
    it('displays no requirements message when requirements are empty', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={{}}
        />
      );

      expect(screen.getByTestId('position-needs-no-requirements')).toBeInTheDocument();
      expect(screen.getByText(/no position requirements set/i)).toBeInTheDocument();
    });

    it('handles undefined requirements gracefully with defaults', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
        />
      );

      // Should use default requirements
      expect(screen.getByTestId('position-needs')).toBeInTheDocument();
      expect(screen.getByTestId('position-badge-C')).toBeInTheDocument();
    });

    it('shows all requirements when no players drafted', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // All positions should be shown with full requirements
      expect(screen.getByText('C: 1')).toBeInTheDocument();
      expect(screen.getByText('1B: 1')).toBeInTheDocument();
      expect(screen.getByText('OF: 5')).toBeInTheDocument();
      expect(screen.getByText('SP: 5')).toBeInTheDocument();
      expect(screen.getByText('RP: 3')).toBeInTheDocument();
    });

    it('ignores positions with 0 requirements', () => {
      const customRequirements: PositionRequirements = {
        C: 1,
        '1B': 0,
        OF: 3,
      };

      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={customRequirements}
        />
      );

      expect(screen.getByTestId('position-badge-C')).toBeInTheDocument();
      expect(screen.getByTestId('position-badge-OF')).toBeInTheDocument();
      expect(screen.queryByTestId('position-badge-1B')).not.toBeInTheDocument();
    });
  });

  describe('partial roster scenarios', () => {
    it('correctly calculates needs with partial hitter roster', () => {
      const partialHitters: PositionPlayer[] = [
        { playerId: '1', name: 'OF1', position: 'OF', auctionPrice: 10 },
        { playerId: '2', name: 'OF2', position: 'OF', auctionPrice: 10 },
        { playerId: '3', name: '1B1', position: '1B', auctionPrice: 10 },
      ];

      render(
        <PositionNeeds
          roster={{ hitters: partialHitters, pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // OF should show 3 (5 - 2 drafted)
      expect(screen.getByText('OF: 3')).toBeInTheDocument();
      // 1B should not appear (1 - 1 drafted = 0)
      expect(screen.queryByTestId('position-badge-1B')).not.toBeInTheDocument();
      // C should still show 1 (unfilled)
      expect(screen.getByText('C: 1')).toBeInTheDocument();
    });

    it('correctly calculates needs with partial pitcher roster', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: mockPitchers, bench: [] }}
          positionRequirements={defaultRequirements}
        />
      );

      // SP should show 3 (5 - 2 drafted)
      expect(screen.getByText('SP: 3')).toBeInTheDocument();
      // RP should still show 3 (unfilled)
      expect(screen.getByText('RP: 3')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('applies custom className to container', () => {
      render(
        <PositionNeeds
          roster={{ hitters: [], pitchers: [], bench: [] }}
          positionRequirements={defaultRequirements}
          className="custom-class"
        />
      );

      const container = screen.getByTestId('position-needs');
      expect(container.className).toContain('custom-class');
    });
  });
});
