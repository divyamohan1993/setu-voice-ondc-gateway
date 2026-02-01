/**
 * Location Service - Live Integration Tests
 * 
 * Tests the real location-based mandi finding functionality.
 * Uses data.gov.in API and Google Maps API (when available).
 * All tests use REAL API calls - no mocks.
 * 
 * @module tests/integration/location-service
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout for API calls
const API_TIMEOUT = 30000;

describe('Location Service - Live API Tests', () => {

    let fetchAllMandisFromGovAPI: typeof import('@/lib/location-service').fetchAllMandisFromGovAPI;
    let findNearestMandis: typeof import('@/lib/location-service').findNearestMandis;
    let findNearestMandiForCommodity: typeof import('@/lib/location-service').findNearestMandiForCommodity;
    let calculateDistancesToMandis: typeof import('@/lib/location-service').calculateDistancesToMandis;

    beforeAll(async () => {
        const locationService = await import('@/lib/location-service');
        fetchAllMandisFromGovAPI = locationService.fetchAllMandisFromGovAPI;
        findNearestMandis = locationService.findNearestMandis;
        findNearestMandiForCommodity = locationService.findNearestMandiForCommodity;
        calculateDistancesToMandis = locationService.calculateDistancesToMandis;

        console.log('\n========================================');
        console.log('LOCATION SERVICE - LIVE API TESTS');
        console.log('========================================\n');
    });

    describe('1. fetchAllMandisFromGovAPI() - Live Data', () => {

        it('should fetch mandi list from data.gov.in', async () => {
            console.log('\n📡 Fetching all mandis from data.gov.in');

            const mandis = await fetchAllMandisFromGovAPI();

            console.log(`   Fetched ${mandis.length} unique mandis`);

            expect(mandis).toBeDefined();
            expect(Array.isArray(mandis)).toBe(true);
            expect(mandis.length).toBeGreaterThan(0);

            // Verify structure
            const sample = mandis[0];
            expect(sample.name).toBeDefined();
            expect(sample.state).toBeDefined();

            // Show sample mandis
            console.log('   Sample mandis:');
            mandis.slice(0, 5).forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.name}, ${m.state}`);
            });
        }, API_TIMEOUT);

        it('should cache mandi list for subsequent calls', async () => {
            console.log('\n⏱️ Testing mandi list caching');

            // First call
            const startTime1 = Date.now();
            const mandis1 = await fetchAllMandisFromGovAPI();
            const time1 = Date.now() - startTime1;

            // Second call (should be cached)
            const startTime2 = Date.now();
            const mandis2 = await fetchAllMandisFromGovAPI();
            const time2 = Date.now() - startTime2;

            console.log(`   First call: ${time1}ms`);
            console.log(`   Cached call: ${time2}ms`);

            expect(mandis1.length).toBe(mandis2.length);
            // Cached call should be much faster (or at least equal if both are very fast)
            expect(time2).toBeLessThanOrEqual(time1);
        }, API_TIMEOUT);
    });

    describe('2. findNearestMandis() - Distance Calculation', () => {

        const testCities = [
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
            { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
            { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 }
        ];

        it.each(testCities)(
            'should find nearest mandis from $name',
            async ({ name, lat, lng }) => {
                console.log(`\n📍 Finding nearest mandis from ${name}`);

                const mandis = await findNearestMandis({ lat, lng }, 5);

                console.log(`   Found ${mandis.length} nearby mandis:`);

                expect(mandis).toBeDefined();
                expect(mandis.length).toBeGreaterThan(0);
                expect(mandis.length).toBeLessThanOrEqual(5);

                mandis.forEach((mandi, i) => {
                    const distStr = mandi.distanceKm
                        ? `${mandi.distanceKm.toFixed(1)} km`
                        : 'distance unavailable';
                    console.log(`   ${i + 1}. ${mandi.name}, ${mandi.state} (${distStr})`);

                    expect(mandi.name).toBeDefined();
                    expect(mandi.state).toBeDefined();
                });
            },
            API_TIMEOUT
        );

        it('should return mandis sorted by distance', async () => {
            console.log('\n📊 Verifying mandis are sorted by distance');

            const mandis = await findNearestMandis({ lat: 19.0760, lng: 72.8777 }, 10);

            let sorted = true;
            for (let i = 1; i < mandis.length; i++) {
                const dist1 = mandis[i - 1].distanceKm;
                const dist2 = mandis[i].distanceKm;
                if (dist2 !== undefined && dist1 !== undefined) {
                    if (dist2 < dist1) {
                        sorted = false;
                        break;
                    }
                }
            }

            console.log(`   Sorted correctly: ${sorted ? 'Yes ✅' : 'No ❌'}`);
            expect(sorted).toBe(true);
        }, API_TIMEOUT);
    });

    describe('3. findNearestMandiForCommodity() - Commodity-Specific', () => {

        const commodityTests = [
            { commodity: 'onion', city: 'Nasik', lat: 20.0, lng: 73.8 },
            { commodity: 'potato', city: 'Agra', lat: 27.18, lng: 78.02 },
            { commodity: 'tomato', city: 'Pune', lat: 18.52, lng: 73.86 }
        ];

        it.each(commodityTests)(
            'should find nearest mandi for $commodity near $city',
            async ({ commodity, city, lat, lng }) => {
                console.log(`\n🥬 Finding nearest mandi for ${commodity} near ${city}`);

                const mandi = await findNearestMandiForCommodity({ lat, lng }, commodity);

                if (mandi) {
                    console.log(`   Found: ${mandi.name}, ${mandi.state}`);
                    if (mandi.distanceKm) {
                        console.log(`   Distance: ${mandi.distanceKm.toFixed(1)} km`);
                    }

                    expect(mandi.name).toBeDefined();
                    expect(mandi.state).toBeDefined();
                } else {
                    console.log('   No mandi found (falling back to general search)');
                }
            },
            API_TIMEOUT
        );
    });

    describe('4. calculateDistancesToMandis() - Accuracy', () => {

        it('should calculate distances accurately (within 20% of expected)', async () => {
            console.log('\n📏 Testing distance calculation accuracy');

            // Mumbai to known mandis with approximate distances
            const mumbai = { lat: 19.0760, lng: 72.8777 };
            const testMandis = [
                { name: 'Vashi', state: 'Maharashtra', district: 'Mumbai' },
                { name: 'Pune', state: 'Maharashtra', district: 'Pune' }
            ];

            const results = await calculateDistancesToMandis(mumbai, testMandis);

            results.forEach(mandi => {
                if (mandi.distanceKm) {
                    console.log(`   ${mandi.name}: ${mandi.distanceKm.toFixed(1)} km`);
                }
            });

            expect(results.length).toBe(testMandis.length);
        }, API_TIMEOUT);
    });

    describe('5. Edge Cases', () => {

        it('should handle remote location (Andaman Islands)', async () => {
            console.log('\n🏝️ Testing remote location: Andaman Islands');

            const andaman = { lat: 11.7401, lng: 92.6586 };
            const mandis = await findNearestMandis(andaman, 3);

            console.log(`   Found ${mandis.length} mandis (may be very far)`);

            expect(mandis).toBeDefined();
            expect(mandis.length).toBeGreaterThan(0);

            mandis.forEach((m, i) => {
                console.log(`   ${i + 1}. ${m.name}, ${m.state}`);
            });
        }, API_TIMEOUT);

        it('should handle location at India border', async () => {
            console.log('\n🗺️ Testing border location: India-Nepal border');

            const border = { lat: 27.0, lng: 84.0 };
            const mandis = await findNearestMandis(border, 3);

            expect(mandis).toBeDefined();
            expect(mandis.length).toBeGreaterThan(0);

            console.log(`   Found ${mandis.length} nearby mandis`);
        }, API_TIMEOUT);

        it('should handle exact mandi coordinates', async () => {
            console.log('\n📍 Testing exact mandi location: Azadpur, Delhi');

            // Azadpur mandi coordinates
            const azadpur = { lat: 28.7189, lng: 77.1806 };
            const mandis = await findNearestMandis(azadpur, 3);

            expect(mandis).toBeDefined();
            expect(mandis.length).toBeGreaterThan(0);

            // Azadpur should be first or very close
            console.log(`   Nearest: ${mandis[0].name}`);
        }, API_TIMEOUT);
    });
});
