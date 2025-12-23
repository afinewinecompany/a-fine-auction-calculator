/**
 * IncidentLogCard Component Tests
 *
 * Tests for the incident log card display component.
 *
 * Story: 13.9 - View Detailed Incident Logs
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidentLogCard } from '@/features/admin/components/IncidentLogCard';
import type { IncidentLog } from '@/features/admin/types/admin.types';

describe('IncidentLogCard', () => {
  const mockCriticalIncident: IncidentLog = {
    id: 'incident-1',
    incidentType: 'api_failure',
    severity: 'critical',
    title: 'Couch Managers API Down',
    description: 'The Couch Managers API returned 503 errors for all requests.',
    affectedUsersCount: 150,
    recoveryActions: ['Restarted API server', 'Cleared cache', 'Notified users'],
    occurredAt: '2025-12-23T10:00:00Z',
    resolvedAt: '2025-12-23T10:30:00Z',
    resolutionTimeMinutes: 30,
  };

  const mockHighIncident: IncidentLog = {
    id: 'incident-2',
    incidentType: 'draft_error',
    severity: 'high',
    title: 'Draft Sync Failures',
    description: 'Multiple drafts failed to sync with external system.',
    affectedUsersCount: 25,
    recoveryActions: [],
    occurredAt: '2025-12-23T09:00:00Z',
    resolvedAt: null,
    resolutionTimeMinutes: null,
  };

  const mockMediumIncident: IncidentLog = {
    id: 'incident-3',
    incidentType: 'sync_failure',
    severity: 'medium',
    title: 'Projection Sync Delayed',
    description: 'Daily projection sync was delayed by 30 minutes.',
    affectedUsersCount: 0,
    recoveryActions: ['Rescheduled sync job'],
    occurredAt: '2025-12-22T06:00:00Z',
    resolvedAt: '2025-12-22T06:35:00Z',
    resolutionTimeMinutes: 35,
  };

  const mockLowIncident: IncidentLog = {
    id: 'incident-4',
    incidentType: 'system_error',
    severity: 'low',
    title: 'Minor Cache Miss',
    description: 'Cache warmer experienced temporary issues.',
    affectedUsersCount: 0,
    recoveryActions: [],
    occurredAt: '2025-12-21T12:00:00Z',
    resolvedAt: '2025-12-21T12:05:00Z',
    resolutionTimeMinutes: 5,
  };

  describe('Basic Rendering', () => {
    it('should render the card', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('incident-log-card')).toBeInTheDocument();
    });

    it('should display the incident title', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('incident-title')).toHaveTextContent(
        'Couch Managers API Down'
      );
    });

    it('should display timestamp', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('timestamp')).toBeInTheDocument();
    });
  });

  describe('Severity Badge Display', () => {
    it('should display critical severity badge with red styling', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      const badge = screen.getByTestId('severity-badge');
      expect(badge).toHaveTextContent('critical');
      expect(badge).toHaveClass('text-red-400');
    });

    it('should display high severity badge with orange styling', () => {
      render(<IncidentLogCard incident={mockHighIncident} />);

      const badge = screen.getByTestId('severity-badge');
      expect(badge).toHaveTextContent('high');
      expect(badge).toHaveClass('text-orange-400');
    });

    it('should display medium severity badge with yellow styling', () => {
      render(<IncidentLogCard incident={mockMediumIncident} />);

      const badge = screen.getByTestId('severity-badge');
      expect(badge).toHaveTextContent('medium');
      expect(badge).toHaveClass('text-yellow-400');
    });

    it('should display low severity badge with blue styling', () => {
      render(<IncidentLogCard incident={mockLowIncident} />);

      const badge = screen.getByTestId('severity-badge');
      expect(badge).toHaveTextContent('low');
      expect(badge).toHaveClass('text-blue-400');
    });
  });

  describe('Resolution Status', () => {
    it('should display resolved badge for resolved incidents', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('resolved-badge')).toHaveTextContent('Resolved');
      expect(screen.queryByTestId('unresolved-badge')).not.toBeInTheDocument();
    });

    it('should display active badge for unresolved incidents', () => {
      render(<IncidentLogCard incident={mockHighIncident} />);

      expect(screen.getByTestId('unresolved-badge')).toHaveTextContent('Active');
      expect(screen.queryByTestId('resolved-badge')).not.toBeInTheDocument();
    });

    it('should display resolution time for resolved incidents', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('resolution-time')).toHaveTextContent('30m');
    });

    it('should format resolution time in hours and minutes when over 60 minutes', () => {
      const longIncident: IncidentLog = {
        ...mockCriticalIncident,
        resolutionTimeMinutes: 90,
      };
      render(<IncidentLogCard incident={longIncident} />);

      expect(screen.getByTestId('resolution-time')).toHaveTextContent('1h 30m');
    });

    it('should format resolution time in hours only when exact hour', () => {
      const exactHourIncident: IncidentLog = {
        ...mockCriticalIncident,
        resolutionTimeMinutes: 120,
      };
      render(<IncidentLogCard incident={exactHourIncident} />);

      expect(screen.getByTestId('resolution-time')).toHaveTextContent('2h');
    });
  });

  describe('Incident Type Display', () => {
    it('should display API Failure label', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('incident-type')).toHaveTextContent('API Failure');
    });

    it('should display Draft Error label', () => {
      render(<IncidentLogCard incident={mockHighIncident} />);

      expect(screen.getByTestId('incident-type')).toHaveTextContent('Draft Error');
    });

    it('should display Sync Failure label', () => {
      render(<IncidentLogCard incident={mockMediumIncident} />);

      expect(screen.getByTestId('incident-type')).toHaveTextContent('Sync Failure');
    });

    it('should display System Error label', () => {
      render(<IncidentLogCard incident={mockLowIncident} />);

      expect(screen.getByTestId('incident-type')).toHaveTextContent('System Error');
    });
  });

  describe('Affected Users Display', () => {
    it('should display affected users count', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('affected-users')).toHaveTextContent('150 affected');
    });

    it('should display zero affected users', () => {
      render(<IncidentLogCard incident={mockMediumIncident} />);

      expect(screen.getByTestId('affected-users')).toHaveTextContent('0 affected');
    });
  });

  describe('Expandable Details', () => {
    it('should show expand button when there are recovery actions or description', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.getByTestId('expand-button')).toBeInTheDocument();
    });

    it('should not show expanded content by default', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
    });

    it('should show expanded content when expand button is clicked', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      fireEvent.click(screen.getByTestId('expand-button'));

      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
    });

    it('should show description in expanded content', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      fireEvent.click(screen.getByTestId('expand-button'));

      expect(screen.getByTestId('description')).toHaveTextContent(
        'The Couch Managers API returned 503 errors for all requests.'
      );
    });

    it('should show recovery actions in expanded content', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      fireEvent.click(screen.getByTestId('expand-button'));

      const recoveryActions = screen.getByTestId('recovery-actions');
      expect(recoveryActions).toHaveTextContent('Restarted API server');
      expect(recoveryActions).toHaveTextContent('Cleared cache');
      expect(recoveryActions).toHaveTextContent('Notified users');
    });

    it('should toggle expanded content on second click', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      // Expand
      fireEvent.click(screen.getByTestId('expand-button'));
      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByTestId('expand-button'));
      expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
    });

    it('should start expanded when expanded prop is true', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} expanded />);

      expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded attribute on expand button', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      const button = screen.getByTestId('expand-button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-label on expand button', () => {
      render(<IncidentLogCard incident={mockCriticalIncident} />);

      const button = screen.getByTestId('expand-button');
      expect(button).toHaveAttribute('aria-label');
    });
  });

  describe('onClick Handler', () => {
    it('should call onClick when card is clicked', () => {
      const handleClick = vi.fn();
      render(<IncidentLogCard incident={mockCriticalIncident} onClick={handleClick} />);

      fireEvent.click(screen.getByTestId('incident-log-card'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when expand button is clicked', () => {
      const handleClick = vi.fn();
      render(<IncidentLogCard incident={mockCriticalIncident} onClick={handleClick} />);

      fireEvent.click(screen.getByTestId('expand-button'));

      // onClick should not be called when clicking the expand button
      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});

// Need to import vi for mock function
import { vi } from 'vitest';
