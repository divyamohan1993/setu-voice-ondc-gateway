/**
 * Vitest Configuration for Integration Tests
 * 
 * This configuration runs tests against REAL APIs
 * No mocks - all external services are called directly
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Include only integration tests
        include: ['tests/integration/**/*.test.ts'],

        // Exclude unit tests and mocks
        exclude: ['node_modules', 'tests/fixtures', 'tests/utils'],

        // Environment
        environment: 'node',

        // Globals
        globals: true,

        // Timeouts - increased for real API calls
        testTimeout: 60000,
        hookTimeout: 30000,

        // Reporter with detailed output
        reporters: ['verbose'],

        // Sequential execution to avoid API rate limits
        sequence: {
            shuffle: false,
        },

        // Setup files
        setupFiles: ['./tests/setup.ts'],
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './')
        }
    }
});
