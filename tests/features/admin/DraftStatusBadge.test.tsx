/**
 * DraftStatusBadge Component Tests
 *
 * Tests for the color-coded status badge component.
 *
 * Story: 13.2 - Display Active Drafts List
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraftStatusBadge } from '@/features/admin/components/DraftStatusBadge';
import type { DraftStatus } from '@/features/admin/types/admin.types';

describe('DraftStatusBadge', () => {
  describe('Active Status', () => {
    it('should render "Active" label for active status', () => {
      render(<DraftStatusBadge status="active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should have emerald background for active status', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-emerald-500');
      expect(badge).toHaveClass('text-white');
    });

    it('should have correct aria-label for active status', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Draft status: Active');
    });
  });

  describe('Paused Status', () => {
    it('should render "Paused" label for paused status', () => {
      render(<DraftStatusBadge status="paused" />);

      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('should have yellow background for paused status', () => {
      render(<DraftStatusBadge status="paused" />);

      const badge = screen.getByText('Paused');
      expect(badge).toHaveClass('bg-yellow-500');
      expect(badge).toHaveClass('text-black');
    });

    it('should have correct aria-label for paused status', () => {
      render(<DraftStatusBadge status="paused" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Draft status: Paused');
    });
  });

  describe('Error Status', () => {
    it('should render "Error" label for error status', () => {
      render(<DraftStatusBadge status="error" />);

      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should have red background for error status', () => {
      render(<DraftStatusBadge status="error" />);

      const badge = screen.getByText('Error');
      expect(badge).toHaveClass('bg-red-500');
      expect(badge).toHaveClass('text-white');
    });

    it('should have correct aria-label for error status', () => {
      render(<DraftStatusBadge status="error" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Draft status: Error');
    });
  });

  describe('Completed Status', () => {
    it('should render "Completed" label for completed status', () => {
      render(<DraftStatusBadge status="completed" />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should have gray background for completed status', () => {
      render(<DraftStatusBadge status="completed" />);

      const badge = screen.getByText('Completed');
      expect(badge).toHaveClass('bg-slate-600');
      expect(badge).toHaveClass('text-white');
    });

    it('should have correct aria-label for completed status', () => {
      render(<DraftStatusBadge status="completed" />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Draft status: Completed');
    });
  });

  describe('Styling', () => {
    it('should have rounded-full class', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('rounded-full');
    });

    it('should have proper padding', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('px-3');
      expect(badge).toHaveClass('py-1');
    });

    it('should have semibold font weight', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('font-semibold');
    });

    it('should have xs text size', () => {
      render(<DraftStatusBadge status="active" />);

      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('text-xs');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      render(<DraftStatusBadge status="active" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it.each<DraftStatus>(['active', 'paused', 'error', 'completed'])(
      'should be accessible for %s status',
      (status) => {
        render(<DraftStatusBadge status={status} />);

        const badge = screen.getByRole('status');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('aria-label');
      }
    );
  });
});
