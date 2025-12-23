/**
 * ErrorRatesWidget Component Tests
 *
 * Tests for the error rates dashboard widget.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ErrorRate } from '@/features/admin/types/admin.types';

// Mock error rates data
const mockErrorRates: ErrorRate[] = [
  {
    apiName: 'Couch Managers',
    apiKey: 'couch_managers',
    errorRate24h: 2.5,
    errorCount: 5,
    totalChecks: 200,
    trend: 'stable',
    isAboveThreshold: false,
  },
  {
    apiName: 'Fangraphs',
    apiKey: 'fangraphs',
    errorRate24h: 0,
    errorCount: 0,
    totalChecks: 200,
    trend: 'stable',
    isAboveThreshold: false,
  },
  {
    apiName: 'Google Sheets',
    apiKey: 'google_sheets',
    errorRate24h: 7.5,
    errorCount: 15,
    totalChecks: 200,
    trend: 'up',
    isAboveThreshold: true,
  },
];

// Mock hook state
let mockHookState = {
  errorRates: mockErrorRates,
  loading: false,
  error: null as string | null,
  alertCount: 1,
  refetch: vi.fn(),
};

vi.mock('@/features/admin/hooks/useErrorRates', () => ({
  useErrorRates: () => mockHookState,
}));

vi.mock('@/features/admin/services/errorRateService', () => ({
  ERROR_THRESHOLD: 5,
}));

// Import after mocking
import { ErrorRatesWidget } from '@/features/admin/components/ErrorRatesWidget';

describe('ErrorRatesWidget', () => {
  beforeEach(() => {
    mockHookState = {
      errorRates: mockErrorRates,
      loading: false,
      error: null,
      alertCount: 1,
      refetch: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the widget', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('error-rates-widget')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByText('Error Rates')).toBeInTheDocument();
    });

    it('should display all error rate cards', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('error-rate-card-couch_managers')).toBeInTheDocument();
      expect(screen.getByTestId('error-rate-card-fangraphs')).toBeInTheDocument();
      expect(screen.getByTestId('error-rate-card-google_sheets')).toBeInTheDocument();
    });

    it('should display threshold info in footer', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByText(/Threshold: 5% triggers alert/)).toBeInTheDocument();
    });

    it('should display polling info in footer', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByText(/Auto-refreshes every 60 seconds/)).toBeInTheDocument();
    });
  });

  describe('Alert Count Badge', () => {
    it('should show alert count when APIs are above threshold', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('alert-count-badge')).toHaveTextContent('1 alert');
    });

    it('should show plural form for multiple alerts', () => {
      mockHookState.alertCount = 2;
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('alert-count-badge')).toHaveTextContent('2 alerts');
    });

    it('should not show badge when no alerts', () => {
      mockHookState.alertCount = 0;
      render(<ErrorRatesWidget />);

      expect(screen.queryByTestId('alert-count-badge')).not.toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show "All Normal" when no alerts', () => {
      mockHookState.alertCount = 0;
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('All Normal');
    });

    it('should show alert count with threshold when there are alerts', () => {
      mockHookState.alertCount = 1;
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('1 Above 5%');
    });

    it('should have green indicator when no alerts', () => {
      mockHookState.alertCount = 0;
      render(<ErrorRatesWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should have red indicator when there are alerts', () => {
      mockHookState.alertCount = 1;
      render(<ErrorRatesWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when loading', () => {
      mockHookState.loading = true;
      mockHookState.errorRates = [];
      render(<ErrorRatesWidget />);

      // Should show skeleton instead of cards
      expect(screen.queryByTestId('error-rate-card-couch_managers')).not.toBeInTheDocument();

      // Grid should be present with skeleton children
      const grid = screen.getByTestId('error-rate-cards-grid');
      expect(grid.children.length).toBe(3); // 3 skeletons
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      mockHookState.error = 'Failed to fetch error rates';
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to fetch error rates');
    });

    it('should not show error when no error', () => {
      mockHookState.error = null;
      render(<ErrorRatesWidget />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      mockHookState.errorRates = [];
      mockHookState.loading = false;
      render(<ErrorRatesWidget />);

      expect(screen.getByText('No error rate data available')).toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('should have refresh button', () => {
      render(<ErrorRatesWidget />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call refetch on refresh click', () => {
      render(<ErrorRatesWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      expect(mockHookState.refetch).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label on refresh button', () => {
      render(<ErrorRatesWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh error rates');
    });
  });

  describe('Border Styling', () => {
    it('should have red border when there are alerts', () => {
      mockHookState.alertCount = 1;
      render(<ErrorRatesWidget />);

      const widget = screen.getByTestId('error-rates-widget');
      expect(widget).toHaveClass('border-red-500');
    });

    it('should have default border when no alerts', () => {
      mockHookState.alertCount = 0;
      render(<ErrorRatesWidget />);

      const widget = screen.getByTestId('error-rates-widget');
      expect(widget).toHaveClass('border-slate-800');
    });
  });

  describe('Grid Layout', () => {
    it('should have 3-column grid on medium screens', () => {
      render(<ErrorRatesWidget />);

      const grid = screen.getByTestId('error-rate-cards-grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });
});
