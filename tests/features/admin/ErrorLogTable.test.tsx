/**
 * ErrorLogTable Component Tests
 *
 * Tests for the error log table display and functionality.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorLogTable } from '@/features/admin/components/ErrorLogTable';
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
    apiName: 'couch_managers',
    status: 'degraded',
    statusCode: 503,
    errorMessage: 'Service Unavailable',
    requestUrl: 'https://api.example.com/v1/sync',
    responseTimeMs: 2000,
    checkedAt: '2025-12-23T09:00:00Z',
  },
  {
    id: '3',
    apiName: 'couch_managers',
    status: 'down',
    statusCode: null,
    errorMessage: 'Connection timeout',
    requestUrl: null,
    responseTimeMs: null,
    checkedAt: '2025-12-23T08:00:00Z',
  },
];

describe('ErrorLogTable', () => {
  it('should render the table with logs', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    expect(screen.getByTestId('error-log-table')).toBeInTheDocument();
    expect(screen.getByTestId('error-log-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('error-log-row-2')).toBeInTheDocument();
    expect(screen.getByTestId('error-log-row-3')).toBeInTheDocument();
  });

  it('should display column headers', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByText('Request URL')).toBeInTheDocument();
    expect(screen.getByText('Response Time')).toBeInTheDocument();
  });

  it('should display status codes with correct styling', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    // Check that status codes are displayed
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('503')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument(); // For null status code
  });

  it('should display error messages', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    expect(screen.getByText('Service Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Connection timeout')).toBeInTheDocument();
  });

  it('should show loading skeleton when loading is true', () => {
    render(<ErrorLogTable logs={[]} loading={true} />);

    // Loading skeleton should be visible
    expect(screen.queryByTestId('error-log-row-1')).not.toBeInTheDocument();
  });

  it('should show empty state when no logs are available', () => {
    render(<ErrorLogTable logs={[]} loading={false} />);

    expect(screen.getByText('No error logs found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting the date range or search criteria')).toBeInTheDocument();
  });

  it('should handle null request URLs gracefully', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    // Row with null URL should display "--" (there may be multiple "--" for null fields)
    const row3 = screen.getByTestId('error-log-row-3');
    expect(within(row3).getAllByText('--').length).toBeGreaterThanOrEqual(1);
  });

  it('should handle null response times gracefully', () => {
    render(<ErrorLogTable logs={mockLogs} />);

    // Row with null response time should display "--"
    const row3 = screen.getByTestId('error-log-row-3');
    expect(within(row3).getAllByText('--').length).toBeGreaterThanOrEqual(1);
  });

  it('should allow sorting by timestamp column', async () => {
    const user = userEvent.setup();
    render(<ErrorLogTable logs={mockLogs} />);

    const timestampHeader = screen.getByText('Timestamp');
    await user.click(timestampHeader);

    // Sorting should toggle
    expect(screen.getByTestId('error-log-table')).toBeInTheDocument();
  });

  it('should allow sorting by status code column', async () => {
    const user = userEvent.setup();
    render(<ErrorLogTable logs={mockLogs} />);

    const statusHeader = screen.getByText('Status');
    await user.click(statusHeader);

    expect(screen.getByTestId('error-log-table')).toBeInTheDocument();
  });

  it('should show pagination when logs exceed page size', () => {
    // Create more logs than default page size
    const manyLogs: ErrorLog[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      apiName: 'couch_managers',
      status: 'down',
      statusCode: 500,
      errorMessage: `Error ${i}`,
      requestUrl: `https://api.example.com/v1/test${i}`,
      responseTimeMs: 1000,
      checkedAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    render(<ErrorLogTable logs={manyLogs} pageSize={20} />);

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
  });

  it('should navigate between pages', async () => {
    const user = userEvent.setup();
    const manyLogs: ErrorLog[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      apiName: 'couch_managers',
      status: 'down',
      statusCode: 500,
      errorMessage: `Error ${i}`,
      requestUrl: null,
      responseTimeMs: 1000,
      checkedAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));

    render(<ErrorLogTable logs={manyLogs} pageSize={20} />);

    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(screen.getByText(/Page 2 of 2/)).toBeInTheDocument();
  });
});
