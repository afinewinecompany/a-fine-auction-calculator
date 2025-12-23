import '@testing-library/jest-dom';

// This file is run before each test file
// It sets up the testing environment with custom matchers

// Mock ResizeObserver for Radix UI components (tooltips, popovers, etc.)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
