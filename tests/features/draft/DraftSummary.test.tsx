/**
 * DraftSummary Component Tests
 *
 * Tests for the main DraftSummary component that displays post-draft analytics.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 */

import { render, screen } from '@testing-library/react';
import { DraftSummary } from '@/features/draft/components/DraftSummary';
import type { DraftedPlayer } from '@/features/draft';
import type { InflationState } from '@/features/inflation';
import type { PlayerProjection } from '@/features/projections';

describe('DraftSummary', () => {
  const mockRoster: DraftedPlayer[] = [
    {
      playerId: '1',
      playerName: 'Mike Trout',
      position: 'OF',
      purchasePrice: 35,
      projectedValue: 45,
      variance: -10,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
    },
    {
      playerId: '2',
      playerName: 'Aaron Judge',
      position: 'OF',
      purchasePrice: 50,
      projectedValue: 48,
      variance: 2,
      draftedBy: 'user',
      draftedAt: new Date().toISOString(),
    },
  ];

  const mockBudget = {
    initial: 260,
    remaining: 50,
    spent: 210,
  };

  const mockProjections: PlayerProjection[] = [
    {
      id: '1',
      leagueId: 'league-1',
      playerName: 'Mike Trout',
      team: 'LAA',
      positions: ['OF'],
      projectedValue: 45,
      projectionSource: 'fangraphs',
      statsHitters: { hr: 35, rbi: 90 },
      statsPitchers: null,
      tier: 'ELITE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockInflationData: InflationState = {
    overallRate: 0.15,
    positionRates: {
      C: 0.1,
      '1B': 0.12,
      '2B': 0.08,
      SS: 0.2,
      '3B': 0.15,
      OF: 0.1,
      SP: 0.18,
      RP: 0.05,
      UT: 0.1,
    },
    tierRates: {
      ELITE: 0.25,
      MID: 0.1,
      LOWER: 0.05,
    },
    budgetDepleted: 0.8,
    playersRemaining: 50,
  };

  const defaultProps = {
    roster: mockRoster,
    budget: mockBudget,
    projections: mockProjections,
    inflationData: mockInflationData,
  };

  describe('Rendering', () => {
    it('renders the main heading', () => {
      render(<DraftSummary {...defaultProps} />);
      expect(screen.getByText('Draft Summary')).toBeInTheDocument();
    });

    it('renders all three section components', () => {
      render(<DraftSummary {...defaultProps} />);
      expect(screen.getByText('Roster Overview')).toBeInTheDocument();
      expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
      expect(screen.getByText('Value Analysis')).toBeInTheDocument();
    });

    it('renders with empty roster', () => {
      render(<DraftSummary {...defaultProps} roster={[]} />);
      expect(screen.getByText('Draft Summary')).toBeInTheDocument();
      expect(screen.getByText('Roster Overview')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('passes roster to RosterOverview', () => {
      render(<DraftSummary {...defaultProps} />);
      // RosterOverview shows player names in grouped sections
      // Player names may appear in multiple sections (RosterOverview + ValueAnalysis)
      expect(screen.getAllByText('Mike Trout').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Aaron Judge').length).toBeGreaterThanOrEqual(1);
      // Both are hitters, so they appear in the Hitters section
      expect(screen.getByText('2 players')).toBeInTheDocument();
    });

    it('passes budget to BudgetUtilization', () => {
      render(<DraftSummary {...defaultProps} />);
      // BudgetUtilization shows spent amount (check for the section heading)
      expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
    });

    it('passes projections and inflationData to ValueAnalysis', () => {
      render(<DraftSummary {...defaultProps} />);
      // ValueAnalysis shows overall inflation
      expect(screen.getByText(/15\.0%/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('has dark slate background (bg-slate-950)', () => {
      const { container } = render(<DraftSummary {...defaultProps} />);
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('bg-slate-950');
    });

    it('uses white text for heading', () => {
      render(<DraftSummary {...defaultProps} />);
      const heading = screen.getByRole('heading', { name: 'Draft Summary' });
      expect(heading).toHaveClass('text-white');
    });

    it('has proper spacing between sections', () => {
      const { container } = render(<DraftSummary {...defaultProps} />);
      // Check for flex/gap or space-y class
      const sectionsContainer = container.querySelector('.space-y-6, .gap-6');
      expect(sectionsContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('uses responsive padding classes', () => {
      const { container } = render(<DraftSummary {...defaultProps} />);
      const mainContainer = container.firstChild as HTMLElement;
      // Should have responsive padding (p-4 md:p-6 or similar)
      expect(mainContainer.className).toMatch(/p-\d|px-\d|py-\d/);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<DraftSummary {...defaultProps} />);
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Draft Summary');
    });

    it('sections have semantic structure', () => {
      const { container } = render(<DraftSummary {...defaultProps} />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });
  });
});
