/**
 * HeroSection Component Tests
 *
 * Tests for the hero section including headline, subheadline, and CTA buttons.
 *
 * Story: 11.2 - Implement Hero Section
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '@/features/landing/components/HeroSection';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('HeroSection', () => {
  describe('Headline and Subheadline', () => {
    it('renders the exact headline text from acceptance criteria', () => {
      renderWithRouter(<HeroSection />);

      expect(
        screen.getByRole('heading', {
          name: /Real-Time Inflation Intelligence for Fantasy Baseball Auction Drafts/i,
        })
      ).toBeInTheDocument();
    });

    it('renders the exact subheadline text from acceptance criteria', () => {
      renderWithRouter(<HeroSection />);

      expect(
        screen.getByText(
          /Stop guessing\. Start winning with tier-specific, position-aware inflation tracking\./i
        )
      ).toBeInTheDocument();
    });

    it('headline has gradient text styling', () => {
      renderWithRouter(<HeroSection />);

      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toHaveClass('bg-gradient-to-r');
      expect(headline).toHaveClass('from-emerald-400');
      expect(headline).toHaveClass('to-green-500');
      expect(headline).toHaveClass('bg-clip-text');
      expect(headline).toHaveClass('text-transparent');
    });

    it('subheadline has slate-400 color', () => {
      renderWithRouter(<HeroSection />);

      const subheadline = screen.getByText(/Stop guessing\. Start winning/i);
      expect(subheadline).toHaveClass('text-slate-400');
    });
  });

  describe('CTA Buttons', () => {
    it('renders Get Started primary CTA button', () => {
      renderWithRouter(<HeroSection />);

      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toBeInTheDocument();
      expect(getStartedLink).toHaveAttribute('href', '/signup');
    });

    it('renders View Demo secondary CTA button', () => {
      renderWithRouter(<HeroSection />);

      const viewDemoLink = screen.getByRole('link', { name: /view demo/i });
      expect(viewDemoLink).toBeInTheDocument();
      expect(viewDemoLink).toHaveAttribute('href', '/demo');
    });

    it('primary CTA has emerald gradient background', () => {
      renderWithRouter(<HeroSection />);

      // The parent button should have gradient classes
      const buttonElement = screen.getByRole('link', { name: /get started/i });
      expect(buttonElement.closest('[data-slot="button"]')).toHaveClass('bg-gradient-to-r');
    });

    it('secondary CTA has outline variant styling', () => {
      renderWithRouter(<HeroSection />);

      const viewDemoButton = screen.getByRole('link', { name: /view demo/i });
      expect(viewDemoButton.closest('[data-slot="button"]')).toHaveClass('border-emerald-500/50');
    });
  });

  describe('Layout and Structure', () => {
    it('renders hero section with aria-label', () => {
      renderWithRouter(<HeroSection />);

      expect(screen.getByRole('region', { name: /hero section/i })).toBeInTheDocument();
    });

    it('has minimum height of 80vh', () => {
      renderWithRouter(<HeroSection />);

      const heroSection = screen.getByRole('region', { name: /hero section/i });
      expect(heroSection).toHaveClass('min-h-[80vh]');
    });

    it('centers content vertically and horizontally', () => {
      renderWithRouter(<HeroSection />);

      const heroSection = screen.getByRole('region', { name: /hero section/i });
      expect(heroSection).toHaveClass('flex');
      expect(heroSection).toHaveClass('items-center');
      expect(heroSection).toHaveClass('justify-center');
    });
  });

  describe('Responsive Design', () => {
    it('buttons stack vertically on mobile (flex-col) and horizontally on tablet+ (md:flex-row)', () => {
      renderWithRouter(<HeroSection />);

      const buttonContainer = screen.getByRole('link', { name: /get started/i }).closest('div');
      expect(buttonContainer).toHaveClass('flex-col');
      expect(buttonContainer).toHaveClass('md:flex-row');
    });

    it('headline has responsive text sizes', () => {
      renderWithRouter(<HeroSection />);

      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toHaveClass('text-3xl');
      expect(headline).toHaveClass('sm:text-4xl');
      expect(headline).toHaveClass('md:text-5xl');
      expect(headline).toHaveClass('lg:text-6xl');
    });
  });

  describe('Visual Enhancements', () => {
    it('has animated gradient background layer', () => {
      const { container } = renderWithRouter(<HeroSection />);

      const gradientBg = container.querySelector('.animate-gradient-shift');
      expect(gradientBg).toBeInTheDocument();
    });

    it('has radial overlay for depth', () => {
      const { container } = renderWithRouter(<HeroSection />);

      const radialOverlay = container.querySelector(
        '[class*="bg-[radial-gradient"]'
      );
      expect(radialOverlay).toBeInTheDocument();
    });

    it('background elements are hidden from screen readers', () => {
      const { container } = renderWithRouter(<HeroSection />);

      const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(hiddenElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic h1 for the main headline', () => {
      renderWithRouter(<HeroSection />);

      const headline = screen.getByRole('heading', { level: 1 });
      expect(headline).toBeInTheDocument();
    });

    it('section has proper landmark role', () => {
      renderWithRouter(<HeroSection />);

      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-label', 'Hero section');
    });

    it('links are properly accessible', () => {
      renderWithRouter(<HeroSection />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });
});
