/**
 * APIStatusCard Component Tests
 *
 * Tests for the individual API status card display.
 *
 * Story: 13.3 - Monitor API Health for Integrations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { APIHealthStatus } from '@/features/admin/types/admin.types';
import { APIStatusCard } from '@/features/admin/components/APIStatusCard';

// Helper to create mock API status
const createMockAPIStatus = (overrides: Partial<APIHealthStatus> = {}): APIHealthStatus => ({
  name: 'Test API',
  status: 'healthy',
  lastSuccessfulCall: '2025-12-22T10:00:00Z',
  responseTime: 150,
  errorRate: 2.5,
  recentErrors: [],
  ...overrides,
});

describe('APIStatusCard', () => {
  beforeEach(() => {
    // Clear any previous renders
  });

  describe('Display', () => {
    it('should display API name', () => {
      render(<APIStatusCard api={createMockAPIStatus({ name: 'Couch Managers' })} />);

      expect(screen.getByText('Couch Managers')).toBeInTheDocument();
    });

    it('should display status text', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'healthy' })} />);

      expect(screen.getByTestId('status-text')).toHaveTextContent('Healthy');
    });

    it('should display response time in milliseconds', () => {
      render(<APIStatusCard api={createMockAPIStatus({ responseTime: 250 })} />);

      expect(screen.getByTestId('response-time')).toHaveTextContent('250ms');
    });

    it('should display response time in seconds when over 1000ms', () => {
      render(<APIStatusCard api={createMockAPIStatus({ responseTime: 2500 })} />);

      expect(screen.getByTestId('response-time')).toHaveTextContent('2.5s');
    });

    it('should display N/A when response time is null', () => {
      render(<APIStatusCard api={createMockAPIStatus({ responseTime: null })} />);

      expect(screen.getByTestId('response-time')).toHaveTextContent('N/A');
    });

    it('should display error rate percentage', () => {
      render(<APIStatusCard api={createMockAPIStatus({ errorRate: 5.5 })} />);

      expect(screen.getByTestId('error-rate')).toHaveTextContent('5.5%');
    });

    it('should display last success time', () => {
      render(<APIStatusCard api={createMockAPIStatus({ lastSuccessfulCall: '2025-12-22T10:00:00Z' })} />);

      expect(screen.getByTestId('last-success')).toBeInTheDocument();
    });

    it('should display "Never" when no last successful call', () => {
      render(<APIStatusCard api={createMockAPIStatus({ lastSuccessfulCall: null })} />);

      expect(screen.getByTestId('last-success')).toHaveTextContent('Never');
    });
  });

  describe('Status Indicator Colors', () => {
    it('should show green dot for healthy status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'healthy' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should show yellow dot for degraded status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'degraded' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('should show red dot for down status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'down' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('should pulse animation for healthy status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'healthy' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveClass('animate-pulse');
    });

    it('should not pulse for down status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'down' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).not.toHaveClass('animate-pulse');
    });
  });

  describe('Status Text Colors', () => {
    it('should show green text for healthy status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'healthy' })} />);

      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveClass('text-emerald-400');
    });

    it('should show yellow text for degraded status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'degraded' })} />);

      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveClass('text-yellow-400');
    });

    it('should show red text for down status', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'down' })} />);

      const statusText = screen.getByTestId('status-text');
      expect(statusText).toHaveClass('text-red-400');
    });
  });

  describe('Recent Errors', () => {
    it('should not show toggle button when no errors', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: [] })} />);

      expect(screen.queryByTestId('toggle-errors')).not.toBeInTheDocument();
    });

    it('should show toggle button when errors exist', () => {
      render(
        <APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1', 'Error 2'] })} />
      );

      expect(screen.getByTestId('toggle-errors')).toBeInTheDocument();
    });

    it('should show error count in toggle button', () => {
      render(
        <APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1', 'Error 2', 'Error 3'] })} />
      );

      expect(screen.getByTestId('toggle-errors')).toHaveTextContent('Show Recent Errors (3)');
    });

    it('should not show error list by default', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1'] })} />);

      expect(screen.queryByTestId('error-list')).not.toBeInTheDocument();
    });

    it('should expand error list on click', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1', 'Error 2'] })} />);

      fireEvent.click(screen.getByTestId('toggle-errors'));

      expect(screen.getByTestId('error-list')).toBeInTheDocument();
    });

    it('should display all error messages when expanded', () => {
      render(
        <APIStatusCard
          api={createMockAPIStatus({ recentErrors: ['Connection timeout', 'Rate limit exceeded'] })}
        />
      );

      fireEvent.click(screen.getByTestId('toggle-errors'));

      expect(screen.getByText('Connection timeout')).toBeInTheDocument();
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
    });

    it('should collapse error list on second click', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1'] })} />);

      const toggleButton = screen.getByTestId('toggle-errors');

      // Expand
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('error-list')).toBeInTheDocument();

      // Collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByTestId('error-list')).not.toBeInTheDocument();
    });

    it('should change toggle text when expanded', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1'] })} />);

      const toggleButton = screen.getByTestId('toggle-errors');

      expect(toggleButton).toHaveTextContent('Show Recent Errors');
      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveTextContent('Hide Recent Errors');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on status indicator', () => {
      render(<APIStatusCard api={createMockAPIStatus({ status: 'healthy' })} />);

      const indicator = screen.getByTestId('status-indicator');
      expect(indicator).toHaveAttribute('aria-label', 'Status: Healthy');
    });

    it('should have aria-expanded on toggle button', () => {
      render(<APIStatusCard api={createMockAPIStatus({ recentErrors: ['Error 1'] })} />);

      const toggleButton = screen.getByTestId('toggle-errors');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have data-testid based on API name', () => {
      render(<APIStatusCard api={createMockAPIStatus({ name: 'Couch Managers' })} />);

      expect(screen.getByTestId('api-status-card-couch-managers')).toBeInTheDocument();
    });
  });

  describe('High Error Rate Styling', () => {
    it('should highlight error rate when over 10%', () => {
      render(<APIStatusCard api={createMockAPIStatus({ errorRate: 15.5 })} />);

      const errorRate = screen.getByTestId('error-rate');
      expect(errorRate).toHaveClass('text-red-400');
    });

    it('should not highlight error rate when under 10%', () => {
      render(<APIStatusCard api={createMockAPIStatus({ errorRate: 5.0 })} />);

      const errorRate = screen.getByTestId('error-rate');
      expect(errorRate).not.toHaveClass('text-red-400');
    });
  });
});
