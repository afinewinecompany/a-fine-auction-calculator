/**
 * Tests for ValueIndicator Component
 *
 * Story: 6.6 - Implement Color-Coded Value Indicators
 *
 * Tests the visual indicator component that displays draft pick
 * value classification (steal, fair, overpay) with accessibility support.
 */

import { render, screen } from '@testing-library/react';
import {
  ValueIndicator,
  getValueRowBackground,
} from '@/features/draft/components/ValueIndicator';

describe('ValueIndicator', () => {
  // ============================================================================
  // Rendering Tests - Undrafted Players
  // ============================================================================
  describe('undrafted players', () => {
    it('should return null when actualPrice is undefined', () => {
      const { container } = render(
        <ValueIndicator actualPrice={undefined} adjustedValue={45} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should not render any indicator for undrafted players', () => {
      render(<ValueIndicator actualPrice={undefined} adjustedValue={45} />);
      expect(screen.queryByTestId('value-indicator-label')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Steal Classification Tests
  // ============================================================================
  describe('steal classification', () => {
    it('should display "Steal" label for >10% under value', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Steal');
    });

    it('should apply emerald text color for steals', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveClass('text-emerald-400');
    });

    it('should have correct aria-label for steals', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Steal'));
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('$35'));
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('$45'));
    });
  });

  // ============================================================================
  // Fair Value Classification Tests
  // ============================================================================
  describe('fair value classification', () => {
    it('should display "Fair Value" label for within ±10%', () => {
      render(<ValueIndicator actualPrice={45} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });

    it('should apply yellow text color for fair value', () => {
      render(<ValueIndicator actualPrice={45} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveClass('text-yellow-400');
    });

    it('should show fair value for 10% under', () => {
      render(<ValueIndicator actualPrice={45} adjustedValue={50} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });

    it('should show fair value for 10% over', () => {
      render(<ValueIndicator actualPrice={55} adjustedValue={50} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Fair Value');
    });
  });

  // ============================================================================
  // Overpay Classification Tests
  // ============================================================================
  describe('overpay classification', () => {
    it('should display "Overpay" label for >10% over value', () => {
      render(<ValueIndicator actualPrice={55} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveTextContent('Overpay');
    });

    it('should apply red text color for overpay', () => {
      render(<ValueIndicator actualPrice={55} adjustedValue={45} />);
      expect(screen.getByTestId('value-indicator-label')).toHaveClass('text-red-400');
    });

    it('should have correct aria-label for overpay', () => {
      render(<ValueIndicator actualPrice={55} adjustedValue={45} />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('Overpay'));
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('over'));
    });
  });

  // ============================================================================
  // Price Comparison Display Tests
  // ============================================================================
  describe('price comparison', () => {
    it('should not show price comparison by default', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      expect(screen.queryByTestId('value-indicator-comparison')).not.toBeInTheDocument();
    });

    it('should show price comparison when enabled', () => {
      render(
        <ValueIndicator
          actualPrice={35}
          adjustedValue={45}
          showPriceComparison={true}
        />
      );
      expect(screen.getByTestId('value-indicator-comparison')).toBeInTheDocument();
    });

    it('should format price comparison correctly', () => {
      render(
        <ValueIndicator
          actualPrice={35}
          adjustedValue={45}
          showPriceComparison={true}
        />
      );
      const comparison = screen.getByTestId('value-indicator-comparison');
      expect(comparison).toHaveTextContent('$35');
      expect(comparison).toHaveTextContent('(adj: $45)');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('accessibility', () => {
    it('should have role="status" for screen reader announcements', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should include percentage in aria-label', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      const indicator = screen.getByRole('status');
      // 35 vs 45 = 22% under
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('22%'));
    });

    it('should indicate direction (under/over) in aria-label', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('under'));
    });

    it('should indicate "over" for overpay', () => {
      render(<ValueIndicator actualPrice={55} adjustedValue={45} />);
      const indicator = screen.getByRole('status');
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('over'));
    });

    it('should provide text label not just color', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      // Text label must be visible, not just color
      expect(screen.getByText('Steal')).toBeVisible();
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================
  describe('styling', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <ValueIndicator
          actualPrice={35}
          adjustedValue={45}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply base flex styling', () => {
      const { container } = render(
        <ValueIndicator actualPrice={35} adjustedValue={45} />
      );
      expect(container.firstChild).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('should apply badge styling to label', () => {
      render(<ValueIndicator actualPrice={35} adjustedValue={45} />);
      const label = screen.getByTestId('value-indicator-label');
      expect(label).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-0.5', 'rounded', 'text-xs', 'font-medium');
    });
  });
});

// ============================================================================
// getValueRowBackground Tests
// ============================================================================
describe('getValueRowBackground', () => {
  it('should return emerald background for steal', () => {
    expect(getValueRowBackground(35, 45)).toBe('bg-emerald-900/20');
  });

  it('should return yellow background for fair value', () => {
    expect(getValueRowBackground(45, 45)).toBe('bg-yellow-900/20');
  });

  it('should return red background for overpay', () => {
    expect(getValueRowBackground(55, 45)).toBe('bg-red-900/20');
  });

  it('should return empty string for undrafted', () => {
    expect(getValueRowBackground(undefined, 45)).toBe('');
  });
});
