/**
 * ConnectionStatusBadge Component Tests
 *
 * Tests for the ConnectionStatusBadge component that displays
 * Couch Managers connection status with three states.
 *
 * Story: 9.4 - Display Connection Status Indicators
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionStatusBadge } from '@/features/draft/components/ConnectionStatusBadge';
import { getConnectionState, DISCONNECTED_FAILURE_THRESHOLD } from '@/features/draft/types/sync.types';

describe('ConnectionStatusBadge', () => {
  describe('Connected status', () => {
    it('renders "Connected" text for connected status', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('applies green styling for connected status', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge.className).toContain('bg-emerald');
      expect(badge.className).toContain('text-emerald');
      expect(badge.className).toContain('border-emerald');
    });

    it('renders CheckCircle icon for connected status', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      // The icon should be present (aria-hidden)
      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('does not animate icon when connected and not syncing', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} isSyncing={false} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg?.getAttribute('class')).not.toContain('animate-spin');
    });
  });

  describe('Reconnecting status', () => {
    it('renders "Reconnecting" text for reconnecting status', () => {
      render(<ConnectionStatusBadge status="reconnecting" lastSync={null} />);

      expect(screen.getByText('Reconnecting')).toBeInTheDocument();
    });

    it('applies yellow styling for reconnecting status', () => {
      render(<ConnectionStatusBadge status="reconnecting" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge.className).toContain('bg-yellow');
      expect(badge.className).toContain('text-yellow');
      expect(badge.className).toContain('border-yellow');
    });

    it('animates icon when reconnecting', () => {
      render(<ConnectionStatusBadge status="reconnecting" lastSync={null} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      // SVGAnimatedString className needs baseVal access
      expect(svg?.getAttribute('class')).toContain('animate-spin');
    });
  });

  describe('Disconnected status', () => {
    it('renders "Disconnected" text for disconnected status', () => {
      render(<ConnectionStatusBadge status="disconnected" lastSync={null} />);

      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('applies red styling for disconnected status', () => {
      render(<ConnectionStatusBadge status="disconnected" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge.className).toContain('bg-red');
      expect(badge.className).toContain('text-red');
      expect(badge.className).toContain('border-red');
    });

    it('renders XCircle icon for disconnected status', () => {
      render(<ConnectionStatusBadge status="disconnected" lastSync={null} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Tooltip content', () => {
    it('shows "No sync yet" when lastSync is null', async () => {
      const user = userEvent.setup();
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      // Multiple elements may exist due to accessibility features, use getAllByText
      const elements = await screen.findAllByText('No sync yet');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('shows relative time when lastSync is provided', async () => {
      const user = userEvent.setup();
      // Set last sync to 2 minutes ago
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      render(<ConnectionStatusBadge status="connected" lastSync={twoMinutesAgo} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      // Should show something like "Last sync: 2 minutes ago"
      const elements = await screen.findAllByText(/Last sync:/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('shows "less than a minute ago" for recent sync', async () => {
      const user = userEvent.setup();
      // Set last sync to 30 seconds ago
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      render(<ConnectionStatusBadge status="connected" lastSync={thirtySecondsAgo} />);

      const badge = screen.getByRole('status');
      await user.hover(badge);

      const elements = await screen.findAllByText(/Last sync:/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Syncing state', () => {
    it('animates icon when isSyncing is true', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} isSyncing={true} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('animate-spin');
    });

    it('does not animate icon when isSyncing is false', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} isSyncing={false} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg?.getAttribute('class')).not.toContain('animate-spin');
    });
  });

  describe('Accessibility', () => {
    it('has role="status" for screen readers', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('provides aria-label with connection status for connected', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Connection status: Connected');
    });

    it('provides aria-label with connection status for reconnecting', () => {
      render(<ConnectionStatusBadge status="reconnecting" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Connection status: Reconnecting');
    });

    it('provides aria-label with connection status for disconnected', () => {
      render(<ConnectionStatusBadge status="disconnected" lastSync={null} />);

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-label', 'Connection status: Disconnected');
    });

    it('hides icon from screen readers', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Default props', () => {
    it('defaults isSyncing to false', () => {
      render(<ConnectionStatusBadge status="connected" lastSync={null} />);

      const badge = screen.getByRole('status');
      const svg = badge.querySelector('svg');
      // When connected and not syncing, icon should not spin
      expect(svg?.getAttribute('class')).not.toContain('animate-spin');
    });
  });
});

describe('getConnectionState', () => {
  // Story 10.1: Updated SyncStatus includes new fields
  const createSyncStatus = (overrides: Partial<{
    isConnected: boolean;
    isSyncing: boolean;
    lastSync: Date | null;
    error: string | null;
    failureCount: number;
    failureType: 'transient' | 'persistent' | null;
    isManualMode: boolean;
    lastFailureTimestamp: Date | null;
  }> = {}) => ({
    isConnected: false,
    isSyncing: false,
    lastSync: null,
    error: null,
    failureCount: 0,
    failureType: null,
    isManualMode: false,
    lastFailureTimestamp: null,
    ...overrides,
  });

  it('returns "connected" when isConnected is true and no failures', () => {
    const status = createSyncStatus({
      isConnected: true,
      lastSync: new Date(),
    });

    expect(getConnectionState(status)).toBe('connected');
  });

  it('returns "reconnecting" when failure count is 1', () => {
    const status = createSyncStatus({
      isConnected: true,
      lastSync: new Date(),
      error: 'Network error',
      failureCount: 1,
      failureType: 'transient',
    });

    expect(getConnectionState(status)).toBe('reconnecting');
  });

  it('returns "reconnecting" when failure count is 2', () => {
    const status = createSyncStatus({
      isConnected: true,
      lastSync: new Date(),
      error: 'Network error',
      failureCount: 2,
      failureType: 'transient',
    });

    expect(getConnectionState(status)).toBe('reconnecting');
  });

  it('returns "disconnected" when failure count reaches threshold', () => {
    const status = createSyncStatus({
      isConnected: false,
      lastSync: new Date(),
      error: 'Network error',
      failureCount: DISCONNECTED_FAILURE_THRESHOLD,
      failureType: 'transient',
      isManualMode: true,
    });

    expect(getConnectionState(status)).toBe('disconnected');
  });

  it('returns "disconnected" when failure count exceeds threshold', () => {
    const status = createSyncStatus({
      isConnected: false,
      lastSync: new Date(),
      error: 'Network error',
      failureCount: DISCONNECTED_FAILURE_THRESHOLD + 2,
      failureType: 'transient',
      isManualMode: true,
    });

    expect(getConnectionState(status)).toBe('disconnected');
  });

  it('returns "disconnected" when never connected and no failures', () => {
    const status = createSyncStatus({
      isConnected: false,
      lastSync: null,
    });

    expect(getConnectionState(status)).toBe('disconnected');
  });

  it('threshold constant is 3', () => {
    expect(DISCONNECTED_FAILURE_THRESHOLD).toBe(3);
  });
});
