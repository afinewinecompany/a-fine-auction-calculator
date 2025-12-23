/**
 * useIncidentLogs Hook Tests
 *
 * Tests for the incident logs monitoring hook with polling and filtering.
 *
 * Story: 13.9 - View Detailed Incident Logs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock Supabase
const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase', () => ({
  getSupabase: () => ({
    from: mockFrom,
  }),
}));

// Mock database response data
const mockIncidentsData = [
  {
    id: 'incident-1',
    incident_type: 'api_failure',
    severity: 'critical',
    title: 'API Down',
    description: 'The API was down for 30 minutes.',
    affected_users_count: 150,
    recovery_actions: ['Restarted server'],
    occurred_at: '2025-12-23T10:00:00Z',
    resolved_at: '2025-12-23T10:30:00Z',
    resolution_time_minutes: 30,
  },
  {
    id: 'incident-2',
    incident_type: 'draft_error',
    severity: 'high',
    title: 'Draft Failures',
    description: 'Multiple drafts failed.',
    affected_users_count: 25,
    recovery_actions: null,
    occurred_at: '2025-12-23T09:00:00Z',
    resolved_at: null,
    resolution_time_minutes: null,
  },
  {
    id: 'incident-3',
    incident_type: 'sync_failure',
    severity: 'medium',
    title: 'Sync Delayed',
    description: 'Sync was delayed.',
    affected_users_count: 0,
    recovery_actions: ['Rescheduled'],
    occurred_at: '2025-12-22T06:00:00Z',
    resolved_at: '2025-12-22T06:35:00Z',
    resolution_time_minutes: 35,
  },
  {
    id: 'incident-4',
    incident_type: 'system_error',
    severity: 'low',
    title: 'Cache Issue',
    description: 'Cache warmer issue.',
    affected_users_count: 0,
    recovery_actions: [],
    occurred_at: '2025-12-21T12:00:00Z',
    resolved_at: '2025-12-21T12:05:00Z',
    resolution_time_minutes: 5,
  },
];

// Import after mocking
import { useIncidentLogs } from '@/features/admin/hooks/useIncidentLogs';

function setupMockChain(data: unknown, error: unknown = null) {
  mockOrder.mockReturnValue({ data, error });
  mockGte.mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ gte: mockGte });
  mockFrom.mockReturnValue({ select: mockSelect });
}

describe('useIncidentLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockChain(mockIncidentsData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial loading state', () => {
      const { result } = renderHook(() => useIncidentLogs());

      expect(result.current.loading).toBe(true);
      expect(result.current.incidents).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch incidents on mount', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(4);
      expect(mockFrom).toHaveBeenCalledWith('incident_logs');
    });

    it('should map database fields to camelCase correctly', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstIncident = result.current.incidents[0];
      expect(firstIncident.id).toBe('incident-1');
      expect(firstIncident.incidentType).toBe('api_failure');
      expect(firstIncident.severity).toBe('critical');
      expect(firstIncident.title).toBe('API Down');
      expect(firstIncident.description).toBe('The API was down for 30 minutes.');
      expect(firstIncident.affectedUsersCount).toBe(150);
      expect(firstIncident.recoveryActions).toEqual(['Restarted server']);
      expect(firstIncident.occurredAt).toBe('2025-12-23T10:00:00Z');
      expect(firstIncident.resolvedAt).toBe('2025-12-23T10:30:00Z');
      expect(firstIncident.resolutionTimeMinutes).toBe(30);
    });

    it('should handle null recovery_actions gracefully', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const incidentWithNullActions = result.current.incidents.find(
        i => i.id === 'incident-2'
      );
      expect(incidentWithNullActions?.recoveryActions).toEqual([]);
    });

    it('should set error on fetch failure', async () => {
      setupMockChain(null, { message: 'Database error' });

      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.incidents).toEqual([]);
    });

    it('should handle empty data response', async () => {
      setupMockChain([]);

      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toEqual([]);
    });

    it('should handle null data response', async () => {
      setupMockChain(null);

      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toEqual([]);
    });
  });

  describe('Summary Calculation', () => {
    it('should calculate totalIncidents correctly', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.summary.totalIncidents).toBe(4);
    });

    it('should calculate avgResolutionTimeMinutes correctly', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // (30 + 35 + 5) / 3 = 23.33... ≈ 23
      expect(result.current.summary.avgResolutionTimeMinutes).toBe(23);
    });

    it('should calculate bySeverity breakdown correctly', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.summary.bySeverity.critical).toBe(1);
      expect(result.current.summary.bySeverity.high).toBe(1);
      expect(result.current.summary.bySeverity.medium).toBe(1);
      expect(result.current.summary.bySeverity.low).toBe(1);
    });

    it('should calculate byType breakdown correctly', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.summary.byType.api_failure).toBe(1);
      expect(result.current.summary.byType.draft_error).toBe(1);
      expect(result.current.summary.byType.sync_failure).toBe(1);
      expect(result.current.summary.byType.system_error).toBe(1);
    });

    it('should return zero avgResolutionTime when no resolved incidents', async () => {
      const unresolvedData = [
        {
          ...mockIncidentsData[1],
          id: 'unresolved-1',
        },
      ];
      setupMockChain(unresolvedData);

      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.summary.avgResolutionTimeMinutes).toBe(0);
    });

    it('should return empty summary when no incidents', async () => {
      setupMockChain([]);

      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.summary.totalIncidents).toBe(0);
      expect(result.current.summary.avgResolutionTimeMinutes).toBe(0);
      expect(result.current.summary.bySeverity.critical).toBe(0);
      expect(result.current.summary.byType.api_failure).toBe(0);
    });
  });

  describe('Filtering', () => {
    it('should filter by incident type', async () => {
      const { result } = renderHook(() =>
        useIncidentLogs({ typeFilter: 'api_failure' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(1);
      expect(result.current.incidents[0].incidentType).toBe('api_failure');
    });

    it('should filter by severity', async () => {
      const { result } = renderHook(() =>
        useIncidentLogs({ severityFilter: 'critical' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(1);
      expect(result.current.incidents[0].severity).toBe('critical');
    });

    it('should apply both type and severity filters', async () => {
      const { result } = renderHook(() =>
        useIncidentLogs({ typeFilter: 'api_failure', severityFilter: 'critical' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(1);
      expect(result.current.incidents[0].incidentType).toBe('api_failure');
      expect(result.current.incidents[0].severity).toBe('critical');
    });

    it('should return empty array when no incidents match filters', async () => {
      const { result } = renderHook(() =>
        useIncidentLogs({ typeFilter: 'api_failure', severityFilter: 'low' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(0);
    });

    it('should not affect summary when filters are applied', async () => {
      const { result } = renderHook(() =>
        useIncidentLogs({ typeFilter: 'api_failure' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Summary should still reflect all incidents
      expect(result.current.summary.totalIncidents).toBe(4);
    });

    it('should return all incidents when no filters applied', async () => {
      const { result } = renderHook(() => useIncidentLogs({}));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.incidents).toHaveLength(4);
    });
  });

  describe('Refetch', () => {
    it('should allow manual refetch', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFrom).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFrom).toHaveBeenCalledTimes(2);
    });
  });

  describe('Return Types', () => {
    it('should return correct hook result types', async () => {
      const { result } = renderHook(() => useIncidentLogs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
      expect(Array.isArray(result.current.incidents)).toBe(true);
      expect(typeof result.current.loading).toBe('boolean');
      expect(typeof result.current.summary).toBe('object');
      expect(typeof result.current.summary.totalIncidents).toBe('number');
      expect(typeof result.current.summary.avgResolutionTimeMinutes).toBe('number');
    });
  });
});
