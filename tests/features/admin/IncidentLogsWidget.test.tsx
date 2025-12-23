/**
 * IncidentLogsWidget Component Tests
 *
 * Tests for the incident logs widget with filtering and summary stats.
 *
 * Story: 13.9 - View Detailed Incident Logs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the hook
const mockRefetch = vi.fn();
vi.mock('@/features/admin/hooks/useIncidentLogs', () => ({
  useIncidentLogs: vi.fn(),
}));

import { useIncidentLogs } from '@/features/admin/hooks/useIncidentLogs';
import { IncidentLogsWidget } from '@/features/admin/components/IncidentLogsWidget';
import type { IncidentLog, IncidentLogsSummary } from '@/features/admin/types/admin.types';

const mockIncidents: IncidentLog[] = [
  {
    id: 'incident-1',
    incidentType: 'api_failure',
    severity: 'critical',
    title: 'API Down',
    description: 'The API was down.',
    affectedUsersCount: 150,
    recoveryActions: ['Restarted server'],
    occurredAt: '2025-12-23T10:00:00Z',
    resolvedAt: '2025-12-23T10:30:00Z',
    resolutionTimeMinutes: 30,
  },
  {
    id: 'incident-2',
    incidentType: 'draft_error',
    severity: 'high',
    title: 'Draft Failures',
    description: 'Multiple drafts failed.',
    affectedUsersCount: 25,
    recoveryActions: [],
    occurredAt: '2025-12-23T09:00:00Z',
    resolvedAt: null,
    resolutionTimeMinutes: null,
  },
  {
    id: 'incident-3',
    incidentType: 'sync_failure',
    severity: 'medium',
    title: 'Sync Delayed',
    description: 'Sync was delayed.',
    affectedUsersCount: 0,
    recoveryActions: ['Rescheduled'],
    occurredAt: '2025-12-22T06:00:00Z',
    resolvedAt: '2025-12-22T06:35:00Z',
    resolutionTimeMinutes: 35,
  },
];

const mockSummary: IncidentLogsSummary = {
  totalIncidents: 3,
  avgResolutionTimeMinutes: 33,
  bySeverity: {
    critical: 1,
    high: 1,
    medium: 1,
    low: 0,
  },
  byType: {
    api_failure: 1,
    draft_error: 1,
    sync_failure: 1,
    system_error: 0,
  },
};

function mockHookReturn(overrides: Partial<ReturnType<typeof useIncidentLogs>> = {}) {
  const defaults = {
    incidents: mockIncidents,
    loading: false,
    error: null,
    summary: mockSummary,
    refetch: mockRefetch,
  };
  (useIncidentLogs as ReturnType<typeof vi.fn>).mockReturnValue({
    ...defaults,
    ...overrides,
  });
}

describe('IncidentLogsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookReturn();
  });

  describe('Basic Rendering', () => {
    it('should render the widget', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('incident-logs-widget')).toBeInTheDocument();
    });

    it('should display Incident Logs title', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByText('Incident Logs')).toBeInTheDocument();
    });

    it('should display refresh button', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });
  });

  describe('Summary Stats', () => {
    it('should display total incidents count', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('total-incidents')).toHaveTextContent('3');
    });

    it('should display average resolution time', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('avg-resolution-time')).toHaveTextContent('33m');
    });

    it('should display critical/high count', () => {
      render(<IncidentLogsWidget />);

      // critical (1) + high (1) = 2
      expect(screen.getByTestId('critical-high-count')).toHaveTextContent('2');
    });

    it('should display medium/low count', () => {
      render(<IncidentLogsWidget />);

      // medium (1) + low (0) = 1
      expect(screen.getByTestId('medium-low-count')).toHaveTextContent('1');
    });
  });

  describe('Loading State', () => {
    it('should display loading skeleton when loading', () => {
      mockHookReturn({ loading: true, incidents: [] });

      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should not display incidents list when loading', () => {
      mockHookReturn({ loading: true, incidents: [] });

      render(<IncidentLogsWidget />);

      expect(screen.queryByTestId('incidents-list')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no incidents', () => {
      mockHookReturn({
        incidents: [],
        summary: {
          totalIncidents: 0,
          avgResolutionTimeMinutes: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          byType: { api_failure: 0, draft_error: 0, sync_failure: 0, system_error: 0 },
        },
      });

      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No incidents in the last 30 days')).toBeInTheDocument();
    });

    it('should display filter-specific empty state when filters applied', async () => {
      // First render with all incidents
      const { rerender } = render(<IncidentLogsWidget />);

      // Select a filter that has no matches
      mockHookReturn({
        incidents: [],
        summary: mockSummary, // Summary stays the same (unfiltered)
      });

      // Simulate filter change by triggering the select
      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'system_error' } });

      rerender(<IncidentLogsWidget />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No incidents match your filters')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      mockHookReturn({ error: 'Failed to fetch incidents' });

      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('widget-error-message')).toHaveTextContent(
        'Failed to fetch incidents'
      );
    });
  });

  describe('Incidents List', () => {
    it('should display incidents list', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('incidents-list')).toBeInTheDocument();
    });

    it('should display all incident cards', () => {
      render(<IncidentLogsWidget />);

      const cards = screen.getAllByTestId('incident-log-card');
      expect(cards).toHaveLength(3);
    });
  });

  describe('Filtering', () => {
    it('should display type filter dropdown', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('type-filter')).toBeInTheDocument();
    });

    it('should display severity filter dropdown', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('severity-filter')).toBeInTheDocument();
    });

    it('should have "All Types" as default type filter value', () => {
      render(<IncidentLogsWidget />);

      const typeFilter = screen.getByTestId('type-filter') as HTMLSelectElement;
      expect(typeFilter.value).toBe('all');
    });

    it('should have "All Severities" as default severity filter value', () => {
      render(<IncidentLogsWidget />);

      const severityFilter = screen.getByTestId('severity-filter') as HTMLSelectElement;
      expect(severityFilter.value).toBe('all');
    });

    it('should call hook with typeFilter when type filter changes', () => {
      render(<IncidentLogsWidget />);

      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'api_failure' } });

      expect(useIncidentLogs).toHaveBeenCalledWith(
        expect.objectContaining({ typeFilter: 'api_failure' })
      );
    });

    it('should call hook with severityFilter when severity filter changes', () => {
      render(<IncidentLogsWidget />);

      const severityFilter = screen.getByTestId('severity-filter');
      fireEvent.change(severityFilter, { target: { value: 'critical' } });

      expect(useIncidentLogs).toHaveBeenCalledWith(
        expect.objectContaining({ severityFilter: 'critical' })
      );
    });

    it('should show clear filters button when filters are applied', () => {
      render(<IncidentLogsWidget />);

      // Initially no clear button
      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument();

      // Apply filter
      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'api_failure' } });

      // Clear button should appear
      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    it('should clear filters when clear button is clicked', () => {
      render(<IncidentLogsWidget />);

      // Apply filter
      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'api_failure' } });

      // Click clear
      fireEvent.click(screen.getByTestId('clear-filters-button'));

      // Verify filters are reset
      expect((typeFilter as HTMLSelectElement).value).toBe('all');
    });
  });

  describe('Critical Incidents Badge', () => {
    it('should display critical badge when critical incidents exist', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('critical-badge')).toHaveTextContent('1 critical');
    });

    it('should not display critical badge when no critical incidents', () => {
      mockHookReturn({
        summary: {
          ...mockSummary,
          bySeverity: { ...mockSummary.bySeverity, critical: 0 },
        },
      });

      render(<IncidentLogsWidget />);

      expect(screen.queryByTestId('critical-badge')).not.toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should display red status when critical incidents exist', () => {
      render(<IncidentLogsWidget />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('should display green status when no critical incidents', () => {
      mockHookReturn({
        summary: {
          ...mockSummary,
          bySeverity: { ...mockSummary.bySeverity, critical: 0 },
        },
      });

      render(<IncidentLogsWidget />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should display correct status text', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('widget-status-text')).toHaveTextContent(
        'Critical incidents'
      );
    });

    it('should display "No critical incidents" when none exist', () => {
      mockHookReturn({
        summary: {
          ...mockSummary,
          bySeverity: { ...mockSummary.bySeverity, critical: 0 },
        },
      });

      render(<IncidentLogsWidget />);

      expect(screen.getByTestId('widget-status-text')).toHaveTextContent(
        'No critical incidents'
      );
    });
  });

  describe('Refresh Functionality', () => {
    it('should call refetch when refresh button is clicked', () => {
      render(<IncidentLogsWidget />);

      fireEvent.click(screen.getByTestId('refresh-button'));

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer', () => {
    it('should display incident count in footer', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByText(/Showing 3/)).toBeInTheDocument();
      expect(screen.getByText(/of 3 incidents/)).toBeInTheDocument();
    });

    it('should display auto-refresh information', () => {
      render(<IncidentLogsWidget />);

      expect(screen.getByText('Auto-refreshes every 2 minutes')).toBeInTheDocument();
    });

    it('should show "filtered" in count when filters applied', async () => {
      render(<IncidentLogsWidget />);

      // Apply filter
      const typeFilter = screen.getByTestId('type-filter');
      fireEvent.change(typeFilter, { target: { value: 'api_failure' } });

      expect(screen.getByText(/filtered/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible refresh button', () => {
      render(<IncidentLogsWidget />);

      const button = screen.getByTestId('refresh-button');
      expect(button).toHaveAttribute('aria-label', 'Refresh incident logs');
    });

    it('should have accessible type filter', () => {
      render(<IncidentLogsWidget />);

      const filter = screen.getByTestId('type-filter');
      expect(filter).toHaveAttribute('aria-label', 'Filter by incident type');
    });

    it('should have accessible severity filter', () => {
      render(<IncidentLogsWidget />);

      const filter = screen.getByTestId('severity-filter');
      expect(filter).toHaveAttribute('aria-label', 'Filter by severity');
    });
  });
});
