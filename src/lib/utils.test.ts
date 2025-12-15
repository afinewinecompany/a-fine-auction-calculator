/**
 * Sample test file to demonstrate testing setup works correctly
 * This tests simple utility functions to verify:
 * - Vitest is configured properly with globals
 * - TypeScript types work in tests
 * - Test execution works end-to-end
 *
 * Note: Using globals mode, so no imports of test/expect/describe needed
 */

// Simple utility functions for testing
function add(a: number, b: number): number {
  return a + b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

describe('Utility Functions', () => {
  describe('add', () => {
    test('should add two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5);
    });

    test('should add negative numbers correctly', () => {
      expect(add(-1, -2)).toBe(-3);
    });

    test('should add positive and negative numbers correctly', () => {
      expect(add(5, -3)).toBe(2);
    });

    test('should handle zero correctly', () => {
      expect(add(0, 0)).toBe(0);
      expect(add(5, 0)).toBe(5);
      expect(add(0, 5)).toBe(5);
    });
  });

  describe('multiply', () => {
    test('should multiply two positive numbers correctly', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    test('should multiply negative numbers correctly', () => {
      expect(multiply(-2, -3)).toBe(6);
    });

    test('should multiply positive and negative numbers correctly', () => {
      expect(multiply(5, -2)).toBe(-10);
    });

    test('should handle zero correctly', () => {
      expect(multiply(5, 0)).toBe(0);
      expect(multiply(0, 5)).toBe(0);
    });
  });
});
