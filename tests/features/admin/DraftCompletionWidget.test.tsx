/**
 * DraftCompletionWidget Component Tests
 *
 * Tests for the draft completion metrics widget component.
 *
 * Story: 13.8 - Track Draft Completion Rates
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { DraftCompletionMetrics } from '@/features/admin/types/admin.types';

// Mock metrics data
const mockHealthyMetrics: DraftCompletionMetrics = {
  totalDrafts: 100,
  completedDrafts: 85,
  abandonedDrafts: 10,
  errorDrafts: 5,
  completionRate: 85.0,
  dailyRates: [
    { date: '2025-12-22', completionRate: 80.0 },
    { date: '2025-12-23', completionRate: 90.0 },
  ],
};

const mockLowMetrics: DraftCompletionMetrics = {
  totalDrafts: 100,
  completedDrafts: 70,
  abandonedDrafts: 20,
  errorDrafts: 10,
  completionRate: 70.0,
  dailyRates: [
    { date: '2025-12-22', completionRate: 65.0 },
    { date: '2025-12-23', completionRate: 75.0 },
  ],
};

// Mock hook return values
const mockRefetch = vi.fn();
let mockHookReturn = {
  metrics: mockHealthyMetrics as DraftCompletionMetrics | null,
  loading: false,
  error: null as string | null,
  isBelowTarget: false,
  refetch: mockRefetch,
};

vi.mock('@/features/admin/hooks/useDraftCompletionMetrics', () => ({
  useDraftCompletionMetrics: () => mockHookReturn,
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

// Import after mocking
import { DraftCompletionWidget } from '@/features/admin/components/DraftCompletionWidget';

describe('DraftCompletionWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookReturn = {
      metrics: mockHealthyMetrics,
      loading: false,
      error: null,
      isBelowTarget: false,
      refetch: mockRefetch,
    };
  });

  describe('Loading State', () => {
    it('should render loading skeleton when loading', () => {
      mockHookReturn.loading = true;
      mockHookReturn.metrics = null;

      render(<DraftCompletionWidget />);

      // Check for loading skeleton - we can check for the animate-pulse class
      const widget = screen.getByTestId('draft-completion-widget');
      expect(widget).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no metrics data', () => {
      mockHookReturn.metrics = null;

      render(<DraftCompletionWidget />);

      expect(screen.getByText('No draft completion data available')).toBeInTheDocument();
    });

    it('should render empty state when total drafts is 0', () => {
      mockHookReturn.metrics = {
        ...mockHealthyMetrics,
        totalDrafts: 0,
      };

      render(<DraftCompletionWidget />);

      expect(screen.getByText('No draft completion data available')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error message when error occurs', () => {
      mockHookReturn.error = 'Failed to fetch metrics';

      render(<DraftCompletionWidget />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument();
    });
  });

  describe('Healthy State (Above Target)', () => {
    it('should render completion rate display', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByTestId('completion-rate-display')).toHaveTextContent('85.0%');
    });

    it('should render stats grid with correct values', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Total drafts
      expect(screen.getByText('85')).toBeInTheDocument(); // Completed
      expect(screen.getByText('10')).toBeInTheDocument(); // Abandoned
      expect(screen.getByText('5')).toBeInTheDocument(); // Errors
    });

    it('should render trend chart', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
      expect(screen.getByText('30-Day Completion Rate Trend')).toBeInTheDocument();
    });

    it('should not show below target badge when rate is healthy', () => {
      render(<DraftCompletionWidget />);

      expect(screen.queryByTestId('below-target-badge')).not.toBeInTheDocument();
    });

    it('should show green indicator when rate is healthy', () => {
      render(<DraftCompletionWidget />);

      const indicator = screen.getByTestId('rate-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });
  });

  describe('Below Target State', () => {
    beforeEach(() => {
      mockHookReturn = {
        metrics: mockLowMetrics,
        loading: false,
        error: null,
        isBelowTarget: true,
        refetch: mockRefetch,
      };
    });

    it('should show below target badge', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByTestId('below-target-badge')).toBeInTheDocument();
      expect(screen.getByText(/Below 80% target/)).toBeInTheDocument();
    });

    it('should show red/yellow indicator when rate is low', () => {
      render(<DraftCompletionWidget />);

      const indicator = screen.getByTestId('rate-indicator');
      // 70% is in yellow zone (70-80%)
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('should have yellow border when below target', () => {
      render(<DraftCompletionWidget />);

      const widget = screen.getByTestId('draft-completion-widget');
      expect(widget).toHaveClass('border-yellow-500');
    });
  });

  describe('User Interactions', () => {
    it('should call refetch when refresh button is clicked', () => {
      render(<DraftCompletionWidget />);

      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should have accessible refresh button', () => {
      render(<DraftCompletionWidget />);

      const refreshButton = screen.getByLabelText('Refresh completion metrics');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('Threshold Information', () => {
    it('should display threshold information in footer', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByText(/Thresholds:/)).toBeInTheDocument();
      expect(screen.getByText(/Green \(≥80%\)/)).toBeInTheDocument();
      expect(screen.getByText(/Yellow \(70-80%\)/)).toBeInTheDocument();
    });

    it('should display polling interval information', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByText(/Auto-refreshes every 5 minutes/)).toBeInTheDocument();
    });
  });

  describe('Component Title', () => {
    it('should display widget title', () => {
      render(<DraftCompletionWidget />);

      expect(screen.getByText('Draft Completion Rates')).toBeInTheDocument();
    });
  });
});
