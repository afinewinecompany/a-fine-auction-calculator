/**
 * LandingPage Component Tests
 *
 * Tests for the landing page component and its sections.
 *
 * Story: 11.1 - Create Landing Page Component
 * Updated: Story 11.2 - Implement Hero Section (updated button text)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '@/features/landing';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('LandingPage', () => {
  describe('Component Structure', () => {
    it('renders the landing page with all sections', () => {
      renderWithRouter(<LandingPage />);

      // Check Hero section exists
      expect(screen.getByRole('region', { name: /hero section/i })).toBeInTheDocument();

      // Check Features section exists
      expect(screen.getByRole('region', { name: /features section/i })).toBeInTheDocument();

      // Check How It Works section exists
      expect(screen.getByRole('region', { name: /how it works section/i })).toBeInTheDocument();

      // Check CTA section exists
      expect(screen.getByRole('region', { name: /call to action section/i })).toBeInTheDocument();
    });

    it('renders the main heading', () => {
      renderWithRouter(<LandingPage />);

      // Updated to match Story 11.2 headline
      expect(
        screen.getByRole('heading', {
          name: /Real-Time Inflation Intelligence for Fantasy Baseball Auction Drafts/i,
        })
      ).toBeInTheDocument();
    });

    it('renders the footer with copyright', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/a fine wine company/i)).toBeInTheDocument();
    });
  });

  describe('Hero Section', () => {
    it('renders hero section content', () => {
      renderWithRouter(<LandingPage />);

      // Check for main CTA buttons (updated for Story 11.2)
      expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
      // View Demo is now in hero section, check for links
      const viewDemoLinks = screen.getAllByRole('link', { name: /view demo/i });
      expect(viewDemoLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('renders the tagline', () => {
      renderWithRouter(<LandingPage />);

      // Updated to match exact Story 11.2 subheadline
      expect(
        screen.getByText(
          /Stop guessing\. Start winning with tier-specific, position-aware inflation tracking\./i
        )
      ).toBeInTheDocument();
    });
  });

  describe('Features Grid', () => {
    it('renders all 6 features', () => {
      renderWithRouter(<LandingPage />);

      // Check for feature titles - Story 11.3 updated features
      expect(
        screen.getByRole('heading', { name: /real-time inflation tracking/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /tier-specific modeling/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /position scarcity analysis/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /automatic couch managers sync/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /mobile-desktop parity/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /manual sync fallback/i, level: 3 })
      ).toBeInTheDocument();
    });

    it('renders the features section heading', () => {
      renderWithRouter(<LandingPage />);

      expect(
        screen.getByRole('heading', { name: /everything you need to win/i })
      ).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders all 4 steps', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/configure your league/i)).toBeInTheDocument();
      expect(screen.getByText(/connect draft room/i)).toBeInTheDocument();
      expect(screen.getByText(/monitor the auction/i)).toBeInTheDocument();
      expect(screen.getByText(/win your draft/i)).toBeInTheDocument();
    });

    it('renders step numbers', () => {
      renderWithRouter(<LandingPage />);

      // Step numbers 1-4 should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('renders CTA buttons', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /view demo/i }).length).toBeGreaterThanOrEqual(1);
    });

    it('renders the CTA heading', () => {
      renderWithRouter(<LandingPage />);

      expect(
        screen.getByRole('heading', { name: /ready to dominate your draft/i })
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('renders with dark theme classes', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Main container should have dark slate background
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-slate-950');
    });

    it('renders animated background elements', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Should have animated gradient elements
      const animatedElements = container.querySelectorAll('.animate-gradient-slow');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper section landmarks', () => {
      renderWithRouter(<LandingPage />);

      // All sections should have aria-labels
      const sections = screen.getAllByRole('region');
      expect(sections.length).toBeGreaterThanOrEqual(4);
    });

    it('has proper heading hierarchy', () => {
      renderWithRouter(<LandingPage />);

      // Should have h1 for main title
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      // Should have h2 for section headings
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThanOrEqual(3);
    });
  });
});
