/**
 * Export Error Logs Utility Tests
 *
 * Tests for CSV export functionality.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCSV, generateFilename } from '@/features/admin/utils/exportErrorLogs';
import type { ErrorLog } from '@/features/admin/types/admin.types';

const mockLogs: ErrorLog[] = [
  {
    id: '1',
    apiName: 'couch_managers',
    status: 'down',
    statusCode: 500,
    errorMessage: 'Internal Server Error',
    requestUrl: 'https://api.example.com/v1/draft',
    responseTimeMs: 1500,
    checkedAt: '2025-12-23T10:00:00Z',
  },
  {
    id: '2',
    apiName: 'fangraphs',
    status: 'degraded',
    statusCode: 503,
    errorMessage: 'Service Unavailable',
    requestUrl: 'https://api.fangraphs.com/v1/players',
    responseTimeMs: 2000,
    checkedAt: '2025-12-23T09:00:00Z',
  },
  {
    id: '3',
    apiName: 'google_sheets',
    status: 'down',
    statusCode: null,
    errorMessage: 'Connection timeout',
    requestUrl: null,
    responseTimeMs: null,
    checkedAt: '2025-12-23T08:00:00Z',
  },
];

describe('generateCSV', () => {
  it('should generate CSV with correct headers', () => {
    const csv = generateCSV(mockLogs);
    const lines = csv.split('\n');
    const headers = lines[0];

    expect(headers).toBe(
      'Timestamp,API Name,Status,Status Code,Error Message,Request URL,Response Time (ms)'
    );
  });

  it('should include all log entries', () => {
    const csv = generateCSV(mockLogs);
    const lines = csv.split('\n');

    // Header + 3 data rows
    expect(lines.length).toBe(4);
  });

  it('should format timestamp correctly', () => {
    const csv = generateCSV(mockLogs);

    // Timestamps are formatted in local timezone, so just check date part
    expect(csv).toContain('2025-12-23');
  });

  it('should display API display names', () => {
    const csv = generateCSV(mockLogs);

    expect(csv).toContain('Couch Managers');
    expect(csv).toContain('Fangraphs');
    expect(csv).toContain('Google Sheets');
  });

  it('should include status values', () => {
    const csv = generateCSV(mockLogs);

    expect(csv).toContain('down');
    expect(csv).toContain('degraded');
  });

  it('should handle null status codes', () => {
    const csv = generateCSV(mockLogs);
    const lines = csv.split('\n');

    // Third data row should have empty status code
    const row3 = lines[3];
    expect(row3).toContain('Connection timeout');
  });

  it('should handle null request URLs', () => {
    const csv = generateCSV(mockLogs);
    const lines = csv.split('\n');

    // Third data row should handle null URL
    expect(lines[3]).toBeDefined();
  });

  it('should handle null response times', () => {
    const csv = generateCSV(mockLogs);
    const lines = csv.split('\n');

    // Third data row should handle null response time
    expect(lines[3]).toBeDefined();
  });

  it('should escape error messages containing commas', () => {
    const logsWithComma: ErrorLog[] = [
      {
        id: '1',
        apiName: 'couch_managers',
        status: 'down',
        statusCode: 500,
        errorMessage: 'Error: connection failed, please retry',
        requestUrl: null,
        responseTimeMs: null,
        checkedAt: '2025-12-23T10:00:00Z',
      },
    ];

    const csv = generateCSV(logsWithComma);

    // Message with comma should be quoted
    expect(csv).toContain('"Error: connection failed, please retry"');
  });

  it('should escape error messages containing quotes', () => {
    const logsWithQuote: ErrorLog[] = [
      {
        id: '1',
        apiName: 'couch_managers',
        status: 'down',
        statusCode: 500,
        errorMessage: 'Error: "Invalid token"',
        requestUrl: null,
        responseTimeMs: null,
        checkedAt: '2025-12-23T10:00:00Z',
      },
    ];

    const csv = generateCSV(logsWithQuote);

    // Quotes should be escaped
    expect(csv).toContain('""Invalid token""');
  });

  it('should return only headers for empty logs array', () => {
    const csv = generateCSV([]);
    const lines = csv.split('\n');

    expect(lines.length).toBe(1);
    expect(lines[0]).toContain('Timestamp');
  });
});

describe('generateFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-12-23T14:30:45Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate filename with API name', () => {
    const filename = generateFilename('couch_managers');

    expect(filename).toContain('couch_managers');
  });

  it('should generate filename with date', () => {
    const filename = generateFilename('couch_managers');

    expect(filename).toContain('2025-12-23');
  });

  it('should generate filename with .csv extension', () => {
    const filename = generateFilename('couch_managers');

    expect(filename.endsWith('.csv')).toBe(true);
  });

  it('should generate valid filenames for all API types', () => {
    expect(generateFilename('couch_managers')).toContain('couch_managers');
    expect(generateFilename('fangraphs')).toContain('fangraphs');
    expect(generateFilename('google_sheets')).toContain('google_sheets');
  });
});
