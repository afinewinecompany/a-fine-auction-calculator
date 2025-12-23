/**
 * PlayerQueue Responsive Design Tests
 *
 * Tests for mobile-responsive behavior of PlayerQueue component.
 *
 * Story: 6.10 - Implement Mobile-Responsive Design
 */

import { render, screen } from '@testing-library/react';
import { PlayerQueue } from '@/features/draft/components/PlayerQueue';
import type { Player } from '@/features/draft/types/player.types';

// Mock players for testing
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Mike Trout',
    positions: ['CF', 'DH'],
    team: 'LAA',
    projectedValue: 45,
    adjustedValue: 48,
    tier: 'ELITE',
    status: 'available',
  },
  {
    id: '2',
    name: 'Ronald Acuna Jr.',
    positions: ['OF'],
    team: 'ATL',
    projectedValue: 42,
    adjustedValue: 46,
    tier: 'ELITE',
    status: 'available',
  },
];

describe('PlayerQueue Responsive Design', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Horizontal scroll container', () => {
    it('has overflow-x-auto for horizontal scrolling', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('has touch-pan-x for touch scrolling', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const scrollContainer = document.querySelector('.touch-pan-x');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('table has minimum width for proper scrolling', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const table = document.querySelector('table');
      expect(table?.className).toContain('min-w-');
    });
  });

  describe('Sticky first column', () => {
    it('applies sticky positioning to player name column', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const stickyCell = document.querySelector('.sticky.left-0');
      expect(stickyCell).toBeInTheDocument();
    });

    it('applies z-index for proper layering', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const stickyCell = document.querySelector('.sticky.left-0.z-10');
      expect(stickyCell).toBeInTheDocument();
    });

    it('applies background to prevent see-through', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const stickyCell = document.querySelector('.sticky.left-0');
      expect(stickyCell?.className).toContain('bg-');
    });
  });

  describe('Touch targets', () => {
    it('rows have minimum 44px height for touch', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const rows = document.querySelectorAll('tr[role="button"]');
      rows.forEach(row => {
        expect(row.className).toContain('min-h-[44px]');
      });
    });

    it('player cells have proper padding for touch', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const cells = document.querySelectorAll('td');
      cells.forEach(cell => {
        expect(cell.className).toContain('py-');
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains proper role attributes for keyboard navigation', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const rows = screen.getAllByRole('button');
      expect(rows.length).toBeGreaterThan(0);
    });

    it('maintains tabIndex for keyboard focus', () => {
      render(<PlayerQueue players={mockPlayers} onPlayerSelect={mockOnSelect} />);

      const focusableRows = document.querySelectorAll('tr[tabindex="0"]');
      expect(focusableRows.length).toBe(mockPlayers.length);
    });
  });
});