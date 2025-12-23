/**
 * ExportProjections Component Tests
 *
 * Tests for the export dropdown component.
 *
 * Story: 4.8 - Export Projections for Offline Analysis
 */

// Tests use vitest globals (describe, it, expect, vi, beforeEach)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportProjections } from '@/features/projections/components/ExportProjections';
import type { PlayerProjection } from '@/features/projections/types/projection.types';

// Mock projections data
const mockProjections: PlayerProjection[] = [
  {
    id: '1',
    leagueId: 'league-123',
    playerName: 'Mike Trout',
    team: 'LAA',
    positions: ['CF'],
    projectedValue: 45,
    projectionSource: 'fangraphs',
    statsHitters: { hr: 35, rbi: 90 },
    statsPitchers: null,
    tier: 'Elite',
    createdAt: '2025-12-12T00:00:00Z',
    updatedAt: '2025-12-12T02:30:00Z',
  },
];

// Mock state
let mockUseProjectionsReturn = {
  projections: mockProjections,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

// Mock export functions
const mockExportToCSV = vi.fn();
const mockExportToJSON = vi.fn();

vi.mock('@/features/projections/hooks/useProjections', () => ({
  useProjections: () => mockUseProjectionsReturn,
}));

vi.mock('@/features/projections/utils/exportProjections', () => ({
  exportToCSV: (...args: unknown[]) => mockExportToCSV(...args),
  exportToJSON: (...args: unknown[]) => mockExportToJSON(...args),
  sanitizeFilename: (name: string) => name.replace(/[^a-z0-9]/gi, '_'),
}));

describe('ExportProjections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProjectionsReturn = {
      projections: mockProjections,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  it('renders export button', () => {
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('shows dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    await user.click(screen.getByRole('button', { name: /export/i }));

    expect(screen.getByText(/export as csv/i)).toBeInTheDocument();
    expect(screen.getByText(/export as json/i)).toBeInTheDocument();
  });

  it('disables button when loading', () => {
    mockUseProjectionsReturn = {
      ...mockUseProjectionsReturn,
      isLoading: true,
    };

    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });

  it('disables button when no projections', () => {
    mockUseProjectionsReturn = {
      ...mockUseProjectionsReturn,
      projections: [],
    };

    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });

  it('calls exportToCSV when CSV option clicked', async () => {
    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByText(/export as csv/i));

    expect(mockExportToCSV).toHaveBeenCalledTimes(1);
    expect(mockExportToCSV).toHaveBeenCalledWith(
      mockProjections,
      expect.stringMatching(/Test_League_Projections_\d{4}-\d{2}-\d{2}/)
    );
  });

  it('calls exportToJSON when JSON option clicked', async () => {
    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByText(/export as json/i));

    expect(mockExportToJSON).toHaveBeenCalledTimes(1);
    expect(mockExportToJSON).toHaveBeenCalledWith(
      mockProjections,
      expect.stringMatching(/Test_League_Projections_\d{4}-\d{2}-\d{2}/)
    );
  });

  it('sanitizes league name for filename', async () => {
    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="My League 2025!" />);

    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByText(/export as csv/i));

    // The filename should have the sanitized league name
    expect(mockExportToCSV).toHaveBeenCalledWith(
      mockProjections,
      expect.stringContaining('My_League_2025_')
    );
  });

  it('includes date in filename', async () => {
    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    await user.click(screen.getByRole('button', { name: /export/i }));
    await user.click(screen.getByText(/export as csv/i));

    // Filename should include date in YYYY-MM-DD format
    expect(mockExportToCSV).toHaveBeenCalledWith(
      mockProjections,
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/)
    );
  });

  it('does not export when projections array is empty', async () => {
    mockUseProjectionsReturn = {
      ...mockUseProjectionsReturn,
      projections: [],
    };

    const user = userEvent.setup();
    render(<ExportProjections leagueId="league-123" leagueName="Test League" />);

    // Button should be disabled
    expect(screen.getByRole('button', { name: /export/i })).toBeDisabled();
  });
});
