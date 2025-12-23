/**
 * Draft Store Failure Tracking Tests
 *
 * Story: 10.1 - Detect API Connection Failures
 *
 * Tests for:
 * - Sync status state management
 * - Failure count incrementing
 * - Failure type tracking
 * - Manual mode enabling/disabling
 * - Failure count reset on success
 * - Persistence of sync status
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDraftStore } from '@/features/draft/stores/draftStore';
import { DEFAULT_SYNC_STATUS, DISCONNECTED_FAILURE_THRESHOLD } from '@/features/draft/types/sync.types';

describe('draftStore - Failure Tracking (Story 10.1)', () => {
  const testLeagueId = 'test-league-123';

  beforeEach(() => {
    // Reset the store before each test
    useDraftStore.setState({
      drafts: {},
      sortState: { column: 'adjustedValue', direction: 'desc' },
      filterState: { status: 'available', searchTerm: '' },
      syncStatus: {},
    });
  });

  describe('getSyncStatus', () => {
    it('should return DEFAULT_SYNC_STATUS for unknown league', () => {
      const { getSyncStatus } = useDraftStore.getState();
      const status = getSyncStatus('unknown-league');

      expect(status).toEqual(DEFAULT_SYNC_STATUS);
      expect(status.failureCount).toBe(0);
      expect(status.isManualMode).toBe(false);
      expect(status.failureType).toBeNull();
    });

    it('should return stored status for known league', () => {
      const { updateSyncStatus, getSyncStatus } = useDraftStore.getState();

      updateSyncStatus(testLeagueId, { isConnected: true, failureCount: 2 });

      const status = getSyncStatus(testLeagueId);
      expect(status.isConnected).toBe(true);
      expect(status.failureCount).toBe(2);
    });
  });

  describe('updateSyncStatus', () => {
    it('should update partial sync status', () => {
      const { updateSyncStatus, getSyncStatus } = useDraftStore.getState();

      updateSyncStatus(testLeagueId, { isConnected: true });

      const status = getSyncStatus(testLeagueId);
      expect(status.isConnected).toBe(true);
      expect(status.failureCount).toBe(0); // Preserved from default
    });

    it('should merge with existing status', () => {
      const { updateSyncStatus, getSyncStatus } = useDraftStore.getState();

      updateSyncStatus(testLeagueId, { isConnected: true, isSyncing: true });
      updateSyncStatus(testLeagueId, { isSyncing: false });

      const status = getSyncStatus(testLeagueId);
      expect(status.isConnected).toBe(true); // Preserved
      expect(status.isSyncing).toBe(false); // Updated
    });
  });

  describe('incrementFailureCount', () => {
    it('should increment failure count by 1', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Network error');

      const status = getSyncStatus(testLeagueId);
      expect(status.failureCount).toBe(1);
    });

    it('should set failure type', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Timeout');

      const status = getSyncStatus(testLeagueId);
      expect(status.failureType).toBe('transient');
    });

    it('should set error message', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Connection timed out');

      const status = getSyncStatus(testLeagueId);
      expect(status.error).toBe('Connection timed out');
    });

    it('should set lastFailureTimestamp', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();
      const beforeTime = new Date();

      incrementFailureCount(testLeagueId, 'transient', 'Error');

      const status = getSyncStatus(testLeagueId);
      expect(status.lastFailureTimestamp).toBeDefined();
      expect(status.lastFailureTimestamp!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });

    it('should set isConnected to false', () => {
      const { updateSyncStatus, incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      // First set as connected
      updateSyncStatus(testLeagueId, { isConnected: true });
      expect(getSyncStatus(testLeagueId).isConnected).toBe(true);

      // Then increment failure
      incrementFailureCount(testLeagueId, 'transient', 'Error');

      expect(getSyncStatus(testLeagueId).isConnected).toBe(false);
    });

    it('should enable manual mode for persistent errors', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'persistent', 'Room not found');

      const status = getSyncStatus(testLeagueId);
      expect(status.isManualMode).toBe(true);
    });

    it('should enable manual mode after 3 consecutive transient failures (NFR-I3)', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      // First two failures - manual mode should NOT be enabled
      incrementFailureCount(testLeagueId, 'transient', 'Error 1');
      expect(getSyncStatus(testLeagueId).isManualMode).toBe(false);

      incrementFailureCount(testLeagueId, 'transient', 'Error 2');
      expect(getSyncStatus(testLeagueId).isManualMode).toBe(false);

      // Third failure - manual mode SHOULD be enabled
      incrementFailureCount(testLeagueId, 'transient', 'Error 3');
      expect(getSyncStatus(testLeagueId).isManualMode).toBe(true);
      expect(getSyncStatus(testLeagueId).failureCount).toBe(3);
    });

    it('should track consecutive failures', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Error 1');
      expect(getSyncStatus(testLeagueId).failureCount).toBe(1);

      incrementFailureCount(testLeagueId, 'transient', 'Error 2');
      expect(getSyncStatus(testLeagueId).failureCount).toBe(2);

      incrementFailureCount(testLeagueId, 'transient', 'Error 3');
      expect(getSyncStatus(testLeagueId).failureCount).toBe(3);
    });
  });

  describe('resetFailureCount', () => {
    it('should reset failure count to 0', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Error');
      incrementFailureCount(testLeagueId, 'transient', 'Error');
      expect(getSyncStatus(testLeagueId).failureCount).toBe(2);

      resetFailureCount(testLeagueId);

      expect(getSyncStatus(testLeagueId).failureCount).toBe(0);
    });

    it('should clear failure type', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Error');
      expect(getSyncStatus(testLeagueId).failureType).toBe('transient');

      resetFailureCount(testLeagueId);

      expect(getSyncStatus(testLeagueId).failureType).toBeNull();
    });

    it('should clear error message', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Some error message');
      expect(getSyncStatus(testLeagueId).error).toBe('Some error message');

      resetFailureCount(testLeagueId);

      expect(getSyncStatus(testLeagueId).error).toBeNull();
    });

    it('should clear lastFailureTimestamp', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Error');
      expect(getSyncStatus(testLeagueId).lastFailureTimestamp).not.toBeNull();

      resetFailureCount(testLeagueId);

      expect(getSyncStatus(testLeagueId).lastFailureTimestamp).toBeNull();
    });

    it('should set isConnected to true', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();

      incrementFailureCount(testLeagueId, 'transient', 'Error');
      expect(getSyncStatus(testLeagueId).isConnected).toBe(false);

      resetFailureCount(testLeagueId);

      expect(getSyncStatus(testLeagueId).isConnected).toBe(true);
    });

    it('should set lastSync timestamp', () => {
      const { resetFailureCount, getSyncStatus } = useDraftStore.getState();
      const beforeTime = new Date();

      resetFailureCount(testLeagueId);

      const status = getSyncStatus(testLeagueId);
      expect(status.lastSync).toBeDefined();
      expect(status.lastSync!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    });
  });

  describe('enableManualMode', () => {
    it('should enable manual mode', () => {
      const { enableManualMode, getSyncStatus } = useDraftStore.getState();

      enableManualMode(testLeagueId);

      expect(getSyncStatus(testLeagueId).isManualMode).toBe(true);
    });

    it('should preserve other status fields', () => {
      const { updateSyncStatus, enableManualMode, getSyncStatus } = useDraftStore.getState();

      updateSyncStatus(testLeagueId, { failureCount: 2, error: 'Previous error' });
      enableManualMode(testLeagueId);

      const status = getSyncStatus(testLeagueId);
      expect(status.isManualMode).toBe(true);
      expect(status.failureCount).toBe(2);
      expect(status.error).toBe('Previous error');
    });
  });

  describe('disableManualMode', () => {
    it('should disable manual mode', () => {
      const { enableManualMode, disableManualMode, getSyncStatus } = useDraftStore.getState();

      enableManualMode(testLeagueId);
      expect(getSyncStatus(testLeagueId).isManualMode).toBe(true);

      disableManualMode(testLeagueId);

      expect(getSyncStatus(testLeagueId).isManualMode).toBe(false);
    });

    it('should preserve other status fields', () => {
      const { updateSyncStatus, disableManualMode, getSyncStatus } = useDraftStore.getState();

      updateSyncStatus(testLeagueId, { isManualMode: true, failureCount: 5 });
      disableManualMode(testLeagueId);

      const status = getSyncStatus(testLeagueId);
      expect(status.isManualMode).toBe(false);
      expect(status.failureCount).toBe(5); // Preserved
    });
  });

  describe('multiple leagues', () => {
    it('should track sync status independently per league', () => {
      const { incrementFailureCount, getSyncStatus } = useDraftStore.getState();
      const league1 = 'league-1';
      const league2 = 'league-2';

      incrementFailureCount(league1, 'transient', 'Error in league 1');
      incrementFailureCount(league1, 'transient', 'Error in league 1');
      incrementFailureCount(league2, 'persistent', 'Error in league 2');

      const status1 = getSyncStatus(league1);
      const status2 = getSyncStatus(league2);

      expect(status1.failureCount).toBe(2);
      expect(status1.failureType).toBe('transient');
      expect(status1.isManualMode).toBe(false);

      expect(status2.failureCount).toBe(1);
      expect(status2.failureType).toBe('persistent');
      expect(status2.isManualMode).toBe(true); // Persistent triggers manual mode
    });

    it('should reset only the specified league', () => {
      const { incrementFailureCount, resetFailureCount, getSyncStatus } = useDraftStore.getState();
      const league1 = 'league-1';
      const league2 = 'league-2';

      incrementFailureCount(league1, 'transient', 'Error');
      incrementFailureCount(league2, 'transient', 'Error');

      resetFailureCount(league1);

      expect(getSyncStatus(league1).failureCount).toBe(0);
      expect(getSyncStatus(league2).failureCount).toBe(1); // Not affected
    });
  });

  describe('DISCONNECTED_FAILURE_THRESHOLD constant', () => {
    it('should be 3 per NFR-I3', () => {
      expect(DISCONNECTED_FAILURE_THRESHOLD).toBe(3);
    });
  });
});
