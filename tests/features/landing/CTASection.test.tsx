/**
 * CTASection Component Tests
 *
 * Tests for the footer CTA section with styled buttons and accessibility.
 *
 * Story: 11.5 - Implement Call-to-Action Buttons
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CTASection } from '@/features/landing/components/CTASection';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('CTASection', () => {
  describe('Section Structure', () => {
    it('renders section with aria-label', () => {
      renderWithRouter(<CTASection />);
      expect(
        screen.getByRole('region', { name: /call to action section/i })
      ).toBeInTheDocument();
    });

    it('renders headline', () => {
      renderWithRouter(<CTASection />);
      expect(
        screen.getByRole('heading', { name: /Ready to Dominate Your Draft/i })
      ).toBeInTheDocument();
    });

    it('renders supporting text', () => {
      renderWithRouter(<CTASection />);
      expect(
        screen.getByText(/Join fantasy managers who are already using/i)
      ).toBeInTheDocument();
    });
  });

  describe('CTA Buttons', () => {
    it('renders Get Started primary CTA as link to /signup', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink).toBeInTheDocument();
      expect(getStartedLink).toHaveAttribute('href', '/signup');
    });

    it('renders View Demo secondary CTA as link to /demo', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view product demo/i });
      expect(viewDemoLink).toBeInTheDocument();
      expect(viewDemoLink).toHaveAttribute('href', '/demo');
    });

    it('primary CTA has emerald gradient styling', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const button = getStartedLink.closest('[data-slot="button"]');
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('secondary CTA has outline styling', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view product demo/i });
      const button = viewDemoLink.closest('[data-slot="button"]');
      expect(button).toHaveClass('border-emerald-500/50');
    });
  });

  describe('Accessibility', () => {
    it('primary CTA has aria-label', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      expect(getStartedLink.closest('[data-slot="button"]')).toHaveAttribute(
        'aria-label',
        'Get started with Auction Projections'
      );
    });

    it('secondary CTA has aria-label', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view product demo/i });
      expect(viewDemoLink).toHaveAttribute(
        'aria-label',
        'View product demo'
      );
    });

    it('buttons are keyboard accessible via links', () => {
      renderWithRouter(<CTASection />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(2);
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Hover Effects', () => {
    it('primary CTA has scale and shadow hover effects', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const button = getStartedLink.closest('[data-slot="button"]');
      expect(button).toHaveClass('hover:scale-105');
      expect(button).toHaveClass('hover:shadow-lg');
    });

    it('secondary CTA has scale hover effect', () => {
      renderWithRouter(<CTASection />);
      const viewDemoLink = screen.getByRole('link', { name: /view product demo/i });
      const button = viewDemoLink.closest('[data-slot="button"]');
      expect(button).toHaveClass('hover:scale-105');
    });

    it('buttons have 200ms transition duration', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const button = getStartedLink.closest('[data-slot="button"]');
      expect(button).toHaveClass('duration-200');
    });
  });

  describe('Gradient Card Background', () => {
    it('has gradient card wrapper for visual emphasis', () => {
      const { container } = renderWithRouter(<CTASection />);
      const gradientCard = container.querySelector('.bg-gradient-to-r');
      expect(gradientCard).toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('buttons stack vertically on mobile and horizontally on tablet+', () => {
      renderWithRouter(<CTASection />);
      const getStartedLink = screen.getByRole('link', { name: /get started/i });
      const buttonContainer = getStartedLink.closest('div');
      expect(buttonContainer).toHaveClass('flex-col');
      expect(buttonContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('Footer Note', () => {
    it('displays beta/no credit card note', () => {
      renderWithRouter(<CTASection />);
      expect(
        screen.getByText(/No credit card required/i)
      ).toBeInTheDocument();
    });
  });
});
