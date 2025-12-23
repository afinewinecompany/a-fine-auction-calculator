/**
 * BudgetUtilization Component Tests
 *
 * Tests for the BudgetUtilization placeholder component.
 * This component will display spending breakdown and budget analysis.
 *
 * Story: 12.1 - Create Post-Draft Summary Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetUtilization } from '@/features/draft/components/BudgetUtilization';
import type { BudgetState } from '../../../src/features/draft/types/summary.types';

describe('BudgetUtilization', () => {
  const mockBudget: BudgetState = {
    initial: 260,
    remaining: 50,
    spent: 210,
  };

  it('renders the section heading', () => {
    render(<BudgetUtilization budget={mockBudget} />);
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
  });

  it('renders with zero spending', () => {
    const emptyBudget: BudgetState = {
      initial: 260,
      remaining: 260,
      spent: 0,
    };
    render(<BudgetUtilization budget={emptyBudget} />);
    expect(screen.getByText('Budget Utilization')).toBeInTheDocument();
  });

  it('displays total spent and budget metrics', () => {
    render(<BudgetUtilization budget={mockBudget} />);
    expect(screen.getByText('Total Spent')).toBeInTheDocument();
    expect(screen.getByText('Budget Remaining')).toBeInTheDocument();
  });

  it('has correct section styling with slate background', () => {
    const { container } = render(<BudgetUtilization budget={mockBudget} />);
    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-slate-900');
  });

  it('accepts spendingByPosition prop when provided', () => {
    render(
      <BudgetUtilization
        budget={mockBudget}
        spendingByPosition={{
          hitters: { amount: 145, percentage: 55.8 },
          pitchers: { amount: 95, percentage: 36.5 },
          bench: { amount: 20, percentage: 7.7 },
        }}
      />
    );
    // Check that spending breakdown is displayed
    expect(screen.getByText('Hitters')).toBeInTheDocument();
    expect(screen.getByText('Pitchers')).toBeInTheDocument();
    expect(screen.getByText('Bench')).toBeInTheDocument();
  });
});
