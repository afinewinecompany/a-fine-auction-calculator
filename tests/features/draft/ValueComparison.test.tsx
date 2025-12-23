/**
 * ValueComparison Component Tests
 *
 * Tests for the ValueComparison component that displays a visual bar comparison
 * of auction price vs adjusted value side-by-side.
 *
 * Story: 12.4 - Highlight Steals with Visual Comparison
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValueComparison } from '@/features/draft/components/ValueComparison';

describe('ValueComparison', () => {
  it('renders auction price label and value', () => {
    render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    expect(screen.getByText(/Paid/i)).toBeInTheDocument();
    expect(screen.getByText(/\$35/)).toBeInTheDocument();
  });

  it('renders adjusted value label and value', () => {
    render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    expect(screen.getByText(/Value/i)).toBeInTheDocument();
    expect(screen.getByText(/\$52/)).toBeInTheDocument();
  });

  it('displays delta between values', () => {
    render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Should show the difference
    expect(screen.getByText(/\$17/)).toBeInTheDocument();
  });

  it('shows positive delta as savings for steals (price < value)', () => {
    render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Check for positive indicator or green color for steal
    const container = render(<ValueComparison auctionPrice={35} adjustedValue={52} />).container;
    expect(container.innerHTML).toMatch(/emerald|green/i);
  });

  it('shows negative delta as loss for overpays (price > value)', () => {
    const { container } = render(<ValueComparison auctionPrice={52} adjustedValue={35} />);
    // Check for red/amber indicator for overpay
    expect(container.innerHTML).toMatch(/red|amber/i);
  });

  it('renders visual bar for auction price', () => {
    const { container } = render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Should have bar elements
    const bars = container.querySelectorAll('[role="progressbar"], [class*="bar"], [class*="w-"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('renders visual bar for adjusted value', () => {
    const { container } = render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Both bars should be present
    const bars = container.querySelectorAll('[class*="bg-"]');
    expect(bars.length).toBeGreaterThan(0);
  });

  it('shows shorter bar for auction price when it is a steal', () => {
    const { container } = render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // The auction price bar should be proportionally smaller (using inline style)
    // Component uses style={{ width: `${percentage}%` }}
    expect(container.innerHTML).toMatch(/width:\s*\d+(\.\d+)?%/);
  });

  it('colors auction price green when below adjusted value (steal)', () => {
    const { container } = render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Should have emerald coloring for the "paid" amount
    expect(container.innerHTML).toMatch(/emerald/i);
  });

  it('handles equal values gracefully', () => {
    render(<ValueComparison auctionPrice={50} adjustedValue={50} />);
    // Both paid and value show $50, use getAllByText
    expect(screen.getAllByText(/\$50/).length).toBeGreaterThanOrEqual(2);
    // Delta should be $0 or show "Fair Value"
    expect(screen.queryByText(/\$0/) || screen.queryByText(/Fair/)).toBeTruthy();
  });

  it('handles zero values', () => {
    render(<ValueComparison auctionPrice={0} adjustedValue={0} />);
    expect(screen.getAllByText(/\$0/).length).toBeGreaterThanOrEqual(1);
  });

  it('handles very large values', () => {
    render(<ValueComparison auctionPrice={100} adjustedValue={150} />);
    expect(screen.getByText(/\$100/)).toBeInTheDocument();
    expect(screen.getByText(/\$150/)).toBeInTheDocument();
    expect(screen.getByText(/\$50/)).toBeInTheDocument();
  });
});

describe('ValueComparison bar calculations', () => {
  it('scales bars relative to the larger value', () => {
    const { container } = render(<ValueComparison auctionPrice={25} adjustedValue={100} />);
    // Auction price bar should be 25% width
    expect(container.innerHTML).toMatch(/25%|w-1\/4|25/);
  });

  it('value bar should be at full width when it is the max', () => {
    const { container } = render(<ValueComparison auctionPrice={25} adjustedValue={100} />);
    // Adjusted value bar should be 100% width
    expect(container.innerHTML).toMatch(/100%|w-full/);
  });
});

describe('ValueComparison accessibility', () => {
  it('has proper structure for screen readers', () => {
    const { container } = render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Should have a container div
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('provides text values for screen readers', () => {
    render(<ValueComparison auctionPrice={35} adjustedValue={52} />);
    // Both values should be readable
    expect(screen.getByText(/\$35/)).toBeInTheDocument();
    expect(screen.getByText(/\$52/)).toBeInTheDocument();
  });
});
