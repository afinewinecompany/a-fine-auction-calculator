/**
 * Tests for BudgetDisplay Component
 *
 * Story: 7.2 - Display Real-Time Budget Tracking
 *
 * Tests the budget display component that shows remaining, total, and spent
 * amounts with appropriate styling and low budget warnings.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BudgetDisplay } from '@/features/draft/components/BudgetDisplay';
import { LOW_BUDGET_THRESHOLD } from '@/features/draft/types/roster.types';

describe('BudgetDisplay', () => {
  describe('rendering', () => {
    it('should render the budget display container', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      expect(screen.getByTestId('budget-display')).toBeInTheDocument();
    });

    it('should render remaining budget', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      expect(screen.getByTestId('remaining-budget')).toHaveTextContent('$185');
    });

    it('should render total budget', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      expect(screen.getByTestId('total-budget')).toHaveTextContent('of $260 total');
    });

    it('should render spent amount', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      expect(screen.getByTestId('spent-budget')).toHaveTextContent('$75 Spent');
    });
  });

  describe('remaining budget styling', () => {
    it('should apply emerald-400 color when budget is not low', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      const remainingBudget = screen.getByTestId('remaining-budget');
      expect(remainingBudget).toHaveClass('text-emerald-400');
    });

    it('should apply font-bold to remaining budget', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      const remainingBudget = screen.getByTestId('remaining-budget');
      expect(remainingBudget).toHaveClass('font-bold');
    });
  });

  describe('total budget styling', () => {
    it('should apply slate-400 color to total budget', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      const totalBudget = screen.getByTestId('total-budget');
      expect(totalBudget).toHaveClass('text-slate-400');
    });
  });

  describe('spent amount styling', () => {
    it('should apply slate-300 color to spent amount', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      const spentBudget = screen.getByTestId('spent-budget');
      expect(spentBudget).toHaveClass('text-slate-300');
    });
  });

  describe('low budget warning', () => {
    it('should show warning when remaining is below threshold', () => {
      render(<BudgetDisplay total={260} spent={245} remaining={15} />);
      expect(screen.getByTestId('low-budget-warning')).toBeInTheDocument();
    });

    it('should not show warning when remaining is at threshold', () => {
      render(<BudgetDisplay total={260} spent={240} remaining={LOW_BUDGET_THRESHOLD} />);
      expect(screen.queryByTestId('low-budget-warning')).not.toBeInTheDocument();
    });

    it('should change remaining text to red when budget is low', () => {
      render(<BudgetDisplay total={260} spent={250} remaining={10} />);
      const remainingBudget = screen.getByTestId('remaining-budget');
      expect(remainingBudget).toHaveClass('text-red-500');
    });

    it('should show warning text', () => {
      render(<BudgetDisplay total={260} spent={250} remaining={10} />);
      expect(screen.getByText('Low budget warning')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-labels for screen readers', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      const remainingBudget = screen.getByTestId('remaining-budget');
      expect(remainingBudget).toHaveAttribute('aria-label', '$185 remaining');
    });

    it('should have region role on container', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} />);
      expect(screen.getByTestId('budget-display')).toHaveAttribute('role', 'region');
    });

    it('should have alert role on low budget warning', () => {
      render(<BudgetDisplay total={260} spent={250} remaining={10} />);
      expect(screen.getByTestId('low-budget-warning')).toHaveAttribute('role', 'alert');
    });
  });

  describe('className prop', () => {
    it('should apply custom className to container', () => {
      render(<BudgetDisplay total={260} spent={75} remaining={185} className="custom-class" />);
      expect(screen.getByTestId('budget-display')).toHaveClass('custom-class');
    });
  });
});