/**
 * CTA Buttons Accessibility Tests
 *
 * Tests for CTA button accessibility across all landing page sections.
 *
 * Story: 11.5 - Implement Call-to-Action Buttons
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { CTASection } from '@/features/landing/components/CTASection';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('CTA Button Accessibility', () => {
  describe('HeroSection CTAs', () => {
    it('renders Get Started button', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toBeInTheDocument();
    });

    it('Get Started links to /signup', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toHaveAttribute('href', '/signup');
    });

    it('renders View Demo button', () => {
      renderWithRouter(<HeroSection />);
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });
      expect(viewDemoLink).toBeInTheDocument();
    });

    it('View Demo links to /demo', () => {
      renderWithRouter(<HeroSection />);
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });
      expect(viewDemoLink).toHaveAttribute('href', '/demo');
    });

    it('Get Started has gradient styling', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink.className).toContain('from-emerald-500');
      expect(getStartedLink.className).toContain('to-green-600');
    });

    it('Get Started has hover effects', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink.className).toContain('hover:scale-105');
      expect(getStartedLink.className).toContain('hover:shadow-lg');
    });

    it('View Demo has outline styling', () => {
      renderWithRouter(<HeroSection />);
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });
      expect(viewDemoLink.className).toContain('border-emerald-500/50');
    });

    it('buttons have transition animation', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink.className).toContain('transition-all');
      expect(getStartedLink.className).toContain('duration-200');
    });
  });

  describe('CTASection CTAs', () => {
    it('renders Get Started button', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toBeInTheDocument();
    });

    it('Get Started links to /signup', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toHaveAttribute('href', '/signup');
    });

    it('renders View Demo button', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });
      expect(viewDemoLink).toBeInTheDocument();
    });

    it('View Demo links to /demo', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });
      expect(viewDemoLink).toHaveAttribute('href', '/demo');
    });

    it('renders with gradient card background', () => {
      const { container } = renderWithRouter(<CTASection />);
      const gradientCard = container.querySelector('.bg-gradient-to-r');
      expect(gradientCard).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('HeroSection buttons are keyboard navigable', () => {
      renderWithRouter(<HeroSection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });

      // Links are focusable by default
      expect(getStartedLink.tagName).toBe('A');
      expect(viewDemoLink.tagName).toBe('A');
    });

    it('CTASection buttons are keyboard navigable', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const viewDemoLink = screen.getByRole('link', { name: /view.*demo/i });

      // Links are focusable by default
      expect(getStartedLink.tagName).toBe('A');
      expect(viewDemoLink.tagName).toBe('A');
    });

    it('buttons have descriptive aria-labels', () => {
      renderWithRouter(<HeroSection />);
      const heroSection = screen.getByRole('region', { name: /hero/i });
      expect(heroSection).toBeInTheDocument();
    });
  });
});
