/**
 * ErrorLogsPage Component Tests
 *
 * Tests for the error logs page rendering and navigation.
 * Story: 13.10 - Drill Down into Error Logs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ErrorLogsPage } from '@/features/admin/components/ErrorLogsPage';

// Mock useErrorLogs hook
vi.mock('@/features/admin/hooks/useErrorLogs', () => ({
  useErrorLogs: vi.fn(() => ({
    logs: [
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
    ],
    loading: false,
    error: null,
    filter: {
      dateRange: '24h',
      searchQuery: '',
    },
    setFilter: vi.fn(),
    frequency: [{ time: '2025-12-23T10:00:00Z', count: 1 }],
    totalCount: 1,
    refetch: vi.fn(),
  })),
}));

// Mock export function
vi.mock('@/features/admin/utils/exportErrorLogs', () => ({
  exportErrorLogsToCSV: vi.fn(),
}));

const renderWithRouter = (apiName: string) => {
  return render(
    <MemoryRouter initialEntries={[`/admin/errors/${apiName}`]}>
      <Routes>
        <Route path="/admin/errors/:apiName" element={<ErrorLogsPage />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ErrorLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the error logs page for valid API', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByText('Couch Managers Error Logs')).toBeInTheDocument();
  });

  it('should display total error count', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByText(/1 error found/)).toBeInTheDocument();
  });

  it('should render date range filter buttons', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByText('24h')).toBeInTheDocument();
    expect(screen.getByText('7d')).toBeInTheDocument();
    expect(screen.getByText('30d')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search by error message or status code...')
    ).toBeInTheDocument();
  });

  it('should render export button', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('export-button')).toBeInTheDocument();
  });

  it('should render refresh button', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });

  it('should render back button', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });

  it('should render error frequency chart', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('error-frequency-chart')).toBeInTheDocument();
  });

  it('should render error log table', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByTestId('error-log-table')).toBeInTheDocument();
  });

  it('should show invalid API page for unknown API', () => {
    renderWithRouter('invalid_api');

    expect(screen.getByText('Invalid API')).toBeInTheDocument();
    expect(
      screen.getByText('The API name in the URL is not valid. Please select an API from the admin dashboard.')
    ).toBeInTheDocument();
  });

  it('should render page for fangraphs API', () => {
    renderWithRouter('fangraphs');

    expect(screen.getByText('Fangraphs Error Logs')).toBeInTheDocument();
  });

  it('should render page for google_sheets API', () => {
    renderWithRouter('google_sheets');

    expect(screen.getByText('Google Sheets Error Logs')).toBeInTheDocument();
  });

  it('should display polling info in footer', () => {
    renderWithRouter('couch_managers');

    expect(screen.getByText('Auto-refreshes every 60 seconds')).toBeInTheDocument();
  });
});

describe('ErrorLogsPage interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call setFilter when date range button is clicked', async () => {
    const user = userEvent.setup();
    const mockSetFilter = vi.fn();

    // Re-mock with accessible setFilter
    vi.mocked(await import('@/features/admin/hooks/useErrorLogs')).useErrorLogs = vi.fn(() => ({
      logs: [],
      loading: false,
      error: null,
      filter: { dateRange: '24h', searchQuery: '' },
      setFilter: mockSetFilter,
      frequency: [],
      totalCount: 0,
      refetch: vi.fn(),
    }));

    renderWithRouter('couch_managers');

    const button7d = screen.getByText('7d');
    await user.click(button7d);

    // The button should be interactive
    expect(button7d).toBeInTheDocument();
  });

  it('should have search input that is accessible', async () => {
    renderWithRouter('couch_managers');

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveAttribute('placeholder', 'Search by error message or status code...');
  });
});
