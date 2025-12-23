/**
 * ProjectionSystemSelector Component Tests
 *
 * Story: 4.5 - Select and Load Fangraphs Projections
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectionSystemSelector } from '@/features/projections/components/ProjectionSystemSelector';

// Mock the hook with different states
const mockLoadProjections = vi.fn();
let mockHookState = {
  loadProjections: mockLoadProjections,
  isLoading: false,
  progress: 0,
  result: null as { system: string; count: number } | null,
  error: null as string | null,
};

vi.mock('@/features/projections/hooks/useLoadFangraphsProjections', () => ({
  useLoadFangraphsProjections: () => mockHookState,
}));

describe('ProjectionSystemSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: false,
      progress: 0,
      result: null,
      error: null,
    };
  });

  it('renders projection system dropdown', () => {
    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Projection System')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders Load Projections button', () => {
    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByRole('button', { name: /load projections/i })).toBeInTheDocument();
  });

  it('disables Load Projections button when no system selected', () => {
    render(<ProjectionSystemSelector leagueId="league-123" />);

    const button = screen.getByRole('button', { name: /load projections/i });
    expect(button).toBeDisabled();
  });

  it('shows placeholder text in dropdown', () => {
    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Select a projection system')).toBeInTheDocument();
  });
});

describe('ProjectionSystemSelector - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays loading indicator and text when loading', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 45,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Loading Projections...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows progress stage text - fetching hitters', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 25,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Fetching hitters...')).toBeInTheDocument();
  });

  it('shows progress stage text - fetching pitchers', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 50,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Fetching pitchers...')).toBeInTheDocument();
  });

  it('shows progress stage text - processing data', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 75,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Processing data...')).toBeInTheDocument();
  });

  it('shows progress stage text - saving projections', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 90,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Saving projections...')).toBeInTheDocument();
  });

  it('disables button while loading', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 50,
      result: null,
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    const button = screen.getByRole('button', { name: /loading projections/i });
    expect(button).toBeDisabled();
  });
});

describe('ProjectionSystemSelector - Success State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays success message with player count', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: false,
      progress: 100,
      result: { system: 'Steamer', count: 500 },
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText(/loaded 500 projections from fangraphs steamer/i)).toBeInTheDocument();
  });

  it('does not display success message while loading', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 100,
      result: { system: 'Steamer', count: 500 },
      error: null,
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.queryByText(/loaded 500 projections/i)).not.toBeInTheDocument();
  });
});

describe('ProjectionSystemSelector - Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays error message when load fails', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: false,
      progress: 0,
      result: null,
      error: 'Failed to connect to Fangraphs',
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.getByText('Failed to connect to Fangraphs')).toBeInTheDocument();
  });

  it('does not display error message while loading', () => {
    mockHookState = {
      loadProjections: mockLoadProjections,
      isLoading: true,
      progress: 10,
      result: null,
      error: 'Some error',
    };

    render(<ProjectionSystemSelector leagueId="league-123" />);

    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
  });
});
