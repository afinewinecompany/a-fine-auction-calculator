/**
 * ProjectionSyncLogsWidget Component Tests
 *
 * Tests for the projection sync logs dashboard widget.
 *
 * Story: 13.6 - View Projection Sync Logs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ProjectionSyncLog } from '@/features/admin/types/admin.types';

// Mock sync logs data
const mockSyncLogs: ProjectionSyncLog[] = [
  {
    id: 'log-1',
    syncType: 'fangraphs',
    status: 'success',
    playersUpdated: 500,
    errorMessage: null,
    startedAt: '2025-12-23T10:00:00Z',
    completedAt: '2025-12-23T10:01:00Z',
  },
  {
    id: 'log-2',
    syncType: 'google_sheets',
    status: 'failure',
    playersUpdated: null,
    errorMessage: 'Authentication failed',
    startedAt: '2025-12-23T09:00:00Z',
    completedAt: '2025-12-23T09:00:30Z',
  },
  {
    id: 'log-3',
    syncType: 'fangraphs',
    status: 'success',
    playersUpdated: 450,
    errorMessage: null,
    startedAt: '2025-12-22T10:00:00Z',
    completedAt: '2025-12-22T10:01:30Z',
  },
];

// Mock hook state
let mockHookState = {
  syncLogs: mockSyncLogs,
  loading: false,
  error: null as string | null,
  successCount: 2,
  failureCount: 1,
  refetch: vi.fn(),
};

vi.mock('@/features/admin/hooks/useProjectionSyncLogs', () => ({
  useProjectionSyncLogs: () => mockHookState,
}));

// Import after mocking
import { ProjectionSyncLogsWidget } from '@/features/admin/components/ProjectionSyncLogsWidget';

describe('ProjectionSyncLogsWidget', () => {
  beforeEach(() => {
    mockHookState = {
      syncLogs: mockSyncLogs,
      loading: false,
      error: null,
      successCount: 2,
      failureCount: 1,
      refetch: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the widget', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('projection-sync-logs-widget')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByText('Projection Sync Logs')).toBeInTheDocument();
    });

    it('should display all sync log cards', () => {
      render(<ProjectionSyncLogsWidget />);

      const logCards = screen.getAllByTestId('sync-log-card');
      expect(logCards).toHaveLength(3);
    });

    it('should display polling info in footer', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByText(/Auto-refreshes every 2 minutes/)).toBeInTheDocument();
    });

    it('should display log count in footer', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByText(/Showing last 3 sync operations/)).toBeInTheDocument();
    });
  });

  describe('Summary Stats', () => {
    it('should display summary stats section', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('summary-stats')).toBeInTheDocument();
    });

    it('should display success count', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('success-count')).toHaveTextContent('2');
    });

    it('should display failure count', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('failure-count')).toHaveTextContent('1');
    });

    it('should display labels for stats', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByText('Successful')).toBeInTheDocument();
      // Use the stats container to find the "Failed" label to avoid conflicts with card status
      const statsSection = screen.getByTestId('summary-stats');
      expect(statsSection).toHaveTextContent('Failed');
    });
  });

  describe('Failure Badge', () => {
    it('should show failure badge when there are failures', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('failure-badge')).toHaveTextContent('1 failed');
    });

    it('should not show failure badge when all syncs are successful', () => {
      mockHookState.failureCount = 0;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.queryByTestId('failure-badge')).not.toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show "All syncs healthy" when no failures', () => {
      mockHookState.failureCount = 0;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('widget-status-text')).toHaveTextContent('All syncs healthy');
    });

    it('should show failure count when there are failures', () => {
      mockHookState.failureCount = 2;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('widget-status-text')).toHaveTextContent('2 sync failures');
    });

    it('should have green indicator when all healthy', () => {
      mockHookState.failureCount = 0;
      render(<ProjectionSyncLogsWidget />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should have yellow indicator when there are failures', () => {
      mockHookState.failureCount = 1;
      render(<ProjectionSyncLogsWidget />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      mockHookState.loading = true;
      mockHookState.syncLogs = [];
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should not show sync logs list when loading', () => {
      mockHookState.loading = true;
      mockHookState.syncLogs = [];
      render(<ProjectionSyncLogsWidget />);

      expect(screen.queryByTestId('sync-logs-list')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      mockHookState.error = 'Failed to fetch sync logs';
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('widget-error-message')).toHaveTextContent('Failed to fetch sync logs');
    });

    it('should not show error when no error', () => {
      mockHookState.error = null;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.queryByTestId('widget-error-message')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      mockHookState.syncLogs = [];
      mockHookState.loading = false;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No sync logs available')).toBeInTheDocument();
    });

    it('should display helper text in empty state', () => {
      mockHookState.syncLogs = [];
      mockHookState.loading = false;
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByText(/Projection syncs will appear here/)).toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('should have refresh button', () => {
      render(<ProjectionSyncLogsWidget />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call refetch on refresh click', () => {
      render(<ProjectionSyncLogsWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      expect(mockHookState.refetch).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label on refresh button', () => {
      render(<ProjectionSyncLogsWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh projection sync logs');
    });
  });

  describe('Border Styling', () => {
    it('should have red-tinted border when there are failures', () => {
      mockHookState.failureCount = 1;
      render(<ProjectionSyncLogsWidget />);

      const widget = screen.getByTestId('projection-sync-logs-widget');
      expect(widget).toHaveClass('border-red-500/50');
    });

    it('should have default border when all healthy', () => {
      mockHookState.failureCount = 0;
      render(<ProjectionSyncLogsWidget />);

      const widget = screen.getByTestId('projection-sync-logs-widget');
      expect(widget).toHaveClass('border-slate-800');
    });
  });

  describe('Scrollable List', () => {
    it('should have scrollable container for logs', () => {
      render(<ProjectionSyncLogsWidget />);

      const logsList = screen.getByTestId('sync-logs-list');
      expect(logsList).toHaveClass('overflow-y-auto');
      expect(logsList).toHaveClass('max-h-96');
    });
  });

  describe('Grid Layout', () => {
    it('should have 2-column grid for summary stats', () => {
      render(<ProjectionSyncLogsWidget />);

      const stats = screen.getByTestId('summary-stats');
      expect(stats).toHaveClass('grid-cols-2');
    });
  });
});
