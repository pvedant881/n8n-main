import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    testMatch: ['src/tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
