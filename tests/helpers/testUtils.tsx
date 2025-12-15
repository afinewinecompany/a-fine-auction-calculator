import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Test wrapper with all necessary providers (Router, etc.)
 * Use this for component tests that need routing context
 */
function Providers({ children }: ProvidersProps) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

/**
 * Custom render function that wraps components with providers
 * @param ui - The React component to render
 * @param options - Optional render options
 * @returns Render result with all testing utilities
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: Providers, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as 'render' for convenience
export { renderWithProviders as render };
