/**
 * Tests for PlayerQueue Value Indicator Integration
 *
 * Story: 6.6 - Implement Color-Coded Value Indicators
 *
 * Tests the integration of color-coded value indicators in the PlayerQueue
 * component, including background colors and value labels for drafted players.
 */

import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Create a test player helper
function createPlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: '1',
    name: 'Test Player',
    positions: ['OF'],
    team: 'TST',
    projectedValue: 30,
    adjustedValue: 40,
    tier: 'MID',
    status: 'available',
    ...overrides,
  };
}

describe('PlayerQueue Value Indicators', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  // ============================================================================
  // Undrafted Player Tests
  // ============================================================================
  describe('undrafted players', () => {
    it('should not show value indicator for available players', () => {
      const players = [createPlayer({ status: 'available' })];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      // Value indicator should not be rendered (returns null)
      expect(screen.queryByTestId('value-indicator-label')).not.toBeInTheDocument();
    });

    it('should not apply value background for undrafted players', () => {
      const players = [createPlayer({ status: 'available' })];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      const row = screen.getByRole('button', { name: /Select Test Player/i });
      expect(row).not.toHaveClass('bg-emerald-900/20');
      expect(row).not.toHaveClass('bg-yellow-900/20');
      expect(row).not.toHaveClass('bg-red-900/20');
    });
  });

  // ============================================================================
  // Drafted Player - Steal Classification
  // ============================================================================
  describe('steal classification (>10% under)', () => {
    it('should show Steal label when price is significantly under value', () => {
      // $30 for $40 value = 25% under (steal)
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Steal');
    });

    it('should apply emerald background for steal', () => {
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      const row = screen.getByRole('button', { name: /Select Test Player/i });
      expect(row).toHaveClass('bg-emerald-900/20');
    });
  });

  // ============================================================================
  // Drafted Player - Fair Value Classification
  // ============================================================================
  describe('fair value classification (within ±10%)', () => {
    it('should show Fair Value label when price matches value', () => {
      // $40 for $40 value = 0% (fair)
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 40,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });

    it('should apply yellow background for fair value', () => {
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 40,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      const row = screen.getByRole('button', { name: /Select Test Player/i });
      expect(row).toHaveClass('bg-yellow-900/20');
    });

    it('should show fair value at 10% under boundary', () => {
      // $36 for $40 value = 10% under (boundary - fair)
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 36,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });

    it('should show fair value at 10% over boundary', () => {
      // $44 for $40 value = 10% over (boundary - fair)
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 44,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });
  });

  // ============================================================================
  // Drafted Player - Overpay Classification
  // ============================================================================
  describe('overpay classification (>10% over)', () => {
    it('should show Overpay label when price is significantly over value', () => {
      // $50 for $40 value = 25% over (overpay)
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 50,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Overpay');
    });

    it('should apply red background for overpay', () => {
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 50,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      const row = screen.getByRole('button', { name: /Select Test Player/i });
      expect(row).toHaveClass('bg-red-900/20');
    });
  });

  // ============================================================================
  // My Team Players
  // ============================================================================
  describe('my-team players', () => {
    it('should show value indicator for my-team players', () => {
      const players = [
        createPlayer({
          status: 'my-team',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Steal');
    });

    it('should apply value background for my-team players', () => {
      const players = [
        createPlayer({
          status: 'my-team',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      const row = screen.getByRole('button', { name: /Select Test Player/i });
      expect(row).toHaveClass('bg-emerald-900/20');
    });
  });

  // ============================================================================
  // Value Column Header
  // ============================================================================
  describe('value column header', () => {
    it('should display Value column header', () => {
      const players = [createPlayer()];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByRole('columnheader', { name: 'Value' })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Mixed Player States
  // ============================================================================
  describe('mixed player states', () => {
    it('should correctly show indicators for mixed drafted/undrafted players', () => {
      const players = [
        createPlayer({
          id: '1',
          name: 'Available Player',
          status: 'available',
        }),
        createPlayer({
          id: '2',
          name: 'Steal Player',
          status: 'drafted',
          auctionPrice: 20,
          adjustedValue: 40,
        }),
        createPlayer({
          id: '3',
          name: 'Overpay Player',
          status: 'drafted',
          auctionPrice: 60,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      // Should have 2 value indicators (for the drafted players)
      const indicators = screen.getAllByTestId('value-indicator-label');
      expect(indicators).toHaveLength(2);
      expect(indicators[0]).toHaveTextContent('Steal');
      expect(indicators[1]).toHaveTextContent('Overpay');
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================
  describe('accessibility', () => {
    it('should have accessible value indicator with role status', () => {
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have text labels not just colors', () => {
      const players = [
        createPlayer({
          status: 'drafted',
          auctionPrice: 30,
          adjustedValue: 40,
        }),
      ];
      render(<PlayerQueue players={players} onPlayerSelect={mockOnSelect} />);

      // Text label must be visible
      expect(screen.getByText('Steal')).toBeVisible();
    });
  });
});
