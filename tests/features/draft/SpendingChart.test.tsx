/**
 * SpendingChart Component Tests
 *
 * Tests for visual spending distribution chart.
 *
 * Story: 12.3 - Display Total Spending and Budget Utilization
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpendingChart } from '@/features/draft/components/SpendingChart';

describe('SpendingChart', () => {
  const mockData = {
    hitters: { amount: 145, percentage: 55.8 },
    pitchers: { amount: 95, percentage: 36.5 },
    bench: { amount: 20, percentage: 7.7 },
  };

  it('should render chart container', () => {
    render(<SpendingChart data={mockData} />);

    // Check for recharts container (ResponsiveContainer adds a div)
    const container = screen.getByRole('region', { name: /spending distribution/i });
    expect(container).toBeInTheDocument();
  });

  it('should display category labels', () => {
    render(<SpendingChart data={mockData} />);

    // Recharts renders text elements for labels
    expect(screen.getByText('Hitters')).toBeInTheDocument();
    expect(screen.getByText('Pitchers')).toBeInTheDocument();
    expect(screen.getByText('Bench')).toBeInTheDocument();
  });

  it('should display spending amounts', () => {
    render(<SpendingChart data={mockData} />);

    // Check that dollar amounts are displayed
    expect(screen.getByText('$145')).toBeInTheDocument();
    expect(screen.getByText('$95')).toBeInTheDocument();
    expect(screen.getByText('$20')).toBeInTheDocument();
  });

  it('should display percentages', () => {
    render(<SpendingChart data={mockData} />);

    // Check that percentages are displayed
    expect(screen.getByText(/55\.8%/)).toBeInTheDocument();
    expect(screen.getByText(/36\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/7\.7%/)).toBeInTheDocument();
  });

  it('should handle zero spending', () => {
    const emptyData = {
      hitters: { amount: 0, percentage: 0 },
      pitchers: { amount: 0, percentage: 0 },
      bench: { amount: 0, percentage: 0 },
    };

    render(<SpendingChart data={emptyData} />);

    expect(screen.getByText('Hitters')).toBeInTheDocument();
    expect(screen.getAllByText('$0')).toHaveLength(3);
  });

  it('should be accessible', () => {
    render(<SpendingChart data={mockData} />);

    const chart = screen.getByRole('region', { name: /spending distribution/i });
    expect(chart).toHaveAttribute('aria-label');
  });
});
