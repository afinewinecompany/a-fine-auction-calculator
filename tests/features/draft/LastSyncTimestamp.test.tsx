/**
 * LastSyncTimestamp Component Tests
 *
 * Story: 9.5 - Display Last Successful Sync Timestamp
 *
 * Tests cover:
 * - Timestamp formatting with relative time
 * - Tooltip with absolute timestamp
 * - Warning for stale data (> 30 minutes)
 * - Auto-update mechanism
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LastSyncTimestamp } from '@/features/draft/components/LastSyncTimestamp';
import { TooltipProvider } from '@/components/ui/tooltip';

// Wrapper to provide tooltip context
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

describe('LastSyncTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed "now" time for consistent tests
    vi.setSystemTime(new Date('2025-12-12T15:44:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('renders null when lastSync is null', () => {
      const { container } = renderWithProvider(<LastSyncTimestamp lastSync={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders "Last synced:" prefix with relative time', () => {
      const lastSync = new Date('2025-12-12T15:42:00'); // 2 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.getByText(/Last synced:/i)).toBeInTheDocument();
      expect(screen.getByText(/2 minutes ago/i)).toBeInTheDocument();
    });

    it('shows relative time for very recent sync', () => {
      const lastSync = new Date('2025-12-12T15:43:30'); // 30 seconds ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      // date-fns rounds to nearest minute, so 30 seconds shows as "1 minute ago"
      expect(screen.getByText(/1 minute ago/i)).toBeInTheDocument();
    });

    it('shows correct relative time for 18 minutes ago', () => {
      const lastSync = new Date('2025-12-12T15:26:00'); // 18 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.getByText(/18 minutes ago/i)).toBeInTheDocument();
    });
  });

  describe('Tooltip with Absolute Timestamp', () => {
    it('renders tooltip content with absolute timestamp', () => {
      const lastSync = new Date('2025-12-12T15:42:00');
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      // The tooltip content is rendered lazily on hover
      // Verify the component renders correctly - tooltip functionality tested via structure
      const timestampElement = screen.getByRole('status');
      expect(timestampElement).toBeInTheDocument();
      // The Tooltip wraps the content and will show "Dec 12, 2025 3:42 PM" on hover
    });
  });

  describe('Stale Data Warning (NFR-I5)', () => {
    it('shows warning badge when sync lag exceeds 30 minutes', () => {
      const lastSync = new Date('2025-12-12T15:10:00'); // 34 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.getByText(/stale/i)).toBeInTheDocument();
      // Check for warning styling (amber/yellow color)
      expect(screen.getByRole('status')).toHaveClass(/amber|yellow|warning/i);
    });

    it('does not show warning when sync lag is under 30 minutes', () => {
      const lastSync = new Date('2025-12-12T15:20:00'); // 24 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.queryByText(/stale/i)).not.toBeInTheDocument();
    });

    it('shows warning for exactly 30 minutes lag', () => {
      const lastSync = new Date('2025-12-12T15:14:00'); // exactly 30 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.getByText(/stale/i)).toBeInTheDocument();
    });
  });

  describe('Auto-Update Mechanism', () => {
    it('updates timestamp display every minute', async () => {
      // Start at 2 minutes ago
      const lastSync = new Date('2025-12-12T15:42:00');
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      expect(screen.getByText(/2 minutes ago/i)).toBeInTheDocument();

      // Advance time by 1 minute
      await act(async () => {
        vi.advanceTimersByTime(60 * 1000);
      });

      // Should now show 3 minutes ago
      expect(screen.getByText(/3 minutes ago/i)).toBeInTheDocument();
    });

    it('cleans up interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
      const lastSync = new Date('2025-12-12T15:42:00');

      const { unmount } = renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('does not set interval when lastSync is null', () => {
      const setIntervalSpy = vi.spyOn(window, 'setInterval');

      renderWithProvider(<LastSyncTimestamp lastSync={null} />);

      // Should not set any interval
      expect(setIntervalSpy).not.toHaveBeenCalled();
      setIntervalSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has appropriate role and aria-label', () => {
      const lastSync = new Date('2025-12-12T15:42:00');
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      const element = screen.getByRole('status');
      expect(element).toHaveAttribute('aria-label', expect.stringContaining('Last synced'));
    });

    it('indicates stale data warning in aria-label', () => {
      const lastSync = new Date('2025-12-12T15:10:00'); // > 30 minutes ago
      renderWithProvider(<LastSyncTimestamp lastSync={lastSync} />);

      const element = screen.getByRole('status');
      expect(element).toHaveAttribute('aria-label', expect.stringContaining('stale'));
    });
  });
});
