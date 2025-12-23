/**
 * Error Classification Utility Tests
 *
 * Story: 10.1 - Detect API Connection Failures
 *
 * Tests for:
 * - Transient error classification (timeout, network, 5xx, rate limiting)
 * - Persistent error classification (401, 403, 404, validation)
 * - Exponential backoff delay calculation
 * - Edge Function error response classification
 * - Network error classification
 * - Manual mode trigger logic
 */

import { describe, it, expect } from 'vitest';
import {
  classifyError,
  classifyEdgeFunctionError,
  classifyNetworkError,
  classifyHttpStatus,
  calculateRetryDelay,
  shouldEnableManualMode,
} from '@/features/draft/utils/classifyError';
import type { SyncErrorResponse, ErrorClassification } from '@/features/draft/types/sync.types';

describe('classifyError', () => {
  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff starting at 5 seconds', () => {
      expect(calculateRetryDelay(0)).toBe(5000); // 5s * 2^0 = 5s
    });

    it('should double delay for each failure', () => {
      expect(calculateRetryDelay(0)).toBe(5000); // 5s
      expect(calculateRetryDelay(1)).toBe(10000); // 10s
      expect(calculateRetryDelay(2)).toBe(20000); // 20s (capped)
    });

    it('should cap delay at 20 seconds maximum', () => {
      expect(calculateRetryDelay(3)).toBe(20000); // Would be 40s, capped at 20s
      expect(calculateRetryDelay(10)).toBe(20000); // Still capped at 20s
    });

    it('should match the formula: Math.min(5000 * Math.pow(2, failureCount), 20000)', () => {
      for (let i = 0; i < 5; i++) {
        const expected = Math.min(5000 * Math.pow(2, i), 20000);
        expect(calculateRetryDelay(i)).toBe(expected);
      }
    });
  });

  describe('classifyEdgeFunctionError', () => {
    it('should classify TIMEOUT as transient with retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Request timed out',
        code: 'TIMEOUT',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.retryDelayMs).toBe(5000);
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should classify NETWORK_ERROR as transient with retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Network failed',
        code: 'NETWORK_ERROR',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 1);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.retryDelayMs).toBe(10000); // 2nd failure = 10s
    });

    it('should classify RATE_LIMITED as transient with retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should classify SCRAPE_ERROR as transient with retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Failed to scrape',
        code: 'SCRAPE_ERROR',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should classify PARSE_ERROR as transient with retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Failed to parse response',
        code: 'PARSE_ERROR',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should classify UNAUTHORIZED as persistent without retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.retryDelayMs).toBe(0);
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify LEAGUE_NOT_FOUND as persistent without retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'League not found',
        code: 'LEAGUE_NOT_FOUND',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.retryDelayMs).toBe(0);
    });

    it('should classify VALIDATION_ERROR as persistent without retry', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
    });

    it('should provide user-friendly display message', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Technical error message',
        code: 'TIMEOUT',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyEdgeFunctionError(errorResponse, 0);

      expect(classification.displayMessage).toContain('timed out');
    });
  });

  describe('classifyNetworkError', () => {
    it('should classify timeout errors as transient', () => {
      const error = new Error('Request timeout');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should classify "timed out" errors as transient', () => {
      const error = new Error('The request timed out');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should classify "aborted" errors as transient', () => {
      const error = new Error('Request was aborted');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should classify network errors as transient', () => {
      const error = new Error('Network error occurred');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.errorCode).toBe('NETWORK_ERROR');
    });

    it('should classify "failed to fetch" errors as transient', () => {
      const error = new Error('Failed to fetch');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('NETWORK_ERROR');
    });

    it('should classify "connection" errors as transient', () => {
      const error = new Error('Connection refused');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('NETWORK_ERROR');
    });

    it('should classify "offline" errors as transient', () => {
      const error = new Error('Device is offline');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('NETWORK_ERROR');
    });

    it('should classify unauthorized errors as persistent', () => {
      const error = new Error('Unauthorized access');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify 401 errors as persistent', () => {
      const error = new Error('Error 401: Access denied');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify 403 forbidden errors as persistent', () => {
      const error = new Error('403 Forbidden');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify "not found" errors as persistent', () => {
      const error = new Error('Resource not found');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.errorCode).toBe('LEAGUE_NOT_FOUND');
    });

    it('should classify 404 errors as persistent', () => {
      const error = new Error('Error 404');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.errorCode).toBe('LEAGUE_NOT_FOUND');
    });

    it('should default to transient for unknown errors', () => {
      const error = new Error('Some unknown error');
      const classification = classifyNetworkError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });
  });

  describe('classifyHttpStatus', () => {
    it('should classify 2xx status codes as non-retryable', () => {
      const classification = classifyHttpStatus(200, 0);

      expect(classification.shouldRetry).toBe(false);
    });

    it('should classify 400 as persistent validation error', () => {
      const classification = classifyHttpStatus(400, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should classify 401 as persistent unauthorized', () => {
      const classification = classifyHttpStatus(401, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify 403 as persistent unauthorized', () => {
      const classification = classifyHttpStatus(403, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.errorCode).toBe('UNAUTHORIZED');
    });

    it('should classify 404 as persistent not found', () => {
      const classification = classifyHttpStatus(404, 0);

      expect(classification.type).toBe('persistent');
      expect(classification.shouldRetry).toBe(false);
      expect(classification.errorCode).toBe('LEAGUE_NOT_FOUND');
    });

    it('should classify 408 as transient timeout', () => {
      const classification = classifyHttpStatus(408, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should classify 429 as transient rate limited', () => {
      const classification = classifyHttpStatus(429, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.errorCode).toBe('RATE_LIMITED');
    });

    it('should classify 500 as transient server error', () => {
      const classification = classifyHttpStatus(500, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
      expect(classification.errorCode).toBe('SCRAPE_ERROR');
    });

    it('should classify 502 as transient gateway error', () => {
      const classification = classifyHttpStatus(502, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should classify 503 as transient service unavailable', () => {
      const classification = classifyHttpStatus(503, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should classify 504 as transient gateway timeout', () => {
      const classification = classifyHttpStatus(504, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should calculate correct retry delay based on failure count', () => {
      const classification0 = classifyHttpStatus(500, 0);
      const classification1 = classifyHttpStatus(500, 1);
      const classification2 = classifyHttpStatus(500, 2);

      expect(classification0.retryDelayMs).toBe(5000);
      expect(classification1.retryDelayMs).toBe(10000);
      expect(classification2.retryDelayMs).toBe(20000);
    });
  });

  describe('classifyError (main function)', () => {
    it('should handle SyncErrorResponse objects', () => {
      const errorResponse: SyncErrorResponse = {
        success: false,
        error: 'Timeout',
        code: 'TIMEOUT',
        syncTimestamp: new Date().toISOString(),
      };

      const classification = classifyError(errorResponse, 0);

      expect(classification.type).toBe('transient');
      expect(classification.errorCode).toBe('TIMEOUT');
    });

    it('should handle Error objects', () => {
      const error = new Error('Network error');
      const classification = classifyError(error, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should handle string errors', () => {
      const classification = classifyError('Something went wrong', 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });

    it('should default to transient for unknown error types', () => {
      // @ts-expect-error - Testing with unexpected type
      const classification = classifyError(123, 0);

      expect(classification.type).toBe('transient');
      expect(classification.shouldRetry).toBe(true);
    });
  });

  describe('shouldEnableManualMode', () => {
    it('should return true for persistent errors', () => {
      const classification: ErrorClassification = {
        type: 'persistent',
        shouldRetry: false,
        retryDelayMs: 0,
        displayMessage: 'Error',
      };

      expect(shouldEnableManualMode(classification, 1)).toBe(true);
    });

    it('should return true for persistent errors even on first failure', () => {
      const classification: ErrorClassification = {
        type: 'persistent',
        shouldRetry: false,
        retryDelayMs: 0,
        displayMessage: 'Error',
      };

      expect(shouldEnableManualMode(classification, 1)).toBe(true);
    });

    it('should return false for transient errors with fewer than 3 failures', () => {
      const classification: ErrorClassification = {
        type: 'transient',
        shouldRetry: true,
        retryDelayMs: 5000,
        displayMessage: 'Error',
      };

      expect(shouldEnableManualMode(classification, 1)).toBe(false);
      expect(shouldEnableManualMode(classification, 2)).toBe(false);
    });

    it('should return true for transient errors after 3 consecutive failures (NFR-I3)', () => {
      const classification: ErrorClassification = {
        type: 'transient',
        shouldRetry: true,
        retryDelayMs: 5000,
        displayMessage: 'Error',
      };

      expect(shouldEnableManualMode(classification, 3)).toBe(true);
    });

    it('should return true for transient errors after more than 3 failures', () => {
      const classification: ErrorClassification = {
        type: 'transient',
        shouldRetry: true,
        retryDelayMs: 5000,
        displayMessage: 'Error',
      };

      expect(shouldEnableManualMode(classification, 4)).toBe(true);
      expect(shouldEnableManualMode(classification, 10)).toBe(true);
    });
  });
});
