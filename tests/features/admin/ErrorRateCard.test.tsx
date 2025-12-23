/**
 * ErrorRateCard Component Tests
 *
 * Tests for the individual error rate card display component.
 *
 * Story: 13.4 - View Error Rates with Automated Alerts
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorRateCard } from '@/features/admin/components/ErrorRateCard';
import type { ErrorRate } from '@/features/admin/types/admin.types';

// Mock error rates for testing
const mockHealthyRate: ErrorRate = {
  apiName: 'Couch Managers',
  apiKey: 'couch_managers',
  errorRate24h: 2.5,
  errorCount: 5,
  totalChecks: 200,
  trend: 'stable',
  isAboveThreshold: false,
};

const mockAlertRate: ErrorRate = {
  apiName: 'Google Sheets',
  apiKey: 'google_sheets',
  errorRate24h: 7.5,
  errorCount: 15,
  totalChecks: 200,
  trend: 'up',
  isAboveThreshold: true,
};

const mockDownTrendRate: ErrorRate = {
  apiName: 'Fangraphs',
  apiKey: 'fangraphs',
  errorRate24h: 3.0,
  errorCount: 6,
  totalChecks: 200,
  trend: 'down',
  isAboveThreshold: false,
};

describe('ErrorRateCard', () => {
  describe('Basic Rendering', () => {
    it('should display API name', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.getByText('Couch Managers')).toBeInTheDocument();
    });

    it('should display error rate percentage', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.getByTestId('error-rate-value')).toHaveTextContent('2.5%');
    });

    it('should display error count', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.getByTestId('error-count')).toHaveTextContent('5 errors');
    });

    it('should display total checks', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.getByTestId('total-checks')).toHaveTextContent('200 checks');
    });

    it('should use singular form for 1 error', () => {
      const singleErrorRate = { ...mockHealthyRate, errorCount: 1 };
      render(<ErrorRateCard errorRate={singleErrorRate} />);

      expect(screen.getByTestId('error-count')).toHaveTextContent('1 error');
    });
  });

  describe('Threshold Styling', () => {
    it('should display green styling when below threshold', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      const rateValue = screen.getByTestId('error-rate-value');
      expect(rateValue).toHaveClass('text-emerald-400');
    });

    it('should display red styling when above threshold', () => {
      render(<ErrorRateCard errorRate={mockAlertRate} />);

      const rateValue = screen.getByTestId('error-rate-value');
      expect(rateValue).toHaveClass('text-red-400');
    });

    it('should show ALERT badge when above threshold', () => {
      render(<ErrorRateCard errorRate={mockAlertRate} />);

      expect(screen.getByTestId('alert-badge')).toHaveTextContent('ALERT');
    });

    it('should not show ALERT badge when below threshold', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.queryByTestId('alert-badge')).not.toBeInTheDocument();
    });

    it('should have red background when above threshold', () => {
      render(<ErrorRateCard errorRate={mockAlertRate} />);

      const card = screen.getByTestId('error-rate-card-google_sheets');
      expect(card).toHaveClass('bg-red-900/50');
    });
  });

  describe('Trend Indicators', () => {
    it('should show stable trend indicator', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      const trendIndicator = screen.getByTestId('trend-indicator');
      expect(trendIndicator).toBeInTheDocument();
    });

    it('should show up trend indicator for increasing errors', () => {
      render(<ErrorRateCard errorRate={mockAlertRate} />);

      const trendIndicator = screen.getByTestId('trend-indicator');
      expect(trendIndicator.querySelector('[aria-label="Trending up"]')).toBeInTheDocument();
    });

    it('should show down trend indicator for decreasing errors', () => {
      render(<ErrorRateCard errorRate={mockDownTrendRate} />);

      const trendIndicator = screen.getByTestId('trend-indicator');
      expect(trendIndicator.querySelector('[aria-label="Trending down"]')).toBeInTheDocument();
    });

    it('should show stable trend indicator', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      const trendIndicator = screen.getByTestId('trend-indicator');
      expect(trendIndicator.querySelector('[aria-label="Stable"]')).toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<ErrorRateCard errorRate={mockHealthyRate} onClick={handleClick} />);

      const card = screen.getByTestId('error-rate-card-couch_managers');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should show click hint when onClick provided', () => {
      const handleClick = vi.fn();
      render(<ErrorRateCard errorRate={mockHealthyRate} onClick={handleClick} />);

      expect(screen.getByText('Click to view error logs')).toBeInTheDocument();
    });

    it('should not show click hint when no onClick provided', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.queryByText('Click to view error logs')).not.toBeInTheDocument();
    });

    it('should have cursor-pointer when onClick provided', () => {
      const handleClick = vi.fn();
      render(<ErrorRateCard errorRate={mockHealthyRate} onClick={handleClick} />);

      const card = screen.getByTestId('error-rate-card-couch_managers');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should have cursor-default when no onClick provided', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      const card = screen.getByTestId('error-rate-card-couch_managers');
      expect(card).toHaveClass('cursor-default');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label with error rate information', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      const card = screen.getByTestId('error-rate-card-couch_managers');
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Couch Managers')
      );
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('2.5%')
      );
    });

    it('should indicate trend in aria-label', () => {
      render(<ErrorRateCard errorRate={mockAlertRate} />);

      const card = screen.getByTestId('error-rate-card-google_sheets');
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining('increasing')
      );
    });
  });

  describe('Data Test IDs', () => {
    it('should have correct test ID based on API key', () => {
      render(<ErrorRateCard errorRate={mockHealthyRate} />);

      expect(screen.getByTestId('error-rate-card-couch_managers')).toBeInTheDocument();
    });

    it('should use different test IDs for different APIs', () => {
      const { rerender } = render(<ErrorRateCard errorRate={mockHealthyRate} />);
      expect(screen.getByTestId('error-rate-card-couch_managers')).toBeInTheDocument();

      rerender(<ErrorRateCard errorRate={mockAlertRate} />);
      expect(screen.getByTestId('error-rate-card-google_sheets')).toBeInTheDocument();
    });
  });
});
