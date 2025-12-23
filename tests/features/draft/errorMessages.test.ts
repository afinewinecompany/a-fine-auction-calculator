/**
 * Tests for Error Message Mapping Utility
 *
 * Story: 10.6 - Display Clear Error Messages
 *
 * Tests:
 * - Correct message for each error type
 * - Recovery options included
 * - Plain language (no jargon)
 * - Severity levels
 * - Dismissal and persistence behavior
 */

import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  getErrorMessageByType,
  createErrorMessage,
  formatRetryDelay,
  getSeverityIcon,
  shouldErrorPersist,
  type ErrorMessage,
} from '@/features/draft/utils/errorMessages';
import type { SyncErrorCode } from '@/features/draft/types/sync.types';

describe('errorMessages', () => {
  describe('getErrorMessage', () => {
    it('returns correct message for TIMEOUT error', () => {
      const message = getErrorMessage('TIMEOUT');

      expect(message.headline).toBe('Connection timed out');
      expect(message.explanation).toContain('taking too long');
      expect(message.severity).toBe('warning');
      expect(message.showRetry).toBe(true);
    });

    it('returns correct message for NETWORK_ERROR', () => {
      const message = getErrorMessage('NETWORK_ERROR');

      expect(message.headline).toBe('Unable to connect');
      expect(message.explanation).toContain('internet connection');
      expect(message.recoveryOptions).toContain('Check your internet connection');
      expect(message.showManualMode).toBe(true);
    });

    it('returns correct message for SCRAPE_ERROR', () => {
      const message = getErrorMessage('SCRAPE_ERROR');

      expect(message.headline).toBe('Draft room temporarily unavailable');
      expect(message.explanation).toContain('Couch Managers');
      expect(message.severity).toBe('warning');
    });

    it('returns correct message for PARSE_ERROR', () => {
      const message = getErrorMessage('PARSE_ERROR');

      expect(message.headline).toBe('Unable to read draft data');
      expect(message.showRetry).toBe(true);
      expect(message.showManualMode).toBe(false);
    });

    it('returns correct message for RATE_LIMITED', () => {
      const message = getErrorMessage('RATE_LIMITED');

      expect(message.headline).toBe('Too many requests');
      expect(message.explanation).toContain('Slowing down');
      // Should NOT show retry button when rate limited
      expect(message.showRetry).toBe(false);
    });

    it('returns correct message for UNAUTHORIZED error', () => {
      const message = getErrorMessage('UNAUTHORIZED');

      expect(message.headline).toBe('Authentication failed');
      expect(message.explanation).toContain('room ID');
      expect(message.severity).toBe('error');
      expect(message.showManualMode).toBe(true);
      // Persistent errors should not show retry
      expect(message.showRetry).toBe(false);
    });

    it('returns correct message for LEAGUE_NOT_FOUND', () => {
      const message = getErrorMessage('LEAGUE_NOT_FOUND');

      expect(message.headline).toBe('Draft room not found');
      expect(message.explanation).toContain('room ID');
      expect(message.severity).toBe('error');
      expect(message.recoveryOptions).toContainEqual(
        expect.stringContaining('League Settings')
      );
    });

    it('returns correct message for VALIDATION_ERROR', () => {
      const message = getErrorMessage('VALIDATION_ERROR');

      expect(message.headline).toBe('Invalid configuration');
      expect(message.severity).toBe('error');
      expect(message.showManualMode).toBe(true);
    });

    it('returns default message for undefined error code', () => {
      const message = getErrorMessage(undefined);

      expect(message.headline).toBe('Connection problem');
      expect(message.severity).toBe('warning');
      expect(message.showRetry).toBe(true);
      expect(message.showManualMode).toBe(true);
    });

    it('returns default message for unknown error code', () => {
      // @ts-expect-error - testing unknown code
      const message = getErrorMessage('UNKNOWN_CODE');

      expect(message.headline).toBe('Connection problem');
    });

    it('all error messages use plain language (no technical jargon)', () => {
      const errorCodes: SyncErrorCode[] = [
        'TIMEOUT',
        'NETWORK_ERROR',
        'SCRAPE_ERROR',
        'PARSE_ERROR',
        'RATE_LIMITED',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
        'VALIDATION_ERROR',
      ];

      const technicalTerms = [
        'API',
        'HTTP',
        'status code',
        '500',
        '401',
        '403',
        '404',
        'exception',
        'stack trace',
        'endpoint',
        'JSON',
        'fetch',
        'request failed',
      ];

      errorCodes.forEach(code => {
        const message = getErrorMessage(code);
        const fullText =
          `${message.headline} ${message.explanation} ${message.recoveryOptions.join(' ')}`.toLowerCase();

        technicalTerms.forEach(term => {
          expect(fullText).not.toContain(term.toLowerCase());
        });
      });
    });

    it('all error messages have at least one recovery option', () => {
      const errorCodes: SyncErrorCode[] = [
        'TIMEOUT',
        'NETWORK_ERROR',
        'SCRAPE_ERROR',
        'PARSE_ERROR',
        'RATE_LIMITED',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
        'VALIDATION_ERROR',
      ];

      errorCodes.forEach(code => {
        const message = getErrorMessage(code);
        expect(message.recoveryOptions.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('all error messages are dismissible', () => {
      const errorCodes: SyncErrorCode[] = [
        'TIMEOUT',
        'NETWORK_ERROR',
        'SCRAPE_ERROR',
        'PARSE_ERROR',
        'RATE_LIMITED',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
        'VALIDATION_ERROR',
      ];

      errorCodes.forEach(code => {
        const message = getErrorMessage(code);
        expect(message.isDismissible).toBe(true);
      });
    });
  });

  describe('getErrorMessageByType', () => {
    it('returns appropriate message for transient failure type', () => {
      const message = getErrorMessageByType('transient');

      expect(message.headline).toBe('Temporary connection issue');
      expect(message.severity).toBe('warning');
      expect(message.showRetry).toBe(true);
    });

    it('returns appropriate message for persistent failure type', () => {
      const message = getErrorMessageByType('persistent');

      expect(message.headline).toBe('Connection failed');
      expect(message.severity).toBe('error');
      expect(message.showRetry).toBe(false);
      expect(message.showManualMode).toBe(true);
    });
  });

  describe('createErrorMessage', () => {
    it('creates custom error message with defaults', () => {
      const message = createErrorMessage('Custom headline', 'Custom explanation');

      expect(message.headline).toBe('Custom headline');
      expect(message.explanation).toBe('Custom explanation');
      expect(message.severity).toBe('warning');
      expect(message.isDismissible).toBe(true);
      expect(message.recoveryOptions.length).toBeGreaterThan(0);
    });

    it('allows overriding all options', () => {
      const message = createErrorMessage('Critical error', 'Something broke', {
        severity: 'critical',
        isDismissible: false,
        showRetry: false,
        showManualMode: false,
        recoveryOptions: ['Contact support'],
      });

      expect(message.severity).toBe('critical');
      expect(message.isDismissible).toBe(false);
      expect(message.showRetry).toBe(false);
      expect(message.showManualMode).toBe(false);
      expect(message.recoveryOptions).toEqual(['Contact support']);
    });
  });

  describe('formatRetryDelay', () => {
    it('formats 1 second correctly', () => {
      expect(formatRetryDelay(1000)).toBe('1 second');
    });

    it('formats multiple seconds correctly', () => {
      expect(formatRetryDelay(5000)).toBe('5 seconds');
      expect(formatRetryDelay(10000)).toBe('10 seconds');
      expect(formatRetryDelay(20000)).toBe('20 seconds');
    });

    it('rounds to nearest second', () => {
      expect(formatRetryDelay(5500)).toBe('6 seconds');
      expect(formatRetryDelay(4400)).toBe('4 seconds');
    });
  });

  describe('getSeverityIcon', () => {
    it('returns correct icon for warning', () => {
      expect(getSeverityIcon('warning')).toBe('AlertTriangle');
    });

    it('returns correct icon for error', () => {
      expect(getSeverityIcon('error')).toBe('XCircle');
    });

    it('returns correct icon for critical', () => {
      expect(getSeverityIcon('critical')).toBe('AlertOctagon');
    });
  });

  describe('shouldErrorPersist', () => {
    it('returns true for error severity (persistent errors)', () => {
      expect(shouldErrorPersist('UNAUTHORIZED', 1)).toBe(true);
      expect(shouldErrorPersist('LEAGUE_NOT_FOUND', 1)).toBe(true);
      expect(shouldErrorPersist('VALIDATION_ERROR', 1)).toBe(true);
    });

    it('returns true for multiple failures of transient errors', () => {
      expect(shouldErrorPersist('TIMEOUT', 2)).toBe(true);
      expect(shouldErrorPersist('NETWORK_ERROR', 3)).toBe(true);
    });

    it('returns false for single transient failure', () => {
      expect(shouldErrorPersist('TIMEOUT', 1)).toBe(false);
      expect(shouldErrorPersist('NETWORK_ERROR', 0)).toBe(false);
    });

    it('returns true for undefined error code with multiple failures', () => {
      expect(shouldErrorPersist(undefined, 2)).toBe(true);
    });
  });

  describe('ErrorMessage structure', () => {
    it('all messages have required fields', () => {
      const message = getErrorMessage('TIMEOUT');

      expect(message).toHaveProperty('headline');
      expect(message).toHaveProperty('explanation');
      expect(message).toHaveProperty('recoveryOptions');
      expect(message).toHaveProperty('severity');
      expect(message).toHaveProperty('isDismissible');
      expect(message).toHaveProperty('showRetry');
      expect(message).toHaveProperty('showManualMode');
    });

    it('severity is one of allowed values', () => {
      const allowedSeverities = ['warning', 'error', 'critical'];
      const errorCodes: SyncErrorCode[] = [
        'TIMEOUT',
        'NETWORK_ERROR',
        'SCRAPE_ERROR',
        'PARSE_ERROR',
        'RATE_LIMITED',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
        'VALIDATION_ERROR',
      ];

      errorCodes.forEach(code => {
        const message = getErrorMessage(code);
        expect(allowedSeverities).toContain(message.severity);
      });
    });

    it('recoveryOptions is always an array', () => {
      const errorCodes: SyncErrorCode[] = [
        'TIMEOUT',
        'NETWORK_ERROR',
        'UNAUTHORIZED',
        'LEAGUE_NOT_FOUND',
      ];

      errorCodes.forEach(code => {
        const message = getErrorMessage(code);
        expect(Array.isArray(message.recoveryOptions)).toBe(true);
      });
    });
  });
});
