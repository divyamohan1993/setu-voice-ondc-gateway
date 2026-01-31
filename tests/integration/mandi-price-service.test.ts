/**
 * Mandi Price Service - Live Integration Tests
 * 
 * Tests the real data.gov.in API for fetching live mandi prices.
 * All tests use REAL API calls - no mocks.
 * 
 * @module tests/integration/mandi-price-service
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout for API calls
const API_TIMEOUT = 30000;

// Sample commodities to test
const TEST_COMMODITIES = ['onion', 'tomato', 'potato', 'wheat', 'rice'];
const TEST_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat'];

describe('Mandi Price Service - Live API Tests', () => {

    let getMandiPrices: typeof import('@/lib/mandi-price-service').getMandiPrices;
    let getPriceSuggestion: typeof import('@/lib/mandi-price-service').getPriceSuggestion;
    let getPriceSuggestionByLocation: typeof import('@/lib/mandi-price-service').getPriceSuggestionByLocation;
    let getNearbyMandis: typeof import('@/lib/mandi-price-service').getNearbyMandis;

    beforeAll(async () => {
        // Dynamically import to ensure env vars are loaded
        const mandiService = await import('@/lib/mandi-price-service');
        getMandiPrices = mandiService.getMandiPrices;
        getPriceSuggestion = mandiService.getPriceSuggestion;
        getPriceSuggestionByLocation = mandiService.getPriceSuggestionByLocation;
        getNearbyMandis = mandiService.getNearbyMandis;

        console.log('\n========================================');
        console.log('MANDI PRICE SERVICE - LIVE API TESTS');
        console.log('========================================\n');
    });

    describe('1. getMandiPrices() - Live API', () => {

        it.each(TEST_COMMODITIES)(
            'should fetch live prices for %s from data.gov.in',
            async (commodity) => {
                console.log(`\n📡 Fetching live prices for: ${commodity}`);

                const prices = await getMandiPrices(commodity);

                console.log(`   Found ${prices.length} price records`);

                // Verify we get results
                expect(prices).toBeDefined();
                expect(Array.isArray(prices)).toBe(true);

                if (prices.length > 0) {
                    const sample = prices[0];
                    console.log(`   Sample: ${sample.market}, ${sample.state}`);
                    console.log(`   Price: ₹${sample.minPrice}-${sample.maxPrice} per quintal`);

                    // Verify structure
                    expect(sample.commodity).toBeDefined();
                    expect(sample.market).toBeDefined();
                    expect(sample.state).toBeDefined();
                    expect(typeof sample.minPrice).toBe('number');
                    expect(typeof sample.maxPrice).toBe('number');
                    expect(sample.minPrice).toBeGreaterThanOrEqual(0);
                    expect(sample.maxPrice).toBeGreaterThanOrEqual(sample.minPrice);
                }
            },
            API_TIMEOUT
        );

        it.each(TEST_STATES)(
            'should fetch prices filtered by state: %s',
            async (state) => {
                console.log(`\n📡 Fetching prices for onion in ${state}`);

                const prices = await getMandiPrices('onion', state);

                console.log(`   Found ${prices.length} records in ${state}`);

                expect(prices).toBeDefined();
                expect(Array.isArray(prices)).toBe(true);

                // If we have results, verify they're from the correct state
                if (prices.length > 0) {
                    const sample = prices[0];
                    console.log(`   Market: ${sample.market}`);
                    expect(sample.state.toLowerCase()).toContain(state.toLowerCase().split(' ')[0]);
                }
            },
            API_TIMEOUT
        );
    });

    describe('2. getPriceSuggestion() - Live API', () => {

        it.each(TEST_COMMODITIES)(
            'should get price suggestion for %s',
            async (commodity) => {
                console.log(`\n💡 Getting price suggestion for: ${commodity}`);

                const suggestion = await getPriceSuggestion(commodity);

                console.log(`   Market: ${suggestion.market}`);
                console.log(`   Price range: ₹${suggestion.pricePerKg.min}-${suggestion.pricePerKg.max}/kg`);
                console.log(`   Suggested: ₹${suggestion.pricePerKg.average}/kg`);
                console.log(`   Trend: ${suggestion.marketTrend}`);

                // Verify structure
                expect(suggestion.commodity).toBeDefined();
                expect(suggestion.market).toBeDefined();
                expect(suggestion.pricePerKg).toBeDefined();
                expect(suggestion.pricePerKg.min).toBeGreaterThanOrEqual(0);
                expect(suggestion.pricePerKg.max).toBeGreaterThanOrEqual(suggestion.pricePerKg.min);
                expect(['rising', 'stable', 'falling']).toContain(suggestion.marketTrend);
                expect(suggestion.advice).toBeDefined();
                expect(suggestion.advice.length).toBeGreaterThan(0);
            },
            API_TIMEOUT
        );

        it('should provide market advice in the suggestion', async () => {
            console.log('\n💡 Testing market advice generation');

            const suggestion = await getPriceSuggestion('tomato');

            expect(suggestion.advice).toBeDefined();
            expect(typeof suggestion.advice).toBe('string');
            expect(suggestion.advice.length).toBeGreaterThan(10);

            console.log(`   Advice: "${suggestion.advice.substring(0, 100)}..."`);
        }, API_TIMEOUT);
    });

    describe('3. getPriceSuggestionByLocation() - Live API', () => {

        // Test locations (major Indian cities)
        const testLocations = [
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
            { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
            { name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
        ];

        it.each(testLocations)(
            'should find nearest mandi for user in $name',
            async ({ name, lat, lng }) => {
                console.log(`\n📍 Testing location-based pricing for ${name}`);
                console.log(`   Coordinates: (${lat}, ${lng})`);

                const suggestion = await getPriceSuggestionByLocation('onion', { lat, lng });

                console.log(`   Nearest mandi: ${suggestion.nearestMandi.name}`);
                if (suggestion.distanceKm) {
                    console.log(`   Distance: ${suggestion.distanceKm.toFixed(1)} km`);
                }
                console.log(`   Price: ₹${suggestion.pricePerKg.average}/kg`);

                // Verify structure
                expect(suggestion.nearestMandi).toBeDefined();
                expect(suggestion.nearestMandi.name).toBeDefined();
                expect(suggestion.market).toBeDefined();
                expect(suggestion.pricePerKg).toBeDefined();
            },
            API_TIMEOUT
        );
    });

    describe('4. getNearbyMandis() - Live API', () => {

        it('should find nearby mandis from Mumbai location', async () => {
            console.log('\n📍 Finding nearby mandis from Mumbai');

            const mumbaiLocation = { lat: 19.0760, lng: 72.8777 };
            const mandis = await getNearbyMandis(mumbaiLocation, 5);

            console.log(`   Found ${mandis.length} nearby mandis`);

            expect(mandis).toBeDefined();
            expect(Array.isArray(mandis)).toBe(true);
            expect(mandis.length).toBeGreaterThan(0);
            expect(mandis.length).toBeLessThanOrEqual(5);

            // Verify structure
            mandis.forEach((mandi, i) => {
                console.log(`   ${i + 1}. ${mandi.name}, ${mandi.state}${mandi.distanceKm ? ` (${mandi.distanceKm.toFixed(1)} km)` : ''}`);
                expect(mandi.name).toBeDefined();
                expect(mandi.state).toBeDefined();
            });

            // Verify sorted by distance if available
            if (mandis[0].distanceKm !== undefined && mandis.length > 1) {
                for (let i = 1; i < mandis.length; i++) {
                    if (mandis[i].distanceKm !== undefined) {
                        expect(mandis[i].distanceKm).toBeGreaterThanOrEqual(mandis[i - 1].distanceKm!);
                    }
                }
            }
        }, API_TIMEOUT);

        it('should find nearby mandis from rural location', async () => {
            console.log('\n📍 Finding nearby mandis from Lasalgaon area (rural Maharashtra)');

            // Lasalgaon is a major onion mandi
            const ruralLocation = { lat: 20.1486, lng: 74.2114 };
            const mandis = await getNearbyMandis(ruralLocation, 3);

            console.log(`   Found ${mandis.length} nearby mandis`);

            expect(mandis).toBeDefined();
            expect(mandis.length).toBeGreaterThan(0);

            mandis.forEach((mandi, i) => {
                console.log(`   ${i + 1}. ${mandi.name}, ${mandi.state}`);
            });
        }, API_TIMEOUT);
    });

    describe('5. API Response Time Performance', () => {

        it('should fetch prices within acceptable time (< 10s)', async () => {
            console.log('\n⏱️ Testing API response time');

            const startTime = Date.now();
            await getMandiPrices('onion');
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            console.log(`   Response time: ${responseTime}ms`);

            expect(responseTime).toBeLessThan(10000); // Should complete in under 10 seconds
        }, API_TIMEOUT);

        it('should handle concurrent requests', async () => {
            console.log('\n⏱️ Testing concurrent API requests');

            const startTime = Date.now();

            const results = await Promise.all([
                getMandiPrices('onion'),
                getMandiPrices('tomato'),
                getMandiPrices('potato')
            ]);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            console.log(`   3 concurrent requests completed in ${totalTime}ms`);

            results.forEach((result, i) => {
                expect(Array.isArray(result)).toBe(true);
                console.log(`   Request ${i + 1}: ${result.length} results`);
            });

            expect(totalTime).toBeLessThan(15000); // Concurrent should still be fast
        }, API_TIMEOUT);
    });

    describe('6. Error Handling & Fallbacks', () => {

        it('should handle unknown commodity gracefully', async () => {
            console.log('\n🔧 Testing unknown commodity handling');

            const suggestion = await getPriceSuggestion('unknowncommodityxyz123');

            // Should still return a valid structure with fallback/estimated values
            expect(suggestion).toBeDefined();
            expect(suggestion.pricePerKg).toBeDefined();

            console.log(`   Handled gracefully with fallback price: ₹${suggestion.pricePerKg.average}/kg`);
        }, API_TIMEOUT);

        it('should handle special characters in commodity name', async () => {
            console.log('\n🔧 Testing special character handling');

            // Hindi word for onion
            const suggestion = await getPriceSuggestion('प्याज');

            expect(suggestion).toBeDefined();
            console.log(`   Commodity: ${suggestion.commodity}`);
            console.log(`   Market: ${suggestion.market}`);
        }, API_TIMEOUT);
    });
});
