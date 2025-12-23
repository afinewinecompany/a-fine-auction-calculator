/**
 * FeaturesGrid Component Tests
 *
 * Story 11.3: Implement Feature Showcase Grid
 * Tests for the feature showcase grid with 6 feature cards
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturesGrid } from '@/features/landing/components/FeaturesGrid';

describe('FeaturesGrid', () => {
  describe('Feature Cards', () => {
    it('renders exactly 6 feature cards', () => {
      render(<FeaturesGrid />);
      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(6);
    });

    it('renders Real-Time Inflation Tracking feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Real-Time Inflation Tracking')).toBeInTheDocument();
      expect(
        screen.getByText(/Monitor inflation as each player is drafted/i)
      ).toBeInTheDocument();
    });

    it('renders Tier-Specific Modeling feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Tier-Specific Modeling')).toBeInTheDocument();
      expect(
        screen.getByText(/Separate tracking for elite, mid-tier, and depth players/i)
      ).toBeInTheDocument();
    });

    it('renders Position Scarcity Analysis feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Position Scarcity Analysis')).toBeInTheDocument();
      expect(
        screen.getByText(/Track position-specific inflation and scarcity/i)
      ).toBeInTheDocument();
    });

    it('renders Automatic Couch Managers Sync feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Automatic Couch Managers Sync')).toBeInTheDocument();
      expect(
        screen.getByText(/Connect to your Couch Managers draft room/i)
      ).toBeInTheDocument();
    });

    it('renders Mobile-Desktop Parity feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Mobile-Desktop Parity')).toBeInTheDocument();
      expect(screen.getByText(/Full functionality on any device/i)).toBeInTheDocument();
    });

    it('renders Manual Sync Fallback feature', () => {
      render(<FeaturesGrid />);
      expect(screen.getByText('Manual Sync Fallback')).toBeInTheDocument();
      expect(
        screen.getByText(/Continue drafting even when API is down/i)
      ).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders features section with proper aria label', () => {
      render(<FeaturesGrid />);
      expect(screen.getByLabelText('Features section')).toBeInTheDocument();
    });

    it('renders section heading', () => {
      render(<FeaturesGrid />);
      expect(
        screen.getByRole('heading', { name: /Everything You Need to Win/i })
      ).toBeInTheDocument();
    });

    it('renders grid container with responsive classes', () => {
      render(<FeaturesGrid />);
      const grid = screen.getByTestId('features-grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
      expect(grid).toHaveClass('gap-8');
    });
  });

  describe('Feature Card Structure', () => {
    it('each card has an icon', () => {
      render(<FeaturesGrid />);
      const iconContainers = screen.getAllByTestId('feature-icon');
      expect(iconContainers).toHaveLength(6);
    });

    it('each card has a title and description', () => {
      render(<FeaturesGrid />);
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles).toHaveLength(6);
    });

    it('cards have hover effect classes', () => {
      render(<FeaturesGrid />);
      const cards = screen.getAllByRole('article');
      cards.forEach((card) => {
        expect(card).toHaveClass('transition-all');
        expect(card).toHaveClass('duration-300');
      });
    });
  });

  describe('Styling', () => {
    it('cards use dark slate background', () => {
      render(<FeaturesGrid />);
      const cards = screen.getAllByRole('article');
      cards.forEach((card) => {
        expect(card).toHaveClass('bg-slate-900/50');
      });
    });

    it('icon containers use emerald accent', () => {
      render(<FeaturesGrid />);
      const iconContainers = screen.getAllByTestId('feature-icon');
      iconContainers.forEach((container) => {
        expect(container).toHaveClass('text-emerald-400');
      });
    });
  });
});
