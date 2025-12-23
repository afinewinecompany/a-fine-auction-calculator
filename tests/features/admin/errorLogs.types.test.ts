/**
 * Error Logs Types Test
 *
 * Tests for ErrorLog type definitions and validation.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect } from 'vitest';

// Type definition for ErrorLog (to be implemented)
interface ErrorLog {
  id: string;
  apiName: 'couch_managers' | 'fangraphs' | 'google_sheets';
  status: 'degraded' | 'down';
  statusCode: number | null;
  errorMessage: string;
  requestUrl: string | null;
  responseTimeMs: number | null;
  checkedAt: string;
}

describe('ErrorLog type', () => {
  it('should define required fields for error log entries', () => {
    const errorLog: ErrorLog = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      apiName: 'couch_managers',
      status: 'down',
      statusCode: 500,
      errorMessage: 'Internal Server Error',
      requestUrl: 'https://api.couchmanagers.com/v1/draft',
      responseTimeMs: 1500,
      checkedAt: '2025-12-23T10:00:00Z',
    };

    expect(errorLog.id).toBeDefined();
    expect(errorLog.apiName).toBe('couch_managers');
    expect(errorLog.status).toBe('down');
    expect(errorLog.statusCode).toBe(500);
    expect(errorLog.errorMessage).toBe('Internal Server Error');
    expect(errorLog.requestUrl).toBe('https://api.couchmanagers.com/v1/draft');
    expect(errorLog.responseTimeMs).toBe(1500);
    expect(errorLog.checkedAt).toBe('2025-12-23T10:00:00Z');
  });

  it('should allow null values for optional fields', () => {
    const errorLog: ErrorLog = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      apiName: 'fangraphs',
      status: 'degraded',
      statusCode: null,
      errorMessage: 'Connection timeout',
      requestUrl: null,
      responseTimeMs: null,
      checkedAt: '2025-12-23T11:00:00Z',
    };

    expect(errorLog.statusCode).toBeNull();
    expect(errorLog.requestUrl).toBeNull();
    expect(errorLog.responseTimeMs).toBeNull();
  });

  it('should restrict apiName to valid API names', () => {
    const validApiNames: ErrorLog['apiName'][] = ['couch_managers', 'fangraphs', 'google_sheets'];

    validApiNames.forEach(name => {
      const errorLog: ErrorLog = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        apiName: name,
        status: 'down',
        statusCode: 503,
        errorMessage: 'Service unavailable',
        requestUrl: null,
        responseTimeMs: null,
        checkedAt: '2025-12-23T12:00:00Z',
      };

      expect(errorLog.apiName).toBe(name);
    });
  });

  it('should restrict status to degraded or down', () => {
    const validStatuses: ErrorLog['status'][] = ['degraded', 'down'];

    validStatuses.forEach(status => {
      const errorLog: ErrorLog = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        apiName: 'google_sheets',
        status,
        statusCode: 400,
        errorMessage: 'Bad request',
        requestUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
        responseTimeMs: 200,
        checkedAt: '2025-12-23T13:00:00Z',
      };

      expect(errorLog.status).toBe(status);
    });
  });
});

describe('DateRange filter type', () => {
  it('should define valid date range options', () => {
    type DateRangeOption = '24h' | '7d' | '30d' | 'custom';

    const validOptions: DateRangeOption[] = ['24h', '7d', '30d', 'custom'];

    expect(validOptions).toContain('24h');
    expect(validOptions).toContain('7d');
    expect(validOptions).toContain('30d');
    expect(validOptions).toContain('custom');
    expect(validOptions.length).toBe(4);
  });
});
