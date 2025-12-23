/**
 * getConnectionState Function Tests
 *
 * Story: 10.2 - Enable Manual Sync Mode
 *
 * Tests for:
 * - Manual mode state detection
 * - State priority (manual > other states)
 * - All connection states
 */

import {
  getConnectionState,
  DEFAULT_SYNC_STATUS,
  DISCONNECTED_FAILURE_THRESHOLD,
  type SyncStatus,
} from '@/features/draft/types/sync.types';

describe('getConnectionState', () => {
  describe('Manual Mode (Story 10.2)', () => {
    it('should return "manual" when isManualMode is true', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
      };

      expect(getConnectionState(status)).toBe('manual');
    });

    it('should return "manual" even when isConnected is true', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
        isConnected: true,
      };

      expect(getConnectionState(status)).toBe('manual');
    });

    it('should return "manual" regardless of failure count', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
        failureCount: 0,
      };

      expect(getConnectionState(status)).toBe('manual');
    });

    it('should prioritize manual mode over disconnected state', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
        failureCount: DISCONNECTED_FAILURE_THRESHOLD + 1,
        isConnected: false,
      };

      expect(getConnectionState(status)).toBe('manual');
    });

    it('should prioritize manual mode over reconnecting state', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
        failureCount: 1,
        isConnected: false,
      };

      expect(getConnectionState(status)).toBe('manual');
    });
  });

  describe('Connected State', () => {
    it('should return "connected" when isConnected and no failures', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: true,
        lastSync: new Date(),
        failureCount: 0,
      };

      expect(getConnectionState(status)).toBe('connected');
    });
  });

  describe('Reconnecting State', () => {
    it('should return "reconnecting" with 1 failure', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: false,
        failureCount: 1,
        lastSync: new Date(),
      };

      expect(getConnectionState(status)).toBe('reconnecting');
    });

    it('should return "reconnecting" with 2 failures', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: false,
        failureCount: 2,
        lastSync: new Date(),
      };

      expect(getConnectionState(status)).toBe('reconnecting');
    });
  });

  describe('Disconnected State', () => {
    it('should return "disconnected" at failure threshold', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: false,
        failureCount: DISCONNECTED_FAILURE_THRESHOLD,
        isManualMode: false,
      };

      expect(getConnectionState(status)).toBe('disconnected');
    });

    it('should return "disconnected" above failure threshold', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: false,
        failureCount: DISCONNECTED_FAILURE_THRESHOLD + 1,
        isManualMode: false,
      };

      expect(getConnectionState(status)).toBe('disconnected');
    });

    it('should return "disconnected" when never connected', () => {
      const status: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: false,
        failureCount: 0,
        lastSync: null,
        isManualMode: false,
      };

      expect(getConnectionState(status)).toBe('disconnected');
    });
  });

  describe('State Transitions', () => {
    it('should transition from connected to manual', () => {
      const connected: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isConnected: true,
        isManualMode: false,
      };
      expect(getConnectionState(connected)).toBe('connected');

      const manual: SyncStatus = {
        ...connected,
        isManualMode: true,
      };
      expect(getConnectionState(manual)).toBe('manual');
    });

    it('should transition from reconnecting to manual', () => {
      const reconnecting: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        failureCount: 2,
        isConnected: false,
        isManualMode: false,
        lastSync: new Date(),
      };
      expect(getConnectionState(reconnecting)).toBe('reconnecting');

      const manual: SyncStatus = {
        ...reconnecting,
        isManualMode: true,
      };
      expect(getConnectionState(manual)).toBe('manual');
    });

    it('should transition from manual back to connected when isManualMode is false', () => {
      const manual: SyncStatus = {
        ...DEFAULT_SYNC_STATUS,
        isManualMode: true,
        isConnected: false,
      };
      expect(getConnectionState(manual)).toBe('manual');

      const connected: SyncStatus = {
        ...manual,
        isManualMode: false,
        isConnected: true,
        failureCount: 0,
        lastSync: new Date(),
      };
      expect(getConnectionState(connected)).toBe('connected');
    });
  });
});
