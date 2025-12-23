/**
 * InflationPerformanceWidget Tests
 *
 * Tests for the inflation performance widget component.
 *
 * Story: 13.11 - View Inflation Calculation Performance Metrics
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { InflationPerformanceMetrics, LatencyThresholdLevel } from '@/features/admin/types/admin.types';

// Mock metrics data - excellent performance
const mockExcellentMetrics: InflationPerformanceMetrics = {
  medianLatency: 45,
  p95Latency: 120,
  p99Latency: 250,
  totalCalculations: 5000,
  calculationsPerMinute: 3.47,
  hourlyLatencies: [
    { hour: '2025-12-23T10:00:00Z', medianLatency: 42 },
    { hour: '2025-12-23T11:00:00Z', medianLatency: 48 },
  ],
};

// Mock metrics data - critical with p99 alert
const mockCriticalMetrics: InflationPerformanceMetrics = {
  medianLatency: 250,
  p95Latency: 600,
  p99Latency: 800,
  totalCalculations: 5000,
  calculationsPerMinute: 3.47,
  hourlyLatencies: [
    { hour: '2025-12-23T10:00:00Z', medianLatency: 240 },
    { hour: '2025-12-23T11:00:00Z', medianLatency: 260 },
  ],
};

// Mock empty metrics
const mockEmptyMetrics: InflationPerformanceMetrics = {
  medianLatency: 0,
  p95Latency: 0,
  p99Latency: 0,
  totalCalculations: 0,
  calculationsPerMinute: 0,
  hourlyLatencies: [],
};

// Mock hook state
let mockHookState: {
  metrics: InflationPerformanceMetrics | null;
  loading: boolean;
  error: string | null;
  isP99Alert: boolean;
  thresholdLevel: LatencyThresholdLevel;
  refetch: () => Promise<void>;
};

const mockRefetch = vi.fn().mockResolvedValue(undefined);

vi.mock('@/features/admin/hooks/useInflationPerformanceMetrics', () => ({
  useInflationPerformanceMetrics: () => mockHookState,
}));

// Mock recharts to avoid canvas rendering issues
vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  ReferenceLine: () => <div data-testid="reference-line" />,
}));

// Import after mocking
import { InflationPerformanceWidget } from '@/features/admin/components/InflationPerformanceWidget';

describe('InflationPerformanceWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookState = {
      metrics: mockExcellentMetrics,
      loading: false,
      error: null,
      isP99Alert: false,
      thresholdLevel: 'excellent',
      refetch: mockRefetch,
    };
  });

  it('should render widget with test id', () => {
    render(<InflationPerformanceWidget />);
    expect(screen.getByTestId('inflation-performance-widget')).toBeInTheDocument();
  });

  it('should render header with title', () => {
    render(<InflationPerformanceWidget />);
    expect(screen.getByText('Inflation Performance')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading', () => {
    mockHookState.loading = true;
    mockHookState.metrics = null;

    render(<InflationPerformanceWidget />);

    // Should not show stats grid when loading
    expect(screen.queryByTestId('stats-grid')).not.toBeInTheDocument();
  });

  it('should show empty state when no calculations', () => {
    mockHookState.metrics = mockEmptyMetrics;

    render(<InflationPerformanceWidget />);

    expect(screen.getByText('No performance data available')).toBeInTheDocument();
    expect(screen.getByText('Inflation calculations will populate this data')).toBeInTheDocument();
  });

  it('should show empty state when metrics is null', () => {
    mockHookState.metrics = null;

    render(<InflationPerformanceWidget />);

    expect(screen.getByText('No performance data available')).toBeInTheDocument();
  });

  it('should display stats grid with metrics', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    expect(screen.getByText('Median Latency')).toBeInTheDocument();
    expect(screen.getByText('P95 Latency')).toBeInTheDocument();
    expect(screen.getByText('P99 Latency')).toBeInTheDocument();
    expect(screen.getByText('Calculations')).toBeInTheDocument();
  });

  it('should display latency values correctly', () => {
    render(<InflationPerformanceWidget />);

    // Median: 45ms (appears twice - in header and in stat card)
    expect(screen.getAllByText('45ms').length).toBeGreaterThanOrEqual(1);
    // P95: 120ms
    expect(screen.getByText('120ms')).toBeInTheDocument();
    // P99: 250ms
    expect(screen.getByText('250ms')).toBeInTheDocument();
    // Total: 5,000
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });

  it('should display calculations per minute', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByText('3.47/min')).toBeInTheDocument();
  });

  it('should show error message when error exists', () => {
    mockHookState.error = 'Failed to fetch metrics';

    render(<InflationPerformanceWidget />);

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch metrics')).toBeInTheDocument();
  });

  it('should show p99 alert badge when isP99Alert is true', () => {
    mockHookState.metrics = mockCriticalMetrics;
    mockHookState.isP99Alert = true;
    mockHookState.thresholdLevel = 'critical';

    render(<InflationPerformanceWidget />);

    expect(screen.getByTestId('p99-alert-badge')).toBeInTheDocument();
    // P99 appears multiple times (in badge, stat card label, footer)
    expect(screen.getAllByText(/P99/).length).toBeGreaterThanOrEqual(1);
  });

  it('should not show p99 alert badge when isP99Alert is false', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.queryByTestId('p99-alert-badge')).not.toBeInTheDocument();
  });

  it('should call refetch when refresh button is clicked', () => {
    render(<InflationPerformanceWidget />);

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should show trend chart when hourly latencies exist', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
    expect(screen.getByText('24-Hour Latency Trend (Median)')).toBeInTheDocument();
  });

  it('should not show trend chart when hourly latencies are empty', () => {
    mockHookState.metrics = {
      ...mockExcellentMetrics,
      hourlyLatencies: [],
    };

    render(<InflationPerformanceWidget />);

    expect(screen.queryByTestId('trend-chart')).not.toBeInTheDocument();
  });

  it('should show median display in header', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByTestId('median-display')).toBeInTheDocument();
    expect(screen.getByTestId('latency-indicator')).toBeInTheDocument();
  });

  it('should display threshold information in footer', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByText(/Green/)).toBeInTheDocument();
    expect(screen.getByText(/Yellow/)).toBeInTheDocument();
    expect(screen.getByText(/Red/)).toBeInTheDocument();
    expect(screen.getByText('Auto-refreshes every 60 seconds')).toBeInTheDocument();
  });

  it('should format latency values in seconds when >= 1000ms', () => {
    mockHookState.metrics = {
      ...mockExcellentMetrics,
      medianLatency: 1500,
      p95Latency: 2500,
      p99Latency: 3500,
    };

    render(<InflationPerformanceWidget />);

    // 1500ms = 1.50s (appears twice - header and stat card)
    expect(screen.getAllByText('1.50s').length).toBeGreaterThanOrEqual(1);
    // 2500ms = 2.50s
    expect(screen.getByText('2.50s')).toBeInTheDocument();
    // 3500ms = 3.50s
    expect(screen.getByText('3.50s')).toBeInTheDocument();
  });

  it('should have red border when p99 alert is triggered', () => {
    mockHookState.metrics = mockCriticalMetrics;
    mockHookState.isP99Alert = true;

    render(<InflationPerformanceWidget />);

    const widget = screen.getByTestId('inflation-performance-widget');
    expect(widget.className).toContain('border-red-500');
  });

  it('should have normal border when p99 alert is not triggered', () => {
    render(<InflationPerformanceWidget />);

    const widget = screen.getByTestId('inflation-performance-widget');
    expect(widget.className).toContain('border-slate-800');
    expect(widget.className).not.toContain('border-red-500');
  });

  it('should render accessible refresh button', () => {
    render(<InflationPerformanceWidget />);

    const refreshButton = screen.getByTestId('refresh-button');
    expect(refreshButton).toHaveAttribute('aria-label', 'Refresh performance metrics');
    expect(refreshButton).toHaveAttribute('title', 'Refresh metrics');
  });

  it('should show percentile labels', () => {
    render(<InflationPerformanceWidget />);

    expect(screen.getByText('50th percentile')).toBeInTheDocument();
    expect(screen.getByText('95th percentile')).toBeInTheDocument();
    expect(screen.getByText('99th percentile')).toBeInTheDocument();
  });
});
