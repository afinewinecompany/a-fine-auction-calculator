/**
 * ImportFromGoogleSheets Component Tests
 *
 * Story: 4.3 - Import Projections from Google Sheets
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportFromGoogleSheets } from '@/features/projections/components/ImportFromGoogleSheets';

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabase';

const mockInvoke = supabase!.functions.invoke as ReturnType<typeof vi.fn>;

const mockSheets = [
  { id: 'sheet-1', name: 'My Projections', mimeType: 'application/vnd.google-apps.spreadsheet' },
  { id: 'sheet-2', name: 'Draft Board', mimeType: 'application/vnd.google-apps.spreadsheet' },
];

describe('ImportFromGoogleSheets', () => {
  const defaultProps = {
    leagueId: 'league-123',
    onImportComplete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('connection states', () => {
    it('shows loading state while checking connection', () => {
      mockInvoke.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ImportFromGoogleSheets {...defaultProps} />);

      expect(screen.getByText(/checking connection/i)).toBeInTheDocument();
    });

    it('shows connect prompt when not connected', async () => {
      mockInvoke.mockResolvedValueOnce({ data: { connected: false }, error: null });

      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/connect your google account/i)).toBeInTheDocument();
      });
    });

    it('shows sheet selector when connected', async () => {
      mockInvoke
        .mockResolvedValueOnce({ data: { connected: true }, error: null })
        .mockResolvedValueOnce({ data: { sheets: mockSheets }, error: null });

      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/select spreadsheet/i)).toBeInTheDocument();
      });
    });
  });

  describe('sheet selection', () => {
    beforeEach(() => {
      mockInvoke
        .mockResolvedValueOnce({ data: { connected: true }, error: null })
        .mockResolvedValueOnce({ data: { sheets: mockSheets }, error: null });
    });

    it('renders select component with placeholder', async () => {
      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/select a spreadsheet/i)).toBeInTheDocument();
      });

      // The Select component from shadcn/radix renders as a button with combobox role
      // Wait for sheets to load and select to render
      await waitFor(() => {
        const selectTrigger = screen.getByRole('combobox');
        expect(selectTrigger).toBeInTheDocument();
      });
    });
  });

  describe('import functionality', () => {
    beforeEach(() => {
      mockInvoke
        .mockResolvedValueOnce({ data: { connected: true }, error: null })
        .mockResolvedValueOnce({ data: { sheets: mockSheets }, error: null });
    });

    it('disables import button when no sheet selected', async () => {
      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /import projections/i })).toBeDisabled();
      });
    });

    it('shows import button with correct text', async () => {
      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        const importButton = screen.getByRole('button', { name: /import projections/i });
        expect(importButton).toBeInTheDocument();
      });
    });
  });

  describe('help section', () => {
    beforeEach(() => {
      mockInvoke
        .mockResolvedValueOnce({ data: { connected: true }, error: null })
        .mockResolvedValueOnce({ data: { sheets: mockSheets }, error: null });
    });

    it('shows expected sheet format help when clicked', async () => {
      const user = userEvent.setup();

      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/expected sheet format/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/expected sheet format/i));

      await waitFor(() => {
        expect(screen.getByText(/required columns/i)).toBeInTheDocument();
        expect(screen.getByText(/player name/i)).toBeInTheDocument();
      });
    });
  });

  describe('card structure', () => {
    beforeEach(() => {
      mockInvoke
        .mockResolvedValueOnce({ data: { connected: true }, error: null })
        .mockResolvedValueOnce({ data: { sheets: mockSheets }, error: null });
    });

    it('renders card with correct title and description', async () => {
      render(<ImportFromGoogleSheets {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Import from Google Sheets')).toBeInTheDocument();
        expect(
          screen.getByText(/select a spreadsheet and import your custom player projections/i)
        ).toBeInTheDocument();
      });
    });
  });
});
