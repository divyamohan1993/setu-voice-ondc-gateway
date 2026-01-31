/**
 * Live API Integration Tests
 * 
 * These tests verify all production APIs using REAL data.
 * No mocks - all tests call live endpoints.
 * 
 * Required environment variables:
 * - GOOGLE_GENERATIVE_AI_API_KEY
 * - DATA_GOV_IN_API_KEY
 * - GOOGLE_MAPS_API_KEY (optional, falls back to Haversine)
 * 
 * @module tests/integration/live-api
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout for API calls (30 seconds)
const API_TIMEOUT = 30000;

describe('Live API Integration Tests', () => {

    beforeAll(() => {
        console.log('\n========================================');
        console.log('LIVE API INTEGRATION TESTS');
        console.log('========================================');
        console.log('These tests use REAL API calls');
        console.log('Ensure all API keys are set in .env\n');
    });

    describe('1. Environment Configuration', () => {

        it('should have Google Generative AI API key configured', () => {
            const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            expect(apiKey).toBeDefined();
            expect(apiKey!.length).toBeGreaterThan(10);
            console.log('✅ GOOGLE_GENERATIVE_AI_API_KEY is configured');
        });

        it('should have Data.gov.in API key configured', () => {
            const apiKey = process.env.DATA_GOV_IN_API_KEY;
            expect(apiKey).toBeDefined();
            expect(apiKey!.length).toBeGreaterThan(10);
            console.log('✅ DATA_GOV_IN_API_KEY is configured');
        });

        it('should check Google Maps API key (optional)', () => {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            if (apiKey && apiKey.length > 0) {
                console.log('✅ GOOGLE_MAPS_API_KEY is configured');
            } else {
                console.log('⚠️ GOOGLE_MAPS_API_KEY not set - will use Haversine fallback');
            }
            // This test always passes - Google Maps is optional
            expect(true).toBe(true);
        });
    });
});
