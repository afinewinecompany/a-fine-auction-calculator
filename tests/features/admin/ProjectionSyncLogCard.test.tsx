/**
 * ProjectionSyncLogCard Component Tests
 *
 * Tests for the projection sync log card display component.
 *
 * Story: 13.6 - View Projection Sync Logs
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectionSyncLogCard } from '@/features/admin/components/ProjectionSyncLogCard';
import type { ProjectionSyncLog } from '@/features/admin/types/admin.types';

describe('ProjectionSyncLogCard', () => {
  const mockSuccessLog: ProjectionSyncLog = {
    id: 'log-1',
    syncType: 'fangraphs',
    status: 'success',
    playersUpdated: 500,
    errorMessage: null,
    startedAt: '2025-12-23T10:00:00Z',
    completedAt: '2025-12-23T10:01:00Z',
  };

  const mockFailureLog: ProjectionSyncLog = {
    id: 'log-2',
    syncType: 'google_sheets',
    status: 'failure',
    playersUpdated: null,
    errorMessage: 'Authentication failed: Invalid token',
    startedAt: '2025-12-23T09:00:00Z',
    completedAt: '2025-12-23T09:00:30Z',
  };

  describe('Basic Rendering', () => {
    it('should render the card', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('sync-log-card')).toBeInTheDocument();
    });

    it('should display timestamp', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('timestamp')).toBeInTheDocument();
    });
  });

  describe('Success Status', () => {
    it('should display success status text', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('status-text')).toHaveTextContent('Success');
    });

    it('should show success icon', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('status-icon-success')).toBeInTheDocument();
    });

    it('should have green styling for success status', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveClass('text-emerald-400');
    });

    it('should display player count for successful sync', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('player-count')).toHaveTextContent('500 players updated');
    });

    it('should not display error message for successful sync', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Failure Status', () => {
    it('should display failure status text', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      expect(screen.getByTestId('status-text')).toHaveTextContent('Failed');
    });

    it('should show failure icon', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      expect(screen.getByTestId('status-icon-failure')).toBeInTheDocument();
    });

    it('should have red styling for failure status', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveClass('text-red-400');
    });

    it('should display error message for failed sync', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Authentication failed: Invalid token'
      );
    });

    it('should not display player count for failed sync', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      expect(screen.queryByTestId('player-count')).not.toBeInTheDocument();
    });

    it('should have red border styling for failure', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      const card = screen.getByTestId('sync-log-card');
      expect(card).toHaveClass('border-red-800/50');
    });
  });

  describe('Sync Type Display', () => {
    it('should display Fangraphs label', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      expect(screen.getByTestId('sync-type')).toHaveTextContent('Fangraphs');
    });

    it('should display Google Sheets label', () => {
      render(<ProjectionSyncLogCard log={mockFailureLog} />);

      expect(screen.getByTestId('sync-type')).toHaveTextContent('Google Sheets');
    });
  });

  describe('Player Count Formatting', () => {
    it('should format large player counts with locale formatting', () => {
      const logWithLargeCount: ProjectionSyncLog = {
        ...mockSuccessLog,
        playersUpdated: 1500,
      };
      render(<ProjectionSyncLogCard log={logWithLargeCount} />);

      // Should use toLocaleString formatting (1,500)
      expect(screen.getByTestId('player-count')).toHaveTextContent('1,500 players updated');
    });

    it('should handle null playersUpdated gracefully', () => {
      const logWithNullCount: ProjectionSyncLog = {
        ...mockSuccessLog,
        playersUpdated: null,
      };
      render(<ProjectionSyncLogCard log={logWithNullCount} />);

      // Should not display player count section when null
      expect(screen.queryByTestId('player-count')).not.toBeInTheDocument();
    });

    it('should handle zero player count', () => {
      const logWithZeroCount: ProjectionSyncLog = {
        ...mockSuccessLog,
        playersUpdated: 0,
      };
      render(<ProjectionSyncLogCard log={logWithZeroCount} />);

      // Should display 0 players
      expect(screen.getByTestId('player-count')).toHaveTextContent('0 players updated');
    });
  });

  describe('Accessibility', () => {
    it('should have status icon with aria-hidden', () => {
      render(<ProjectionSyncLogCard log={mockSuccessLog} />);

      const icon = screen.getByTestId('status-icon-success');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
