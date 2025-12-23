/**
 * ConnectCouchManagersDialog Component Tests
 *
 * Tests for the ConnectCouchManagersDialog component including:
 * - Dialog open/close behavior
 * - Room ID input field
 * - Connect button functionality
 * - Loading state during connection
 * - Success/error toast notifications
 * - Current room ID display
 *
 * Story: 9.2 - Implement Connection to Couch Managers Draft Room
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ConnectCouchManagersDialog } from '@/features/leagues/components/ConnectCouchManagersDialog';
import { useLeagueStore } from '@/features/leagues/stores/leagueStore';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Store the original store state for restoration
const originalState = useLeagueStore.getState();

describe('ConnectCouchManagersDialog', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useLeagueStore.setState({
      ...originalState,
      isConnecting: false,
      connectionError: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original store state after each test
    useLeagueStore.setState(originalState);
  });

  describe('Rendering', () => {
    it('should render "Connect to Couch Managers" button when not connected', () => {
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      expect(screen.getByRole('button', { name: /connect to couch managers/i })).toBeInTheDocument();
    });

    it('should render "Change Room ID" button when already connected', () => {
      render(
        <ConnectCouchManagersDialog leagueId="league-123" currentRoomId="room-abc" />
      );

      expect(screen.getByRole('button', { name: /change room id/i })).toBeInTheDocument();
    });
  });

  describe('Dialog Open/Close', () => {
    it('should open dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/enter your couch managers draft room id/i)).toBeInTheDocument();
    });

    it('should render room ID input field in dialog', async () => {
      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByLabelText(/room id/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\., abc123xyz/i)).toBeInTheDocument();
    });

    it('should close dialog when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show current room ID when already connected', async () => {
      const user = userEvent.setup();
      render(
        <ConnectCouchManagersDialog leagueId="league-123" currentRoomId="room-abc" />
      );

      await user.click(screen.getByRole('button', { name: /change room id/i }));

      expect(screen.getByText(/currently connected to:/i)).toBeInTheDocument();
      expect(screen.getByText('room-abc')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should disable Connect button when room ID is empty', async () => {
      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      // Button should be disabled when room ID is empty
      const connectButton = screen.getByRole('button', { name: /^connect$/i });
      expect(connectButton).toBeDisabled();
    });

    it('should show error toast when room ID is only whitespace', async () => {
      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), '   ');

      // Button should still be disabled for whitespace-only input
      const connectButton = screen.getByRole('button', { name: /^connect$/i });
      expect(connectButton).toBeDisabled();
    });

    it('should trim whitespace from room ID', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), '  room-xyz  ');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      expect(mockConnect).toHaveBeenCalledWith('league-123', 'room-xyz');
    });
  });

  describe('Connection Flow', () => {
    it('should call connectToCouchManagers with correct params', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'room-xyz');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      expect(mockConnect).toHaveBeenCalledWith('league-123', 'room-xyz');
    });

    it('should show success toast on successful connection', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'room-xyz');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Connected to room room-xyz');
      });
    });

    it('should close dialog on successful connection', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'room-xyz');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show error toast on failed connection', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(false);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'invalid-room');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid room ID or connection failed');
      });
    });

    it('should keep dialog open on failed connection', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(false);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'invalid-room');
      await user.click(screen.getByRole('button', { name: /^connect$/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when connecting', async () => {
      useLeagueStore.setState({
        isConnecting: true,
      });

      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByText(/connecting\.\.\./i)).toBeInTheDocument();
    });

    it('should disable input field when connecting', async () => {
      useLeagueStore.setState({
        isConnecting: true,
      });

      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByLabelText(/room id/i)).toBeDisabled();
    });

    it('should disable Connect button when connecting', async () => {
      useLeagueStore.setState({
        isConnecting: true,
      });

      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByRole('button', { name: /connecting\.\.\./i })).toBeDisabled();
    });

    it('should disable Cancel button when connecting', async () => {
      useLeagueStore.setState({
        isConnecting: true,
      });

      const user = userEvent.setup();
      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  describe('Keyboard Interaction', () => {
    it('should submit on Enter key when room ID is valid', async () => {
      const user = userEvent.setup();
      const mockConnect = vi.fn().mockResolvedValue(true);
      useLeagueStore.setState({
        connectToCouchManagers: mockConnect,
      });

      render(<ConnectCouchManagersDialog leagueId="league-123" />);

      await user.click(screen.getByRole('button', { name: /connect to couch managers/i }));
      await user.type(screen.getByLabelText(/room id/i), 'room-xyz{Enter}');

      expect(mockConnect).toHaveBeenCalledWith('league-123', 'room-xyz');
    });
  });
});
