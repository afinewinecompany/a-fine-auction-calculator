/**
 * PlayerDetailModal Component Tests
 *
 * Tests for the PlayerDetailModal component that displays player details.
 *
 * Story: 6.11 - Implement Player Detail Modal
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerDetailModal } from '@/features/draft/components/PlayerDetailModal';
import type { Player } from '@/features/draft/types/player.types';

const mockPlayer: Player = {
  id: '1',
  name: 'Mike Trout',
  positions: ['CF', 'DH'],
  team: 'LAA',
  projectedValue: 45,
  adjustedValue: 48,
  tier: 'ELITE',
  status: 'available',
};

const mockDraftedPlayer: Player = {
  id: '2',
  name: 'Ronald Acuna Jr.',
  positions: ['OF'],
  team: 'ATL',
  projectedValue: 42,
  adjustedValue: 46,
  tier: 'ELITE',
  status: 'my-team',
  auctionPrice: 50,
};

describe('PlayerDetailModal', () => {
  describe('rendering', () => {
    it('renders player name in header', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText('Mike Trout')).toBeInTheDocument();
    });

    it('renders team and positions', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText(/LAA/)).toBeInTheDocument();
      expect(screen.getByText(/CF, DH/)).toBeInTheDocument();
    });

    it('renders projected value', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText('$45')).toBeInTheDocument();
    });

    it('renders adjusted value prominently', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      const adjustedValue = screen.getByText('$48');
      expect(adjustedValue).toBeInTheDocument();
      expect(adjustedValue.className).toContain('text-2xl');
      expect(adjustedValue.className).toContain('text-emerald-400');
    });

    it('renders tier badge', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText('T1')).toBeInTheDocument();
    });

    it('renders inflation breakdown section', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText('Inflation Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Overall')).toBeInTheDocument();
      expect(screen.getByText(/Position/)).toBeInTheDocument();
      expect(screen.getByText('Budget Factor')).toBeInTheDocument();
    });

    it('does not render when player is null', () => {
      render(
        <PlayerDetailModal player={null} isOpen={true} onClose={() => {}} />
      );

      expect(screen.queryByText('Mike Trout')).not.toBeInTheDocument();
    });
  });

  describe('draft status display', () => {
    it('shows draft status for drafted players', () => {
      render(
        <PlayerDetailModal player={mockDraftedPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText(/On Your Team/)).toBeInTheDocument();
    });

    it('shows auction price for drafted players', () => {
      render(
        <PlayerDetailModal player={mockDraftedPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.getByText((content) => content.includes("Paid") && content.includes("50"))).toBeInTheDocument();
    });

    it('does not show draft status for available players', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      expect(screen.queryByText('Draft Status')).not.toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('calls onClose when dialog is closed', async () => {
      const onClose = vi.fn();
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={onClose} />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('is not visible when isOpen is false', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={false} onClose={() => {}} />
      );

      expect(screen.queryByText('Mike Trout')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('uses dark theme styling', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      const dialog = document.querySelector('[data-slot="dialog-content"]');
      expect(dialog?.className).toContain('bg-slate-950');
    });

    it('has responsive max-width classes', () => {
      render(
        <PlayerDetailModal player={mockPlayer} isOpen={true} onClose={() => {}} />
      );

      const dialog = document.querySelector('[data-slot="dialog-content"]');
      expect(dialog?.className).toContain('max-w-lg');
    });
  });
});
