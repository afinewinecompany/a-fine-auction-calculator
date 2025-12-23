/**
 * StealCard Component Tests
 *
 * Tests for the StealCard component that displays individual steal information.
 * A "steal" is a player acquired below their inflation-adjusted value.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StealCard } from '@/features/draft/components/StealCard';
import type { Steal } from '@/features/draft/utils/valueAnalysis';
import type { DraftedPlayer } from '@/features/draft/types/draft.types';

const createMockSteal = (overrides?: Partial<Steal>): Steal => {
  const player: DraftedPlayer = {
    playerId: 'p1',
    playerName: 'Mike Trout',
    position: 'OF',
    purchasePrice: 35,
    projectedValue: 45,
    variance: -10,
    draftedBy: 'user',
    draftedAt: new Date().toISOString(),
    tier: 'ELITE',
  };

  return {
    player,
    auctionPrice: 35,
    adjustedValue: 52,
    valueGained: 17,
    ...overrides,
  };
};

describe('StealCard', () => {
  it('renders player name', () => {
    const steal = createMockSteal();
    render(<StealCard steal={steal} />);
    expect(screen.getByText('Mike Trout')).toBeInTheDocument();
  });

  it('renders player position', () => {
    const steal = createMockSteal();
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/OF/)).toBeInTheDocument();
  });

  it('displays auction price', () => {
    const steal = createMockSteal({ auctionPrice: 35 });
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/\$35/)).toBeInTheDocument();
  });

  it('displays adjusted value', () => {
    const steal = createMockSteal({ adjustedValue: 52 });
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/\$52/)).toBeInTheDocument();
  });

  it('displays value gained with "below value" text', () => {
    const steal = createMockSteal({ valueGained: 17 });
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/\$17 below value/i)).toBeInTheDocument();
  });

  it('uses emerald/green background highlight', () => {
    const steal = createMockSteal();
    const { container } = render(<StealCard steal={steal} />);
    // Check for emerald background class
    expect(container.innerHTML).toMatch(/bg-emerald|emerald/i);
  });

  it('renders with small value gained', () => {
    const player: DraftedPlayer = {
      playerId: 'p2',
      playerName: 'Budget Player',
      position: '1B',
      purchasePrice: 3,
      projectedValue: 5,
      variance: -2,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
    };
    const steal: Steal = {
      player,
      auctionPrice: 3,
      adjustedValue: 6,
      valueGained: 3,
    };
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/\$3 below value/i)).toBeInTheDocument();
  });

  it('renders with large value gained', () => {
    const player: DraftedPlayer = {
      playerId: 'p3',
      playerName: 'Star Player',
      position: 'SS',
      purchasePrice: 40,
      projectedValue: 65,
      variance: -25,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
      tier: 'ELITE',
    };
    const steal: Steal = {
      player,
      auctionPrice: 40,
      adjustedValue: 75,
      valueGained: 35,
    };
    render(<StealCard steal={steal} />);
    expect(screen.getByText(/\$35 below value/i)).toBeInTheDocument();
  });

  it('applies consistent card styling', () => {
    const steal = createMockSteal();
    const { container } = render(<StealCard steal={steal} />);
    const card = container.firstChild as HTMLElement;
    // Should have rounded corners and padding
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('p-4');
  });
});

describe('StealCard accessibility', () => {
  it('has proper semantic structure', () => {
    const steal = createMockSteal();
    const { container } = render(<StealCard steal={steal} />);
    // Should use article or div with proper structure
    expect(container.querySelector('article, div')).toBeInTheDocument();
  });

  it('value gained is visually prominent', () => {
    const steal = createMockSteal();
    const { container } = render(<StealCard steal={steal} />);
    // Check for font-bold or text-lg classes on value gained
    expect(container.innerHTML).toMatch(/font-(bold|semibold)|text-(lg|xl)/);
  });
});
