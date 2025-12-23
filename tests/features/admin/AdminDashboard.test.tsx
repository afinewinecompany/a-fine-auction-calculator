/**
 * AdminDashboard Component Tests
 *
 * Tests for the admin dashboard UI component.
 *
 * Story: 13.1 - Create Admin Dashboard Route
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

describe('AdminDashboard', () => {
  describe('Header', () => {
    it('should render dashboard header with title', () => {
      render(<AdminDashboard />);

      expect(
        screen.getByRole('heading', { name: /admin dashboard/i, level: 1 })
      ).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Real-time system monitoring')).toBeInTheDocument();
    });

    it('should render Shield icon in header', () => {
      render(<AdminDashboard />);

      // The Shield icon should be present (check for svg element with aria-hidden)
      const header = screen.getByRole('banner');
      const icon = header.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Navigation', () => {
    it('should render admin navigation', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('navigation', { name: /admin navigation/i })).toBeInTheDocument();
    });

    it('should render Dashboard nav item as active', () => {
      render(<AdminDashboard />);

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
      expect(dashboardButton).toHaveAttribute('aria-current', 'page');
    });

    it('should render all placeholder nav items', () => {
      render(<AdminDashboard />);

      // Check for key navigation items
      expect(screen.getByRole('button', { name: /active drafts/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /api health/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /error rates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /connections/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sync logs/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('should have disabled state on placeholder nav items', () => {
      render(<AdminDashboard />);

      const activeDraftsButton = screen.getByRole('button', { name: /active drafts/i });
      expect(activeDraftsButton).toBeDisabled();
    });

    it('should show tooltip hint for disabled items', () => {
      render(<AdminDashboard />);

      const activeDraftsButton = screen.getByRole('button', { name: /active drafts/i });
      expect(activeDraftsButton).toHaveAttribute('title', 'Coming in future stories');
    });
  });

  describe('Welcome Card', () => {
    it('should render welcome message', () => {
      render(<AdminDashboard />);

      expect(
        screen.getByRole('heading', { name: /welcome to admin dashboard/i, level: 2 })
      ).toBeInTheDocument();
    });

    it('should list upcoming features', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/active drafts tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/api health monitoring/i)).toBeInTheDocument();
      expect(screen.getByText(/error rate alerts/i)).toBeInTheDocument();
      expect(screen.getByText(/connection metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/performance analytics/i)).toBeInTheDocument();
    });
  });

  describe('System Status Card', () => {
    it('should render system status card', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('heading', { name: /system status/i, level: 2 })).toBeInTheDocument();
    });

    it('should show operational status indicators', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/api status/i)).toBeInTheDocument();
      expect(screen.getByText('Operational')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    it('should show future availability note', () => {
      render(<AdminDashboard />);

      expect(
        screen.getByText(/real-time status will be available in story 13.3/i)
      ).toBeInTheDocument();
    });
  });

  describe('Quick Stats Card', () => {
    it('should render quick stats card', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('heading', { name: /quick stats/i, level: 2 })).toBeInTheDocument();
    });

    it('should show placeholder stats', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Active Drafts')).toBeInTheDocument();
      expect(screen.getByText('Users Online')).toBeInTheDocument();
      expect(screen.getByText('API Requests/min')).toBeInTheDocument();
    });

    it('should show dash placeholders for stats values', () => {
      render(<AdminDashboard />);

      // Should have -- placeholders for stats that aren't implemented yet
      const dashPlaceholders = screen.getAllByText('--');
      expect(dashPlaceholders.length).toBeGreaterThanOrEqual(3);
    });

    it('should show future availability note', () => {
      render(<AdminDashboard />);

      expect(screen.getByText(/live metrics coming in stories 13.2-13.11/i)).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have dark slate theme background', () => {
      render(<AdminDashboard />);

      const dashboard = screen.getByRole('banner').parentElement;
      expect(dashboard).toHaveClass('bg-slate-950');
    });

    it('should have emerald accent on active nav button', () => {
      render(<AdminDashboard />);

      const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
      expect(dashboardButton).toHaveClass('bg-emerald-600');
    });

    it('should use responsive navigation layout', () => {
      render(<AdminDashboard />);

      const nav = screen.getByRole('navigation');
      const navContainer = nav.querySelector('.flex');
      expect(navContainer).toHaveClass('flex-wrap');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic header element', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should have semantic nav element with label', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('navigation', { name: /admin navigation/i })).toBeInTheDocument();
    });

    it('should have semantic main element', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should mark Shield icon as decorative', () => {
      render(<AdminDashboard />);

      const header = screen.getByRole('banner');
      const icon = header.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper heading hierarchy', () => {
      render(<AdminDashboard />);

      // h1 for main title
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // h2 for card titles
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Grid Layout', () => {
    it('should render cards in a grid layout', () => {
      render(<AdminDashboard />);

      const main = screen.getByRole('main');
      const grid = main.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });
});
