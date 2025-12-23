/**
 * HowItWorksSection Component Tests
 *
 * Tests for the "How It Works" section including 4 steps with icons,
 * timeline layout, and responsive design.
 *
 * Story: 11.4 - Implement "How It Works" Section
 */

import { render, screen } from '@testing-library/react';
import { HowItWorksSection } from '@/features/landing/components/HowItWorksSection';

describe('HowItWorksSection', () => {
  describe('Section Heading', () => {
    it('renders "How It Works" heading', () => {
      render(<HowItWorksSection />);

      expect(screen.getByRole('heading', { name: /how it works/i })).toBeInTheDocument();
    });

    it('section has aria-label for accessibility', () => {
      render(<HowItWorksSection />);

      expect(screen.getByRole('region', { name: /how it works section/i })).toBeInTheDocument();
    });
  });

  describe('4-Step Workflow', () => {
    it('renders exactly 4 steps', () => {
      render(<HowItWorksSection />);

      const stepNumbers = screen.getAllByText(/^[1-4]$/);
      expect(stepNumbers).toHaveLength(4);
    });

    it('renders Step 1 with exact title', () => {
      render(<HowItWorksSection />);

      expect(screen.getByText('Create your league and import projections')).toBeInTheDocument();
    });

    it('renders Step 2 with exact title', () => {
      render(<HowItWorksSection />);

      expect(screen.getByText('Connect to Couch Managers draft room')).toBeInTheDocument();
    });

    it('renders Step 3 with exact title', () => {
      render(<HowItWorksSection />);

      expect(
        screen.getByText('Monitor inflation-adjusted values in real-time')
      ).toBeInTheDocument();
    });

    it('renders Step 4 with exact title', () => {
      render(<HowItWorksSection />);

      expect(
        screen.getByText('Dominate your draft with competitive intelligence')
      ).toBeInTheDocument();
    });

    it('each step includes a brief explanation', () => {
      render(<HowItWorksSection />);

      // Step 1 description
      expect(screen.getByText(/set up your league parameters/i)).toBeInTheDocument();

      // Step 2 description
      expect(screen.getByText(/enter your couch managers room id/i)).toBeInTheDocument();

      // Step 3 description
      expect(screen.getByText(/watch as player values adjust/i)).toBeInTheDocument();

      // Step 4 description
      expect(screen.getByText(/make informed decisions/i)).toBeInTheDocument();
    });
  });

  describe('Step Numbers', () => {
    it('displays numbered step badges 1-4', () => {
      render(<HowItWorksSection />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('step numbers have emerald background styling', () => {
      render(<HowItWorksSection />);

      const stepNumber = screen.getByText('1');
      expect(stepNumber).toHaveClass('bg-emerald-500');
    });
  });

  describe('Icons', () => {
    it('each step has an icon', () => {
      const { container } = render(<HowItWorksSection />);

      // Look for SVG icons (Lucide icons are SVGs)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Timeline Layout', () => {
    it('uses horizontal layout on desktop (lg:grid-cols-4)', () => {
      const { container } = render(<HowItWorksSection />);

      const stepsContainer = container.querySelector('.grid');
      expect(stepsContainer).toHaveClass('lg:grid-cols-4');
    });

    it('uses vertical/stacked layout on mobile (grid-cols-1)', () => {
      const { container } = render(<HowItWorksSection />);

      const stepsContainer = container.querySelector('.grid');
      expect(stepsContainer).toHaveClass('grid-cols-1');
    });

    it('has connecting lines between steps on desktop', () => {
      const { container } = render(<HowItWorksSection />);

      // Look for connector elements (hidden on first/last steps)
      const connectors = container.querySelectorAll('[data-connector]');
      expect(connectors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Visual Styling', () => {
    it('section has dark slate background', () => {
      render(<HowItWorksSection />);

      const section = screen.getByRole('region', { name: /how it works section/i });
      expect(section).toHaveClass('bg-slate-900/30');
    });

    it('step titles have white color', () => {
      render(<HowItWorksSection />);

      const title = screen.getByText('Create your league and import projections');
      expect(title).toHaveClass('text-white');
    });

    it('step descriptions have slate-400 color', () => {
      render(<HowItWorksSection />);

      const description = screen.getByText(/set up your league parameters/i);
      expect(description).toHaveClass('text-slate-400');
    });

    it('icon container has emerald accent', () => {
      const { container } = render(<HowItWorksSection />);

      const iconContainers = container.querySelectorAll('.bg-emerald-500\\/10');
      expect(iconContainers.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Responsive Design', () => {
    it('uses 2-column grid on tablet (sm:grid-cols-2)', () => {
      const { container } = render(<HowItWorksSection />);

      const stepsContainer = container.querySelector('.grid');
      expect(stepsContainer).toHaveClass('sm:grid-cols-2');
    });

    it('has proper vertical gap on mobile', () => {
      const { container } = render(<HowItWorksSection />);

      const stepsContainer = container.querySelector('.grid');
      expect(stepsContainer).toHaveClass('gap-8');
    });

    it('heading has responsive text sizes', () => {
      render(<HowItWorksSection />);

      const heading = screen.getByRole('heading', { name: /how it works/i });
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('sm:text-4xl');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic heading for section title', () => {
      render(<HowItWorksSection />);

      const heading = screen.getByRole('heading', { name: /how it works/i });
      expect(heading.tagName).toBe('H2');
    });

    it('step titles use semantic headings', () => {
      render(<HowItWorksSection />);

      const stepTitles = screen.getAllByRole('heading', { level: 3 });
      expect(stepTitles).toHaveLength(4);
    });

    it('section uses region landmark', () => {
      render(<HowItWorksSection />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });
});
