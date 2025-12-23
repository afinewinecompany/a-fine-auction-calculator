/**
 * LandingPage Component Tests
 *
 * Tests for the landing page component and its sections.
 *
 * Story: 11.1 - Create Landing Page Component
 * Updated: Original design restored with router navigation
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
    it('renders the landing page with main content', () => {
      renderWithRouter(<LandingPage />);

      // Check main heading exists
      expect(
        screen.getByRole('heading', { name: /fantasy baseball auction calculator/i })
      ).toBeInTheDocument();

      // Check for feature cards
      expect(
        screen.getByRole('heading', { name: /real-time inflation tracking/i })
      ).toBeInTheDocument();

      // Check "How It Works" section exists
      expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
    });

    it('renders the main heading', () => {
      renderWithRouter(<LandingPage />);

      expect(
        screen.getByRole('heading', {
          name: /Fantasy Baseball Auction Calculator/i,
          level: 1,
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

      // Check for main CTA link
      expect(
        screen.getByRole('link', { name: /get started - login or sign up/i })
      ).toBeInTheDocument();
    });

    it('renders the tagline', () => {
      renderWithRouter(<LandingPage />);

      expect(
        screen.getByText(
          /make optimal bidding decisions during live auctions with real-time inflation tracking/i
        )
      ).toBeInTheDocument();
    });

    it('renders the dollar sign logo', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Check for the lucide DollarSign icon
      const dollarIcon = container.querySelector('.lucide-dollar-sign');
      expect(dollarIcon).toBeInTheDocument();
    });
  });

  describe('Features Grid', () => {
    it('renders all 6 features', () => {
      renderWithRouter(<LandingPage />);

      // Check for feature titles - original design features
      expect(
        screen.getByRole('heading', { name: /real-time inflation tracking/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /slow auction support/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /multiple projection systems/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /roster management/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /color-coded values/i, level: 3 })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /post-draft analysis/i, level: 3 })
      ).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    it('renders all 4 steps', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/configure your league/i)).toBeInTheDocument();
      expect(screen.getByText(/track live bids/i)).toBeInTheDocument();
      expect(screen.getByText(/watch values adjust/i)).toBeInTheDocument();
      expect(screen.getByText(/analyze your results/i)).toBeInTheDocument();
    });

    it('renders step numbers', () => {
      renderWithRouter(<LandingPage />);

      // Step numbers 1-4 should be visible
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('renders the How It Works heading', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
    });
  });

  describe('Perfect For Section', () => {
    it('renders target audience list', () => {
      renderWithRouter(<LandingPage />);

      expect(
        screen.getByText(/rotisserie, h2h categories, and h2h points leagues/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/2-30 team leagues/i)).toBeInTheDocument();
      expect(screen.getByText(/custom roster configurations/i)).toBeInTheDocument();
      // Use more specific text to avoid matching "Slow Auction Support" feature card
      expect(
        screen.getByText(/slow auction drafts with varying nomination speeds/i)
      ).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('renders CTA link to signup', () => {
      renderWithRouter(<LandingPage />);

      const ctaLink = screen.getByRole('link', { name: /get started - login or sign up/i });
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink).toHaveAttribute('href', '/signup');
    });

    it('renders free use message', () => {
      renderWithRouter(<LandingPage />);

      expect(screen.getByText(/free to use/i)).toBeInTheDocument();
      expect(screen.getByText(/no credit card required/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('renders with dark gradient theme classes', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Main container should have dark gradient background
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-gradient-to-br');
      expect(mainDiv).toHaveClass('from-slate-950');
    });

    it('renders animated background elements', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Should have animated pulse elements
      const animatedElements = container.querySelectorAll('.animate-pulse-slow');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('renders slide-in animation for features', () => {
      const { container } = renderWithRouter(<LandingPage />);

      // Should have slide-in animated elements
      const slideElements = container.querySelectorAll('.animate-slideInLeft');
      expect(slideElements.length).toBe(6);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<LandingPage />);

      // Should have h1 for main title
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent(/fantasy baseball auction calculator/i);

      // Should have h2 for section headings
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toBeInTheDocument();
    });

    it('has proper h3 headings for features', () => {
      renderWithRouter(<LandingPage />);

      const h3s = screen.getAllByRole('heading', { level: 3 });
      expect(h3s.length).toBeGreaterThanOrEqual(6);
    });
  });
});
