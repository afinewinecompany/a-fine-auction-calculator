/**
 * APIHealthWidget Component Tests
 *
 * Tests for the API health monitoring widget.
 *
 * Story: 13.3 - Monitor API Health for Integrations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { APIHealthStatus } from '@/features/admin/types/admin.types';

// Mock useAPIHealth hook response
let mockUseAPIHealthResult = {
  apiStatuses: [] as APIHealthStatus[],
  loading: false,
  error: null as string | null,
  hasDownAPI: false,
  hasDegradedAPI: false,
  refetch: vi.fn(),
};

vi.mock('@/features/admin/hooks/useAPIHealth', () => ({
  useAPIHealth: () => mockUseAPIHealthResult,
}));

// Import after mocking
import { APIHealthWidget } from '@/features/admin/components/APIHealthWidget';

// Helper to create mock API status
const createMockAPIStatus = (overrides: Partial<APIHealthStatus> = {}): APIHealthStatus => ({
  name: 'Test API',
  status: 'healthy',
  lastSuccessfulCall: '2025-12-22T10:00:00Z',
  responseTime: 150,
  errorRate: 0,
  recentErrors: [],
  ...overrides,
});

describe('APIHealthWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAPIHealthResult = {
      apiStatuses: [],
      loading: false,
      error: null,
      hasDownAPI: false,
      hasDegradedAPI: false,
      refetch: vi.fn(),
    };
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [],
        loading: true,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      // Check for skeleton loaders (animated divs)
      const grid = screen.getByTestId('api-cards-grid');
      expect(grid.querySelectorAll('.animate-pulse').length).toBe(3);
    });

    it('should show widget title during loading', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [],
        loading: true,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByText('API Health')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when error occurs', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [],
        loading: false,
        error: 'Failed to fetch API health',
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch API health')).toBeInTheDocument();
    });

    it('should have error icon in error message', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [],
        loading: false,
        error: 'Network error',
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('API Status Display', () => {
    it('should display 3 API cards', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [
          createMockAPIStatus({ name: 'Couch Managers' }),
          createMockAPIStatus({ name: 'Fangraphs' }),
          createMockAPIStatus({ name: 'Google Sheets' }),
        ],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByText('Couch Managers')).toBeInTheDocument();
      expect(screen.getByText('Fangraphs')).toBeInTheDocument();
      expect(screen.getByText('Google Sheets')).toBeInTheDocument();
    });

    it('should use grid layout for cards', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [
          createMockAPIStatus({ name: 'API 1' }),
          createMockAPIStatus({ name: 'API 2' }),
          createMockAPIStatus({ name: 'API 3' }),
        ],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const grid = screen.getByTestId('api-cards-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('md:grid-cols-3');
    });
  });

  describe('Border Styling Based on Status', () => {
    it('should have normal border when all APIs healthy', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'healthy' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const widget = screen.getByTestId('api-health-widget');
      expect(widget).toHaveClass('border-slate-800');
    });

    it('should have red border when API is down', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'down' })],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const widget = screen.getByTestId('api-health-widget');
      expect(widget).toHaveClass('border-red-500');
    });

    it('should have yellow border when API is degraded', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'degraded' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: true,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const widget = screen.getByTestId('api-health-widget');
      expect(widget).toHaveClass('border-yellow-500');
    });

    it('should prioritize red border over yellow when both down and degraded', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [
          createMockAPIStatus({ status: 'down' }),
          createMockAPIStatus({ status: 'degraded' }),
        ],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: true,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const widget = screen.getByTestId('api-health-widget');
      expect(widget).toHaveClass('border-red-500');
    });
  });

  describe('Status Indicator', () => {
    it('should show green indicator when all healthy', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'healthy' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-emerald-500');
    });

    it('should show red indicator when API is down', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'down' })],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-red-500');
    });

    it('should show yellow indicator when API is degraded', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'degraded' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: true,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('bg-yellow-500');
    });

    it('should pulse when all healthy', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'healthy' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).toHaveClass('animate-pulse');
    });

    it('should not pulse when API is down', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'down' })],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const indicator = screen.getByTestId('overall-status-indicator');
      expect(indicator).not.toHaveClass('animate-pulse');
    });
  });

  describe('Status Text', () => {
    it('should show "Monitoring" when all healthy', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'healthy' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('Monitoring');
    });

    it('should show "Issues Detected" when API is down', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'down' })],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('Issues Detected');
    });

    it('should show "Degraded" when API is degraded', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'degraded' })],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: true,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByTestId('overall-status-text')).toHaveTextContent('Degraded');
    });
  });

  describe('Refresh Button', () => {
    it('should have refresh button', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus()],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('should call refetch when clicked', () => {
      const mockRefetch = vi.fn();
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus()],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: mockRefetch,
      };

      render(<APIHealthWidget />);

      fireEvent.click(screen.getByTestId('refresh-button'));

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it('should have aria-label for accessibility', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus()],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      const button = screen.getByTestId('refresh-button');
      expect(button).toHaveAttribute('aria-label', 'Refresh API health status');
    });
  });

  describe('Polling Info Footer', () => {
    it('should display polling interval info', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus()],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByText('Auto-refreshes every 60 seconds')).toBeInTheDocument();
    });
  });

  describe('Header', () => {
    it('should display Activity icon and title', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus()],
        loading: false,
        error: null,
        hasDownAPI: false,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      expect(screen.getByText('API Health')).toBeInTheDocument();
    });

    it('should have red icon when API is down', () => {
      mockUseAPIHealthResult = {
        apiStatuses: [createMockAPIStatus({ status: 'down' })],
        loading: false,
        error: null,
        hasDownAPI: true,
        hasDegradedAPI: false,
        refetch: vi.fn(),
      };

      render(<APIHealthWidget />);

      // The icon should have text-red-500 class
      const widget = screen.getByTestId('api-health-widget');
      const icon = widget.querySelector('svg');
      expect(icon).toHaveClass('text-red-500');
    });
  });
});
