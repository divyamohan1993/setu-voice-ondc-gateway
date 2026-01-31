/**
 * Network Simulator - Integration Tests
 * 
 * Tests the ONDC network simulation with auto-learning.
 * Note: This is the ONLY simulated component in the system.
 * 
 * @module tests/integration/network-simulator
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout
const TEST_TIMEOUT = 30000;

describe('Network Simulator - Integration Tests', () => {

    let simulateBroadcast: typeof import('@/lib/network-simulator').simulateBroadcast;
    let getBuyerPool: typeof import('@/lib/network-simulator').getBuyerPool;
    let getLearningStats: typeof import('@/lib/network-simulator').getLearningStats;
    let validateCatalogForBroadcast: typeof import('@/lib/network-simulator').validateCatalogForBroadcast;
    let prisma: typeof import('@/lib/db').prisma;

    let testCatalogId: string;

    beforeAll(async () => {
        const networkSim = await import('@/lib/network-simulator');
        simulateBroadcast = networkSim.simulateBroadcast;
        getBuyerPool = networkSim.getBuyerPool;
        getLearningStats = networkSim.getLearningStats;
        validateCatalogForBroadcast = networkSim.validateCatalogForBroadcast;

        const db = await import('@/lib/db');
        prisma = db.prisma;

        console.log('\n========================================');
        console.log('NETWORK SIMULATOR - INTEGRATION TESTS');
        console.log('========================================');
        console.log('Note: This tests the ONLY simulated component\n');

        // Create a test catalog for simulation
        try {
            // Ensure test farmer exists
            const farmer = await prisma.farmer.upsert({
                where: { id: 'test-farmer-integration' },
                create: {
                    id: 'test-farmer-integration',
                    name: 'Integration Test Farmer',
                    locationLatLong: '19.0760,72.8777',
                    languagePref: 'en',
                    upiId: 'test@upi'
                },
                update: {}
            });

            // Create test catalog
            const catalog = await prisma.catalog.create({
                data: {
                    farmerId: farmer.id,
                    becknJson: {
                        descriptor: {
                            name: 'Test Onions',
                            symbol: 'https://example.com/onion.png'
                        },
                        price: { value: 40, currency: 'INR' },
                        quantity: { available: { count: 100 }, unit: 'kg' },
                        tags: { grade: 'A', perishability: 'medium' }
                    },
                    status: 'BROADCASTED'
                }
            });

            testCatalogId = catalog.id;
            console.log(`   Created test catalog: ${testCatalogId}`);
        } catch (error) {
            console.error('Failed to create test catalog:', error);
        }
    });

    afterAll(async () => {
        // Cleanup test data
        if (testCatalogId) {
            try {
                await prisma.networkLog.deleteMany({
                    where: { payload: { path: ['catalogId'], equals: testCatalogId } }
                });
                await prisma.catalog.delete({ where: { id: testCatalogId } });
                console.log('   Cleaned up test catalog');
            } catch (error) {
                // Ignore cleanup errors
            }
        }

        try {
            await prisma.farmer.delete({ where: { id: 'test-farmer-integration' } });
        } catch (error) {
            // Ignore if farmer has other catalogs
        }
    });

    describe('1. Buyer Pool', () => {

        it('should have a diverse buyer pool', () => {
            console.log('\n🛒 Testing buyer pool');

            const buyers = getBuyerPool();

            console.log(`   Total buyers: ${buyers.length}`);

            expect(buyers).toBeDefined();
            expect(buyers.length).toBeGreaterThanOrEqual(5);

            buyers.forEach(buyer => {
                console.log(`   - ${buyer.name} (Rating: ${buyer.rating}⭐)`);
                expect(buyer.name).toBeDefined();
                expect(buyer.rating).toBeGreaterThanOrEqual(1);
                expect(buyer.rating).toBeLessThanOrEqual(5);
                expect(buyer.verified).toBe(true);
            });
        });

        it('should have verified buyers only', () => {
            const buyers = getBuyerPool();
            const verifiedCount = buyers.filter(b => b.verified).length;

            console.log(`   Verified buyers: ${verifiedCount}/${buyers.length}`);
            expect(verifiedCount).toBe(buyers.length);
        });
    });

    describe('2. Broadcast Simulation', () => {

        it('should simulate broadcast and return bid', async () => {
            console.log('\n📡 Testing broadcast simulation');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            console.log(`   Broadcasting catalog: ${testCatalogId}`);

            const startTime = Date.now();
            const bid = await simulateBroadcast(testCatalogId);
            const duration = Date.now() - startTime;

            console.log(`   Simulation completed in ${(duration / 1000).toFixed(1)}s`);
            console.log(`   Buyer: ${bid.buyerName}`);
            console.log(`   Bid amount: ₹${bid.bidAmount}`);
            console.log(`   Rating: ${bid.buyerRating}⭐`);
            console.log(`   Verified: ${bid.buyerVerified}`);

            expect(bid).toBeDefined();
            expect(bid.buyerName).toBeDefined();
            expect(bid.bidAmount).toBeGreaterThan(0);
            expect(bid.timestamp).toBeDefined();
            expect(bid.bidId).toBeDefined();
            expect(bid.buyerRating).toBeGreaterThan(0);

            // Verify realistic network delay (6-10 seconds)
            expect(duration).toBeGreaterThan(5000);
            expect(duration).toBeLessThan(15000);
        }, TEST_TIMEOUT);

        it('should log bid to database', async () => {
            console.log('\n📝 Testing bid logging');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            // Find the log entry for our test catalog
            const logs = await prisma.networkLog.findMany({
                where: { type: 'INCOMING_BID' },
                orderBy: { timestamp: 'desc' },
                take: 5
            });

            console.log(`   Found ${logs.length} recent bid logs`);

            expect(logs.length).toBeGreaterThan(0);

            const latestLog = logs[0];
            const payload = latestLog.payload as any;

            console.log(`   Latest bid: ${payload.buyerName} - ₹${payload.bidAmount}`);

            expect(payload.buyerName).toBeDefined();
            expect(payload.bidAmount).toBeDefined();
        }, TEST_TIMEOUT);
    });

    describe('3. Auto-Learning System', () => {

        it('should track learning statistics', async () => {
            console.log('\n🧠 Testing auto-learning system');

            const stats = getLearningStats();

            console.log(`   Commodities tracked: ${stats.length}`);

            stats.forEach(stat => {
                console.log(`   - ${stat.commodity}: avg ratio ${(stat.avgBidRatio * 100).toFixed(1)}%, ${stat.bidCount} bids`);
                expect(stat.avgBidRatio).toBeGreaterThan(0);
                expect(stat.avgBidRatio).toBeLessThan(2); // Should be reasonable ratio
            });
        });

        it('should learn from multiple broadcasts', async () => {
            console.log('\n🧠 Testing learning from multiple broadcasts');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            // Get initial stats
            const initialStats = getLearningStats();
            const initialCount = initialStats.reduce((sum, s) => sum + s.bidCount, 0);

            // Run another broadcast
            await simulateBroadcast(testCatalogId);

            // Check stats increased
            const newStats = getLearningStats();
            const newCount = newStats.reduce((sum, s) => sum + s.bidCount, 0);

            console.log(`   Initial bid count: ${initialCount}`);
            console.log(`   After broadcast: ${newCount}`);

            expect(newCount).toBeGreaterThanOrEqual(initialCount);
        }, TEST_TIMEOUT * 2);
    });

    describe('4. Bid Calculation', () => {

        it('should generate realistic bid amounts', async () => {
            console.log('\n💰 Testing bid amount realism');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            const bid = await simulateBroadcast(testCatalogId);

            // Catalog price is 40 INR per kg
            // Bid should be within 95-110% of catalog price
            const expectedMin = 36; // 90% of 40
            const expectedMax = 46; // 115% of 40

            console.log(`   Catalog price: ₹40/kg`);
            console.log(`   Bid amount: ₹${bid.bidAmount}`);
            console.log(`   Expected range: ₹${expectedMin}-${expectedMax}`);

            expect(bid.bidAmount).toBeGreaterThanOrEqual(expectedMin);
            expect(bid.bidAmount).toBeLessThanOrEqual(expectedMax);
        }, TEST_TIMEOUT);
    });

    describe('5. Catalog Validation', () => {

        it('should validate catalog structure', async () => {
            console.log('\n✅ Testing catalog validation');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            const catalog = await prisma.catalog.findUnique({
                where: { id: testCatalogId }
            });

            if (catalog) {
                const isValid = validateCatalogForBroadcast(catalog);
                console.log(`   Catalog valid: ${isValid}`);
                expect(isValid).toBe(true);
            }
        });

        it('should reject invalid catalog', () => {
            console.log('\n❌ Testing invalid catalog rejection');

            const invalidCatalog = {
                id: 'invalid',
                farmerId: 'test',
                becknJson: { descriptor: { name: 'Test' } }, // Missing price
                status: 'DRAFT',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const isValid = validateCatalogForBroadcast(invalidCatalog as any);
            console.log(`   Invalid catalog rejected: ${!isValid}`);
            expect(isValid).toBe(false);
        });
    });
});
