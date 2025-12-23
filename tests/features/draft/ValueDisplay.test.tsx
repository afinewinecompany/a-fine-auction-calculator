/**
 * Tests for ValueDisplay Component
 *
 * Story: 6.5 - Display Adjusted Values with Prominent Styling
 *
 * Tests the value display component that shows adjusted and projected values
 * with appropriate styling for quick 3-second value scans during bidding.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValueDisplay } from '@/features/draft/components/ValueDisplay';
import { formatCurrency } from '@/features/draft/utils/formatCurrency';

describe('ValueDisplay', () => {
  // ============================================================================
  // Basic Rendering Tests
  // ============================================================================
  describe('rendering', () => {
    it('should render adjusted value prominently', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      expect(screen.getByText('$45')).toBeInTheDocument();
    });

    it('should render projected value as secondary', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      expect(screen.getByText('$38')).toBeInTheDocument();
    });

    it('should render both values correctly', () => {
      render(<ValueDisplay adjustedValue={55} projectedValue={50} />);

      expect(screen.getByText('$55')).toBeInTheDocument();
      expect(screen.getByText('$50')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Styling Tests - Adjusted Value
  // ============================================================================
  describe('adjusted value styling', () => {
    it('should apply emerald-400 color to adjusted value', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      expect(adjustedValue).toHaveClass('text-emerald-400');
    });

    it('should apply text-xl size to adjusted value', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      expect(adjustedValue).toHaveClass('text-xl');
    });

    it('should apply font-bold to adjusted value', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      expect(adjustedValue).toHaveClass('font-bold');
    });

    it('should have adjusted value as visual anchor (larger than projected)', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      const projectedValue = screen.getByTestId('projected-value');

      // Adjusted should be xl, projected should be sm
      expect(adjustedValue).toHaveClass('text-xl');
      expect(projectedValue).toHaveClass('text-sm');
    });
  });

  // ============================================================================
  // Styling Tests - Projected Value
  // ============================================================================
  describe('projected value styling', () => {
    it('should apply slate-400 color to projected value', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const projectedValue = screen.getByTestId('projected-value');
      expect(projectedValue).toHaveClass('text-slate-400');
    });

    it('should apply text-sm size to projected value', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const projectedValue = screen.getByTestId('projected-value');
      expect(projectedValue).toHaveClass('text-sm');
    });
  });

  // ============================================================================
  // Currency Formatting Tests
  // ============================================================================
  describe('currency formatting', () => {
    it('should format values as whole dollar amounts', () => {
      render(<ValueDisplay adjustedValue={45.7} projectedValue={38.2} />);

      // Should round to whole numbers
      expect(screen.getByText('$46')).toBeInTheDocument();
      expect(screen.getByText('$38')).toBeInTheDocument();
    });

    it('should include dollar sign prefix', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$45');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$38');
    });

    it('should display as $XX not XX.0', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      // Should NOT show decimal places
      expect(screen.queryByText('$45.0')).not.toBeInTheDocument();
      expect(screen.queryByText('$38.0')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Edge Case Tests
  // ============================================================================
  describe('edge cases', () => {
    it('should handle zero values', () => {
      render(<ValueDisplay adjustedValue={0} projectedValue={0} />);

      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$0');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$0');
    });

    it('should handle negative values by showing as $0', () => {
      render(<ValueDisplay adjustedValue={-5} projectedValue={10} />);

      // Negative adjusted should show as $0
      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$0');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$10');
    });

    it('should handle negative projected values by showing as $0', () => {
      render(<ValueDisplay adjustedValue={10} projectedValue={-3} />);

      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$10');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$0');
    });

    it('should handle very large values ($999+)', () => {
      render(<ValueDisplay adjustedValue={999} projectedValue={1050} />);

      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$999');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$1050');
    });

    it('should round up values at .5 or higher', () => {
      render(<ValueDisplay adjustedValue={45.5} projectedValue={38.4} />);

      expect(screen.getByTestId('adjusted-value')).toHaveTextContent('$46');
      expect(screen.getByTestId('projected-value')).toHaveTextContent('$38');
    });
  });

  // ============================================================================
  // Visual Hierarchy Tests
  // ============================================================================
  describe('visual hierarchy', () => {
    it('should position values in vertical flex layout', () => {
      const { container } = render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
    });

    it('should align values to the end (right)', () => {
      const { container } = render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('items-end');
    });

    it('should render adjusted value before projected value in DOM', () => {
      const { container } = render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const spans = container.querySelectorAll('span');
      // First span should be adjusted value
      expect(spans[0]).toHaveTextContent('$45');
      // Second span should be projected value
      expect(spans[1]).toHaveTextContent('$38');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('accessibility', () => {
    it('should have proper aria-labels for screen readers', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      const projectedValue = screen.getByTestId('projected-value');

      expect(adjustedValue).toHaveAttribute('aria-label', 'Adjusted value: $45');
      expect(projectedValue).toHaveAttribute('aria-label', 'Projected value: $38');
    });

    it('should have sufficient color contrast (emerald-400 on dark)', () => {
      render(<ValueDisplay adjustedValue={45} projectedValue={38} />);

      const adjustedValue = screen.getByTestId('adjusted-value');
      // emerald-400 provides 4.5:1 contrast ratio on slate-950 background
      expect(adjustedValue).toHaveClass('text-emerald-400');
    });
  });
});

// ============================================================================
// formatCurrency Utility Tests
// ============================================================================
describe('formatCurrency', () => {
  it('should add dollar sign prefix', () => {
    expect(formatCurrency(45)).toBe('$45');
  });

  it('should round to whole numbers', () => {
    expect(formatCurrency(45.7)).toBe('$46');
    expect(formatCurrency(45.3)).toBe('$45');
    expect(formatCurrency(45.5)).toBe('$46');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should convert negative values to $0', () => {
    expect(formatCurrency(-5)).toBe('$0');
    expect(formatCurrency(-100)).toBe('$0');
  });

  it('should handle large values', () => {
    expect(formatCurrency(999)).toBe('$999');
    expect(formatCurrency(1050)).toBe('$1050');
  });
});
