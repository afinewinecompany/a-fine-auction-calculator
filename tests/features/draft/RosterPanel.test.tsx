/**
 * Tests for RosterPanel Component
 *
 * Story: 7.1 - Create RosterPanel Component Foundation
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RosterPanel } from '@/features/draft/components/RosterPanel';
import type { RosterPanelProps } from '@/features/draft/types/roster.types';

const defaultProps: RosterPanelProps = {
  budget: { total: 260, spent: 75, remaining: 185 },
  roster: { hitters: [], pitchers: [], bench: [] },
  leagueSettings: { teamCount: 12, rosterSpotsHitters: 10, rosterSpotsPitchers: 9, rosterSpotsBench: 4 },
};

describe('RosterPanel', () => {
  describe('desktop layout', () => {
    it('should render desktop panel', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getByTestId('roster-panel-desktop')).toBeInTheDocument();
    });

    it('should render Draft Tracker title', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getByText('Draft Tracker')).toBeInTheDocument();
    });

    it('should have dark slate background', () => {
      render(<RosterPanel {...defaultProps} />);
      const desktopPanel = screen.getByTestId('roster-panel-desktop');
      expect(desktopPanel).toHaveClass('bg-slate-900');
    });
  });

  describe('mobile layout', () => {
    it('should render mobile panel', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getByTestId('roster-panel-mobile')).toBeInTheDocument();
    });

    it('should have expand/collapse button', () => {
      render(<RosterPanel {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand when button is clicked', () => {
      render(<RosterPanel {...defaultProps} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('section headers', () => {
    it('should render Budget Summary header', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getAllByText('Budget Summary')).toHaveLength(2);
    });

    it('should render Roster Composition header', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getAllByText('Roster Composition')).toHaveLength(2);
    });

    it('should render Position Needs header', () => {
      render(<RosterPanel {...defaultProps} />);
      expect(screen.getAllByText('Position Needs')).toHaveLength(2);
    });

    it('should apply emerald-400 color to section headers', () => {
      render(<RosterPanel {...defaultProps} />);
      const headers = screen.getAllByText('Budget Summary');
      headers.forEach(header => {
        expect(header).toHaveClass('text-emerald-400');
      });
    });
  });

  describe('budget display integration', () => {
    it('should display remaining budget', () => {
      render(<RosterPanel {...defaultProps} />);
      const budgetDisplays = screen.getAllByTestId('budget-display');
      expect(budgetDisplays.length).toBeGreaterThan(0);
    });
  });

  describe('accessibility', () => {
    it('should have aria-controls on mobile toggle button', () => {
      render(<RosterPanel {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'mobile-roster-content');
    });
  });
});