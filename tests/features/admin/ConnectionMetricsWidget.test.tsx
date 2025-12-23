/**
 * ConnectionMetricsWidget Component Tests
 *
 * Tests for the connection metrics dashboard widget.
 *
 * Story: 13.5 - View Connection Success Metrics
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ConnectionMetrics, DailyConnectionDetails } from '@/features/admin/types/admin.types';

// Mock connection metrics data
const mockConnectionMetrics: ConnectionMetrics[] = [
  {
    apiName: 'Couch Managers',
    apiKey: 'couch_managers',
    successRate7d: 97.5,
    totalCalls: 200,
    successfulCalls: 195,
    failedCalls: 5,
    dailyRates: [
      { date: '2025-12-22', successRate: 96.0 },
      { date: '2025-12-23', successRate: 99.0 },
    ],
  },
  {
    apiName: 'Fangraphs',
    apiKey: 'fangraphs',
    successRate7d: 100,
    totalCalls: 150,
    successfulCalls: 150,
    failedCalls: 0,
    dailyRates: [
      { date: '2025-12-22', successRate: 100 },
      { date: '2025-12-23', successRate: 100 },
    ],
  },
  {
    apiName: 'Google Sheets',
    apiKey: 'google_sheets',
    successRate7d: 85.0,
    totalCalls: 100,
    successfulCalls: 85,
    failedCalls: 15,
    dailyRates: [
      { date: '2025-12-22', successRate: 80.0 },
      { date: '2025-12-23', successRate: 90.0 },
    ],
  },
];

const mockDailyDetails: DailyConnectionDetails[] = [
  {
    apiName: 'Couch Managers',
    successRate: 99.0,
    totalCalls: 30,
    successfulCalls: 29,
    failedCalls: 1,
    avgResponseTimeMs: 150.5,
  },
];

// Mock hook state
let mockHookState = {
  metrics: mockConnectionMetrics,
  loading: false,
  error: null as string | null,
  lowSuccessCount: 1,
  refetch: vi.fn(),
  selectedDate: null as string | null,
  selectDate: vi.fn(),
  dailyDetails: [] as DailyConnectionDetails[],
  loadingDetails: false,
};

vi.mock('@/features/admin/hooks/useConnectionMetrics', () => ({
  useConnectionMetrics: () => mockHookState,
}));

vi.mock('@/features/admin/services/connectionMetricsService', () => ({
  getSuccessRateColor: (rate: number) => {
    if (rate >= 95) return 'green';
    if (rate >= 90) return 'yellow';
    return 'red';
  },
  SUCCESS_THRESHOLDS: { GREEN: 95, YELLOW: 90 },
}));

// Mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-line-chart">{children}</div>
  ),
  Line: () => <div data-testid="mock-line" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-responsive-container">{children}</div>
  ),
  Legend: () => null,
}));

// Import after mocking
import { ConnectionMetricsWidget } from '@/features/admin/components/ConnectionMetricsWidget';

describe('ConnectionMetricsWidget', () => {
  beforeEach(() => {
    mockHookState = {
      metrics: mockConnectionMetrics,
      loading: false,
      error: null,
      lowSuccessCount: 1,
      refetch: vi.fn(),
      selectedDate: null,
      selectDate: vi.fn(),
      dailyDetails: [],
      loadingDetails: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render the widget', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('connection-metrics-widget')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText('Connection Success Metrics')).toBeInTheDocument();
    });

    it('should display all metrics cards', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('metrics-card-couch_managers')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-card-fangraphs')).toBeInTheDocument();
      expect(screen.getByTestId('metrics-card-google_sheets')).toBeInTheDocument();
    });

    it('should display threshold info in footer', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText(/Thresholds:/)).toBeInTheDocument();
      expect(screen.getByText(/Green/)).toBeInTheDocument();
    });

    it('should display polling info in footer', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText(/Auto-refreshes every 2 minutes/)).toBeInTheDocument();
    });

    it('should display the trend chart', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
      expect(screen.getByText('7-Day Success Rate Trend')).toBeInTheDocument();
    });
  });

  describe('Low Success Count Badge', () => {
    it('should show badge when APIs are below 95% threshold', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('low-success-badge')).toHaveTextContent('1 below 95%');
    });

    it('should not show badge when all APIs are healthy', () => {
      mockHookState.lowSuccessCount = 0;
      render(<ConnectionMetricsWidget />);

      expect(screen.queryByTestId('low-success-badge')).not.toBeInTheDocument();
    });
  });

  describe('Status Indicator', () => {
    it('should show "All healthy" when no low success APIs', () => {
      mockHookState.lowSuccessCount = 0;
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('All healthy');
    });

    it('should show warning when there are low success APIs', () => {
      mockHookState.lowSuccessCount = 2;
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('2 APIs need attention');
    });

    it('should have green indicator when all healthy', () => {
      mockHookState.lowSuccessCount = 0;
      render(<ConnectionMetricsWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should have yellow indicator when there are warnings', () => {
      mockHookState.lowSuccessCount = 1;
      render(<ConnectionMetricsWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when loading', () => {
      mockHookState.loading = true;
      mockHookState.metrics = [];
      render(<ConnectionMetricsWidget />);

      // Should show skeleton instead of cards
      expect(screen.queryByTestId('metrics-card-couch_managers')).not.toBeInTheDocument();
    });

    it('should not show trend chart when loading', () => {
      mockHookState.loading = true;
      mockHookState.metrics = [];
      render(<ConnectionMetricsWidget />);

      expect(screen.queryByTestId('trend-chart')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      mockHookState.error = 'Failed to fetch connection metrics';
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Failed to fetch connection metrics'
      );
    });

    it('should not show error when no error', () => {
      mockHookState.error = null;
      render(<ConnectionMetricsWidget />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      mockHookState.metrics = [];
      mockHookState.loading = false;
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText('No connection metrics available')).toBeInTheDocument();
    });
  });

  describe('Refresh Button', () => {
    it('should have refresh button', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call refetch on refresh click', () => {
      render(<ConnectionMetricsWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      expect(mockHookState.refetch).toHaveBeenCalledTimes(1);
    });

    it('should have accessible label on refresh button', () => {
      render(<ConnectionMetricsWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh connection metrics');
    });
  });

  describe('Border Styling', () => {
    it('should have yellow border when there are low success APIs', () => {
      mockHookState.lowSuccessCount = 1;
      render(<ConnectionMetricsWidget />);

      const widget = screen.getByTestId('connection-metrics-widget');
      expect(widget).toHaveClass('border-yellow-500');
    });

    it('should have default border when all healthy', () => {
      mockHookState.lowSuccessCount = 0;
      render(<ConnectionMetricsWidget />);

      const widget = screen.getByTestId('connection-metrics-widget');
      expect(widget).toHaveClass('border-slate-800');
    });
  });

  describe('Grid Layout', () => {
    it('should have 3-column grid on medium screens', () => {
      render(<ConnectionMetricsWidget />);

      const grid = screen.getByTestId('metrics-cards-grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('Metrics Card Content', () => {
    it('should display API name in card', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText('Couch Managers')).toBeInTheDocument();
      expect(screen.getByText('Fangraphs')).toBeInTheDocument();
      expect(screen.getByText('Google Sheets')).toBeInTheDocument();
    });

    it('should display success rate percentage', () => {
      render(<ConnectionMetricsWidget />);

      // Check for formatted percentages (97.5%, 100.0%, 85.0%)
      expect(screen.getByText('97.5%')).toBeInTheDocument();
      expect(screen.getByText('100.0%')).toBeInTheDocument();
      expect(screen.getByText('85.0%')).toBeInTheDocument();
    });

    it('should display call counts', () => {
      render(<ConnectionMetricsWidget />);

      // Check for formatted call counts
      expect(screen.getByText(/195 \/ 200 calls/)).toBeInTheDocument();
    });

    it('should display failed calls count', () => {
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText('5 failed')).toBeInTheDocument();
      expect(screen.getByText('0 failed')).toBeInTheDocument();
      expect(screen.getByText('15 failed')).toBeInTheDocument();
    });
  });

  describe('Daily Details Modal', () => {
    it('should show modal when date is selected', () => {
      mockHookState.selectedDate = '2025-12-23';
      mockHookState.dailyDetails = mockDailyDetails;
      render(<ConnectionMetricsWidget />);

      expect(screen.getByTestId('daily-details-modal')).toBeInTheDocument();
    });

    it('should not show modal when no date selected', () => {
      mockHookState.selectedDate = null;
      render(<ConnectionMetricsWidget />);

      expect(screen.queryByTestId('daily-details-modal')).not.toBeInTheDocument();
    });

    it('should display daily details in modal', () => {
      mockHookState.selectedDate = '2025-12-23';
      mockHookState.dailyDetails = mockDailyDetails;
      render(<ConnectionMetricsWidget />);

      // Check for "Details for" text and some part of the date
      expect(screen.getByText(/Details for/)).toBeInTheDocument();
      expect(screen.getByText(/December.*2025/)).toBeInTheDocument();
      expect(screen.getByText('99.0%')).toBeInTheDocument();
    });

    it('should call selectDate(null) when modal is closed', () => {
      mockHookState.selectedDate = '2025-12-23';
      mockHookState.dailyDetails = mockDailyDetails;
      render(<ConnectionMetricsWidget />);

      const closeButton = screen.getByLabelText('Close details');
      fireEvent.click(closeButton);

      expect(mockHookState.selectDate).toHaveBeenCalledWith(null);
    });

    it('should show loading state in modal', () => {
      mockHookState.selectedDate = '2025-12-23';
      mockHookState.loadingDetails = true;
      mockHookState.dailyDetails = [];
      render(<ConnectionMetricsWidget />);

      // Loading skeleton should be visible
      const modal = screen.getByTestId('daily-details-modal');
      expect(modal.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should show empty state in modal when no data for date', () => {
      mockHookState.selectedDate = '2025-12-23';
      mockHookState.loadingDetails = false;
      mockHookState.dailyDetails = [];
      render(<ConnectionMetricsWidget />);

      expect(screen.getByText('No data for this date')).toBeInTheDocument();
    });
  });
});
