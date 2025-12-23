/**
 * ProjectionInfo Component Tests
 *
 * Tests for the ProjectionInfo component that displays projection source
 * and last updated timestamp.
 *
 * Story: 4.7 - Display Projection Source and Timestamp
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectionInfo } from '@/features/projections/components/ProjectionInfo';

describe('ProjectionInfo', () => {
  beforeEach(() => {
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-17T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('when projections are loaded', () => {
    it('renders projection source with badge styling', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:00:00Z"
          playerCount={500}
        />
      );

      expect(screen.getByText('Fangraphs - Steamer')).toBeInTheDocument();
      expect(screen.getByText('Projection Source')).toBeInTheDocument();
    });

    it('displays player count', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:00:00Z"
          playerCount={1234}
        />
      );

      expect(screen.getByText('(1,234 players)')).toBeInTheDocument();
    });

    it('displays relative timestamp', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:00:00Z"
          playerCount={500}
        />
      );

      // Should show "about 2 hours ago"
      expect(screen.getByText(/ago/i)).toBeInTheDocument();
      expect(screen.getByText('Last updated:')).toBeInTheDocument();
    });

    it('shows Google Sheets source correctly', () => {
      render(
        <ProjectionInfo
          source="Google Sheets"
          updatedAt="2025-12-17T11:00:00Z"
          playerCount={300}
        />
      );

      expect(screen.getByText('Google Sheets')).toBeInTheDocument();
    });
  });

  describe('tooltip behavior', () => {
    it('renders tooltip trigger with cursor-help styling', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:30:00Z"
          playerCount={500}
        />
      );

      // Find the timestamp area with cursor-help styling (tooltip trigger)
      const timestampArea = screen.getByText(/ago/i).closest('div');
      expect(timestampArea).toBeInTheDocument();
      expect(timestampArea).toHaveClass('cursor-help');
    });

    it('renders tooltip structure with Last updated text', () => {
      // Verify the component renders the tooltip structure
      // The actual tooltip visibility is tested via integration/e2e tests
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:30:00Z"
          playerCount={500}
        />
      );

      // Verify "Last updated:" text exists (part of tooltip trigger)
      expect(screen.getByText('Last updated:')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty state when source is null', () => {
      render(
        <ProjectionInfo source={null} updatedAt={null} playerCount={0} />
      );

      expect(
        screen.getByText(/no projections loaded/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/import projections to get started/i)
      ).toBeInTheDocument();
    });

    it('does not show projection source in empty state', () => {
      render(
        <ProjectionInfo source={null} updatedAt={null} playerCount={0} />
      );

      expect(screen.queryByText('Projection Source')).not.toBeInTheDocument();
    });
  });

  describe('stale data indicator', () => {
    it('shows warning for projections older than 24 hours', () => {
      // Set updatedAt to 25 hours ago
      const staleDate = new Date('2025-12-16T10:00:00Z').toISOString();

      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt={staleDate}
          playerCount={500}
        />
      );

      expect(
        screen.getByText(/projections are more than 24 hours old/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/consider refreshing/i)).toBeInTheDocument();
    });

    it('does not show warning for fresh projections', () => {
      // Set updatedAt to 2 hours ago
      const freshDate = new Date('2025-12-17T10:00:00Z').toISOString();

      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt={freshDate}
          playerCount={500}
        />
      );

      expect(
        screen.queryByText(/projections are more than 24 hours old/i)
      ).not.toBeInTheDocument();
    });

    it('applies yellow styling to stale timestamps', () => {
      const staleDate = new Date('2025-12-16T10:00:00Z').toISOString();

      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt={staleDate}
          playerCount={500}
        />
      );

      // Find the timestamp text and check for yellow styling
      const timestampText = screen.getByText(/ago/i);
      expect(timestampText).toHaveClass('text-yellow-400');
    });
  });

  describe('timestamp handling', () => {
    it('handles null timestamp gracefully', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt={null}
          playerCount={500}
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('handles undefined timestamp gracefully', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt={undefined as unknown as string | null}
          playerCount={500}
        />
      );

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('uses dark theme styling (slate background)', () => {
      const { container } = render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:00:00Z"
          playerCount={500}
        />
      );

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('bg-slate-800');
    });

    it('uses emerald accent for source badge', () => {
      render(
        <ProjectionInfo
          source="Fangraphs - Steamer"
          updatedAt="2025-12-17T10:00:00Z"
          playerCount={500}
        />
      );

      const badge = screen.getByText('Fangraphs - Steamer');
      expect(badge).toHaveClass('bg-emerald-900/30');
    });
  });
});
