/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/', '*.config.{ts,js}', 'dist/', '.bmad/'],
      thresholds: {
        // Architecture requirements: >70% components, >90% business logic
        // Starting with global thresholds, can be refined per-folder later
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
