/**
 * ErrorFrequencyChart Component Tests
 *
 * Tests for the error frequency visualization chart.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorFrequencyChart } from '@/features/admin/components/ErrorFrequencyChart';
import type { ErrorFrequencyPoint } from '@/features/admin/types/admin.types';

const mockFrequencyData: ErrorFrequencyPoint[] = [
  { time: '2025-12-23T08:00:00Z', count: 5 },
  { time: '2025-12-23T09:00:00Z', count: 3 },
  { time: '2025-12-23T10:00:00Z', count: 8 },
  { time: '2025-12-23T11:00:00Z', count: 2 },
];

describe('ErrorFrequencyChart', () => {
  it('should render the chart container', () => {
    render(<ErrorFrequencyChart data={mockFrequencyData} dateRange="24h" />);

    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();
  });

  it('should display chart title', () => {
    render(<ErrorFrequencyChart data={mockFrequencyData} dateRange="24h" />);

    expect(screen.getByText('Error Frequency')).toBeInTheDocument();
  });

  it('should show empty state when no data is available', () => {
    render(<ErrorFrequencyChart data={[]} dateRange="24h" />);

    expect(screen.getByText('No error data to display')).toBeInTheDocument();
  });

  it('should render with different date ranges', () => {
    const { rerender } = render(<ErrorFrequencyChart data={mockFrequencyData} dateRange="24h" />);
    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();

    rerender(<ErrorFrequencyChart data={mockFrequencyData} dateRange="7d" />);
    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();

    rerender(<ErrorFrequencyChart data={mockFrequencyData} dateRange="30d" />);
    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();
  });

  it('should respect custom height prop', () => {
    const { container } = render(
      <ErrorFrequencyChart data={mockFrequencyData} dateRange="24h" height={300} />
    );

    // The ResponsiveContainer should be present
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('should handle single data point', () => {
    const singlePoint: ErrorFrequencyPoint[] = [{ time: '2025-12-23T10:00:00Z', count: 5 }];

    render(<ErrorFrequencyChart data={singlePoint} dateRange="24h" />);

    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();
  });

  it('should handle data with zero counts', () => {
    const zeroData: ErrorFrequencyPoint[] = [
      { time: '2025-12-23T08:00:00Z', count: 0 },
      { time: '2025-12-23T09:00:00Z', count: 0 },
    ];

    render(<ErrorFrequencyChart data={zeroData} dateRange="24h" />);

    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();
  });
});
