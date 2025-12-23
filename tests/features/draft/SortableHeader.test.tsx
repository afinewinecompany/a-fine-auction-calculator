/**
 * Tests for SortableHeader Component
 *
 * Story: 6.4 - Implement Sortable Table Columns
 *
 * Tests the sortable column header component.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortableHeader } from '@/features/draft/components/SortableHeader';
import type { SortState } from '@/features/draft/types/sort.types';

describe('SortableHeader', () => {
  const defaultSort: SortState = {
    column: 'adjustedValue',
    direction: 'desc',
  };

  // ============================================================================
  // Rendering Tests
  // ============================================================================
  describe('rendering', () => {
    it('should render the column label', () => {
      const onSort = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={defaultSort}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByText('Player')).toBeInTheDocument();
    });

    it('should render as a button for accessibility', () => {
      const onSort = vi.fn();
      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={defaultSort}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByRole('button', { name: /sort by player/i })).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Sort Direction Arrow Tests
  // ============================================================================
  describe('sort direction indicator', () => {
    it('should show ascending arrow when sorted ascending', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'name', direction: 'asc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByTestId('sort-asc-icon')).toBeInTheDocument();
    });

    it('should show descending arrow when sorted descending', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'name', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      expect(screen.getByTestId('sort-desc-icon')).toBeInTheDocument();
    });

    it('should not show directional arrow for non-active column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      expect(screen.queryByTestId('sort-asc-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sort-desc-icon')).not.toBeInTheDocument();
    });

    it('should show inactive sort indicator for non-active column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      // Inactive columns show the up-down chevron (hidden by default, shown on hover)
      expect(screen.getByTestId('sort-inactive-icon')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Interaction Tests
  // ============================================================================
  describe('interactions', () => {
    it('should call onSort with column when clicked', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={defaultSort}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={defaultSort}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="team"
                label="Team"
                currentSort={defaultSort}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(onSort).toHaveBeenCalledWith('team');
    });
  });

  // ============================================================================
  // Styling Tests
  // ============================================================================
  describe('styling', () => {
    it('should highlight active sort column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'name', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).toHaveClass('text-slate-100');
    });

    it('should apply right alignment for numerical columns', () => {
      const onSort = vi.fn();

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="adjustedValue"
                label="Adj. Value"
                currentSort={defaultSort}
                onSort={onSort}
                align="right"
              />
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).toHaveClass('text-right');
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================
  describe('accessibility', () => {
    it('should have aria-sort="ascending" for active ascending column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'name', direction: 'asc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should have aria-sort="descending" for active descending column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'name', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).toHaveAttribute('aria-sort', 'descending');
    });

    it('should not have aria-sort for inactive column', () => {
      const onSort = vi.fn();
      const sortState: SortState = { column: 'adjustedValue', direction: 'desc' };

      render(
        <table>
          <thead>
            <tr>
              <SortableHeader
                column="name"
                label="Player"
                currentSort={sortState}
                onSort={onSort}
              />
            </tr>
          </thead>
        </table>
      );

      const header = screen.getByRole('columnheader');
      expect(header).not.toHaveAttribute('aria-sort');
    });
  });
});
