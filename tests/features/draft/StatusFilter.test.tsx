/**
 * StatusFilter Component Tests
 *
 * Tests for the status filter toggle component.
 *
 * Story: 6.8 - Implement Filter by Draft Status
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatusFilter } from '@/features/draft/components/StatusFilter';
import type { FilterCounts, StatusFilter as StatusFilterType } from '@/features/draft/types/draft.types';

const defaultCounts: FilterCounts = {
  all: 250,
  available: 180,
  myTeam: 8,
};

describe('StatusFilter', () => {
  describe('Rendering', () => {
    it('renders all three filter options', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      expect(screen.getByTestId('status-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-available')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-my-team')).toBeInTheDocument();
    });

    it('displays correct labels', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('My Team')).toBeInTheDocument();
    });

    it('displays counts for each option', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('marks "all" as active when value is "all"', () => {
      render(<StatusFilter value="all" onChange={vi.fn()} counts={defaultCounts} />);

      const allButton = screen.getByTestId('status-filter-all');
      expect(allButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks "available" as active when value is "available"', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      const availableButton = screen.getByTestId('status-filter-available');
      expect(availableButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks "my-team" as active when value is "my-team"', () => {
      render(<StatusFilter value="my-team" onChange={vi.fn()} counts={defaultCounts} />);

      const myTeamButton = screen.getByTestId('status-filter-my-team');
      expect(myTeamButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('only marks one option as active at a time', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      const allButton = screen.getByTestId('status-filter-all');
      const availableButton = screen.getByTestId('status-filter-available');
      const myTeamButton = screen.getByTestId('status-filter-my-team');

      expect(allButton).toHaveAttribute('aria-pressed', 'false');
      expect(availableButton).toHaveAttribute('aria-pressed', 'true');
      expect(myTeamButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Interactions', () => {
    it('calls onChange with "all" when clicking All button', () => {
      const onChange = vi.fn();
      render(<StatusFilter value="available" onChange={onChange} counts={defaultCounts} />);

      fireEvent.click(screen.getByTestId('status-filter-all'));
      expect(onChange).toHaveBeenCalledWith('all');
    });

    it('calls onChange with "available" when clicking Available button', () => {
      const onChange = vi.fn();
      render(<StatusFilter value="all" onChange={onChange} counts={defaultCounts} />);

      fireEvent.click(screen.getByTestId('status-filter-available'));
      expect(onChange).toHaveBeenCalledWith('available');
    });

    it('calls onChange with "my-team" when clicking My Team button', () => {
      const onChange = vi.fn();
      render(<StatusFilter value="available" onChange={onChange} counts={defaultCounts} />);

      fireEvent.click(screen.getByTestId('status-filter-my-team'));
      expect(onChange).toHaveBeenCalledWith('my-team');
    });

    it('calls onChange even when clicking already active button', () => {
      const onChange = vi.fn();
      render(<StatusFilter value="available" onChange={onChange} counts={defaultCounts} />);

      fireEvent.click(screen.getByTestId('status-filter-available'));
      expect(onChange).toHaveBeenCalledWith('available');
    });
  });

  describe('Accessibility', () => {
    it('has correct role on container', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      const container = screen.getByRole('group');
      expect(container).toHaveAttribute('aria-label', 'Filter players by status');
    });

    it('has aria-labels with counts on buttons', () => {
      render(<StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />);

      expect(screen.getByLabelText('All (250 players)')).toBeInTheDocument();
      expect(screen.getByLabelText('Available (180 players)')).toBeInTheDocument();
      expect(screen.getByLabelText('My Team (8 players)')).toBeInTheDocument();
    });
  });

  describe('Dynamic Counts', () => {
    it('updates displayed counts when props change', () => {
      const { rerender } = render(
        <StatusFilter value="available" onChange={vi.fn()} counts={defaultCounts} />
      );

      expect(screen.getByText('250')).toBeInTheDocument();

      const newCounts: FilterCounts = { all: 200, available: 150, myTeam: 10 };
      rerender(<StatusFilter value="available" onChange={vi.fn()} counts={newCounts} />);

      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('handles zero counts', () => {
      const zeroCounts: FilterCounts = { all: 0, available: 0, myTeam: 0 };
      render(<StatusFilter value="available" onChange={vi.fn()} counts={zeroCounts} />);

      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(3);
    });
  });
});
