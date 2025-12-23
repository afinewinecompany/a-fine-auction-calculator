/**
 * ClearFiltersButton Component Tests
 *
 * Tests for the clear filters button component.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClearFiltersButton } from '@/features/draft/components/ClearFiltersButton';

describe('ClearFiltersButton', () => {
  describe('Visibility', () => {
    it('renders when filters are active', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    it('does not render when filters are not active', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={false} />);

      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('displays "Clear All" text', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('has correct aria-label', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClear when clicked', () => {
      const onClear = vi.fn();
      render(<ClearFiltersButton onClear={onClear} isActive={true} />);

      fireEvent.click(screen.getByTestId('clear-filters-button'));
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('calls onClear on each click', () => {
      const onClear = vi.fn();
      render(<ClearFiltersButton onClear={onClear} isActive={true} />);

      fireEvent.click(screen.getByTestId('clear-filters-button'));
      fireEvent.click(screen.getByTestId('clear-filters-button'));
      expect(onClear).toHaveBeenCalledTimes(2);
    });
  });

  describe('Styling', () => {
    it('applies custom className when provided', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} className="custom-class" />);

      const button = screen.getByTestId('clear-filters-button');
      expect(button).toHaveClass('custom-class');
    });

    it('is a button element', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      const button = screen.getByTestId('clear-filters-button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('has type="button"', () => {
      render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      const button = screen.getByTestId('clear-filters-button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Toggle Behavior', () => {
    it('appears when isActive changes from false to true', () => {
      const { rerender } = render(<ClearFiltersButton onClear={vi.fn()} isActive={false} />);

      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument();

      rerender(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
    });

    it('disappears when isActive changes from true to false', () => {
      const { rerender } = render(<ClearFiltersButton onClear={vi.fn()} isActive={true} />);

      expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();

      rerender(<ClearFiltersButton onClear={vi.fn()} isActive={false} />);

      expect(screen.queryByTestId('clear-filters-button')).not.toBeInTheDocument();
    });
  });
});
