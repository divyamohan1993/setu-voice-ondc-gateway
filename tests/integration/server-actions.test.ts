/**
 * Server Actions - Live Integration Tests
 * 
 * Tests all server actions using REAL API calls.
 * Verifies frontend-backend communication.
 * 
 * @module tests/integration/server-actions
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout
const TEST_TIMEOUT = 60000;

describe('Server Actions - Live Integration Tests', () => {

    // Import types
    let startConversationAction: typeof import('@/app/voice-actions').startConversationAction;
    let processVoiceAction: typeof import('@/app/voice-actions').processVoiceAction;
    let getLivePricesAction: typeof import('@/app/voice-actions').getLivePricesAction;
    let broadcastFromVoiceAction: typeof import('@/app/voice-actions').broadcastFromVoiceAction;
    let getSupportedLanguagesAction: typeof import('@/app/voice-actions').getSupportedLanguagesAction;

    let translateVoiceAction: typeof import('@/app/actions').translateVoiceAction;
    let saveCatalogAction: typeof import('@/app/actions').saveCatalogAction;
    let broadcastCatalogAction: typeof import('@/app/actions').broadcastCatalogAction;
    let getNetworkLogsAction: typeof import('@/app/actions').getNetworkLogsAction;

    let prisma: typeof import('@/lib/db').prisma;

    let testFarmerId: string = 'integration-test-farmer';
    let testCatalogId: string | null = null;

    beforeAll(async () => {
        // Import voice actions
        const voiceActions = await import('@/app/voice-actions');
        startConversationAction = voiceActions.startConversationAction;
        processVoiceAction = voiceActions.processVoiceAction;
        getLivePricesAction = voiceActions.getLivePricesAction;
        broadcastFromVoiceAction = voiceActions.broadcastFromVoiceAction;
        getSupportedLanguagesAction = voiceActions.getSupportedLanguagesAction;

        // Import catalog actions
        const actions = await import('@/app/actions');
        translateVoiceAction = actions.translateVoiceAction;
        saveCatalogAction = actions.saveCatalogAction;
        broadcastCatalogAction = actions.broadcastCatalogAction;
        getNetworkLogsAction = actions.getNetworkLogsAction;

        // Import database
        const db = await import('@/lib/db');
        prisma = db.prisma;

        console.log('\n========================================');
        console.log('SERVER ACTIONS - LIVE INTEGRATION TESTS');
        console.log('========================================');
        console.log('Testing frontend-backend communication\n');

        // Ensure test farmer exists
        try {
            await prisma.farmer.upsert({
                where: { id: testFarmerId },
                create: {
                    id: testFarmerId,
                    name: 'Integration Test Farmer',
                    locationLatLong: '19.0760,72.8777',
                    languagePref: 'en',
                    upiId: 'integration-test@upi'
                },
                update: {}
            });
        } catch (error) {
            console.error('Failed to create test farmer:', error);
        }
    });

    afterAll(async () => {
        // Cleanup
        try {
            if (testCatalogId) {
                await prisma.networkLog.deleteMany({
                    where: { payload: { path: ['catalogId'], equals: testCatalogId } }
                });
                await prisma.catalog.delete({ where: { id: testCatalogId } });
            }
            await prisma.farmer.delete({ where: { id: testFarmerId } });
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    describe('1. startConversationAction()', () => {

        const languageCodes = ['hi', 'en', 'mr', 'ta', 'te', 'kn'];

        it.each(languageCodes)(
            'should start conversation in %s language',
            async (langCode) => {
                console.log(`\n🗣️ Starting conversation in ${langCode}`);

                const result = await startConversationAction(langCode);

                console.log(`   Success: ${result.success}`);
                console.log(`   Session ID: ${result.sessionId}`);
                console.log(`   Greeting: "${result.greeting.substring(0, 40)}..."`);

                expect(result.success).toBe(true);
                expect(result.sessionId).toBeDefined();
                expect(result.sessionId.length).toBeGreaterThan(0);
                expect(result.greeting).toBeDefined();
                expect(result.language).toBeDefined();
                expect(result.language.code).toBe(langCode);
            }
        );

        it('should reject unsupported language', async () => {
            const result = await startConversationAction('xyz');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('2. processVoiceAction()', () => {

        it('should process Hindi voice input', async () => {
            console.log('\n🎤 Processing Hindi voice input');

            // First start a conversation
            const startResult = await startConversationAction('hi');
            expect(startResult.success).toBe(true);

            // Initialize state
            const { initConversation, getLanguageByCode } = await import('@/lib/voice-conversation-agent');
            const language = getLanguageByCode('hi')!;
            const state = initConversation(language);

            // Process voice
            const result = await processVoiceAction(state, 'मेरे पास 100 किलो प्याज है, 40 रुपये किलो');

            console.log(`   Success: ${result.success}`);
            console.log(`   Stage: ${result.response?.stage}`);
            console.log(`   Commodity: ${result.newState?.commodity}`);

            expect(result.success).toBe(true);
            expect(result.response).toBeDefined();
            expect(result.newState).toBeDefined();
        }, TEST_TIMEOUT);

        it('should process English voice input', async () => {
            console.log('\n🎤 Processing English voice input');

            const { initConversation, getLanguageByCode } = await import('@/lib/voice-conversation-agent');
            const language = getLanguageByCode('en')!;
            const state = initConversation(language);

            const result = await processVoiceAction(
                state,
                'I have 50 kg of fresh tomatoes at 35 rupees per kg'
            );

            console.log(`   Success: ${result.success}`);
            console.log(`   Quantity: ${result.newState?.quantity}`);

            expect(result.success).toBe(true);
            expect(result.newState?.quantity).toBe(50);
        }, TEST_TIMEOUT);
    });

    describe('3. getLivePricesAction()', () => {

        const commodities = ['onion', 'tomato', 'potato'];

        it.each(commodities)(
            'should fetch live prices for %s',
            async (commodity) => {
                console.log(`\n💰 Fetching live prices for ${commodity}`);

                const result = await getLivePricesAction(commodity);

                console.log(`   Success: ${result.success}`);

                if (result.success && result.priceSuggestion) {
                    console.log(`   Market: ${result.priceSuggestion.market}`);
                    console.log(`   Price: ₹${result.priceSuggestion.pricePerKg.average}/kg`);
                    console.log(`   Trend: ${result.priceSuggestion.marketTrend}`);

                    expect(result.priceSuggestion.pricePerKg.average).toBeGreaterThan(0);
                }

                expect(result.success).toBe(true);
            },
            TEST_TIMEOUT
        );

        it('should include location in results', async () => {
            console.log('\n📍 Testing location-based prices');

            const result = await getLivePricesAction('onion', 'Maharashtra');

            expect(result.success).toBe(true);
            if (result.priceSuggestion) {
                console.log(`   Market: ${result.priceSuggestion.market}`);
            }
        }, TEST_TIMEOUT);
    });

    describe('4. translateVoiceAction()', () => {

        it('should translate voice to Beckn JSON', async () => {
            console.log('\n🔄 Testing voice translation');

            const result = await translateVoiceAction(
                'I have 100 kg of Grade A onions from Nasik, selling at 45 rupees per kg'
            );

            console.log(`   Success: ${result.success}`);

            if (result.success && result.catalog) {
                console.log(`   Commodity: ${result.catalog.descriptor.name}`);
                console.log(`   Quantity: ${result.catalog.quantity.available.count} ${result.catalog.quantity.unit}`);
                console.log(`   Price: ₹${result.catalog.price.value}`);

                expect(result.catalog.descriptor.name).toBeDefined();
                expect(result.catalog.quantity.available.count).toBe(100);
                expect(result.catalog.price.value).toBe(45);
            }

            expect(result.success).toBe(true);
        }, TEST_TIMEOUT);

        it('should reject too short input', async () => {
            const result = await translateVoiceAction('hi');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('5. saveCatalogAction()', () => {

        it('should save catalog to database', async () => {
            console.log('\n💾 Testing catalog save');

            const catalogData = {
                descriptor: { name: 'Test Tomatoes', symbol: 'https://example.com/tomato.png' },
                price: { value: 35, currency: 'INR' },
                quantity: { available: { count: 50 }, unit: 'kg' },
                tags: { grade: 'A', perishability: 'high' }
            };

            const result = await saveCatalogAction(testFarmerId, catalogData);

            console.log(`   Success: ${result.success}`);

            if (result.success) {
                console.log(`   Catalog ID: ${result.catalogId}`);
                testCatalogId = result.catalogId!;

                expect(result.catalogId).toBeDefined();
            }

            expect(result.success).toBe(true);
        });

        it('should reject save without farmer ID', async () => {
            const result = await saveCatalogAction('', { descriptor: { name: 'Test' } } as any);

            expect(result.success).toBe(false);
        });
    });

    describe('6. broadcastCatalogAction()', () => {

        it('should broadcast catalog and receive bid', async () => {
            console.log('\n📡 Testing catalog broadcast');

            if (!testCatalogId) {
                console.log('   Skipping - no test catalog');
                return;
            }

            const result = await broadcastCatalogAction(testCatalogId);

            console.log(`   Success: ${result.success}`);

            if (result.success && result.bid) {
                console.log(`   Buyer: ${result.bid.buyerName}`);
                console.log(`   Bid: ₹${result.bid.bidAmount}`);

                expect(result.bid.buyerName).toBeDefined();
                expect(result.bid.bidAmount).toBeGreaterThan(0);
            }

            expect(result.success).toBe(true);
        }, TEST_TIMEOUT);

        it('should reject broadcast without catalog ID', async () => {
            const result = await broadcastCatalogAction('');

            expect(result.success).toBe(false);
        });
    });

    describe('7. getNetworkLogsAction()', () => {

        it('should fetch network logs', async () => {
            console.log('\n📋 Testing network log retrieval');

            const result = await getNetworkLogsAction('ALL', 1, 10);

            console.log(`   Success: ${result.success}`);

            if (result.success) {
                console.log(`   Total logs: ${result.totalCount}`);
                console.log(`   Page logs: ${result.logs?.length}`);

                if (result.logs && result.logs.length > 0) {
                    console.log(`   Latest: ${result.logs[0].type}`);
                }
            }

            expect(result.success).toBe(true);
        });

        it('should filter logs by type', async () => {
            const incomingResult = await getNetworkLogsAction('INCOMING_BID', 1, 5);
            const outgoingResult = await getNetworkLogsAction('OUTGOING_CATALOG', 1, 5);

            expect(incomingResult.success).toBe(true);
            expect(outgoingResult.success).toBe(true);

            console.log(`   Incoming bids: ${incomingResult.totalCount}`);
            console.log(`   Outgoing catalogs: ${outgoingResult.totalCount}`);
        });
    });

    describe('8. getSupportedLanguagesAction()', () => {

        it('should return all supported languages', async () => {
            console.log('\n🌐 Testing language list');

            const languages = await getSupportedLanguagesAction();

            console.log(`   Supported languages: ${languages.length}`);

            expect(languages).toBeDefined();
            expect(languages.length).toBeGreaterThanOrEqual(12);

            languages.forEach(lang => {
                expect(lang.code).toBeDefined();
                expect(lang.nativeName).toBeDefined();
                expect(lang.englishName).toBeDefined();
            });
        });
    });

    describe('9. End-to-End Flow', () => {

        it('should complete full voice-to-broadcast flow', async () => {
            console.log('\n🔄 Testing complete end-to-end flow');

            // Step 1: Start conversation
            console.log('   Step 1: Starting conversation');
            const startResult = await startConversationAction('en');
            expect(startResult.success).toBe(true);

            // Step 2: Process voice
            console.log('   Step 2: Processing voice input');
            const { initConversation, getLanguageByCode } = await import('@/lib/voice-conversation-agent');
            let state = initConversation(getLanguageByCode('en')!);

            const voiceResult = await processVoiceAction(
                state,
                'I have 75 kg of fresh onions, grade A, from Nasik, 38 rupees per kg'
            );
            expect(voiceResult.success).toBe(true);

            // Step 3: Get live prices
            console.log('   Step 3: Fetching live prices');
            const priceResult = await getLivePricesAction('onion');
            expect(priceResult.success).toBe(true);
            console.log(`      Market price: ₹${priceResult.priceSuggestion?.pricePerKg.average}/kg`);

            // Step 4: Translate to Beckn
            console.log('   Step 4: Translating to Beckn JSON');
            const translateResult = await translateVoiceAction(
                'I have 75 kg of fresh onions, grade A, from Nasik, 38 rupees per kg'
            );
            expect(translateResult.success).toBe(true);

            // Step 5: Save catalog
            console.log('   Step 5: Saving catalog');
            if (translateResult.catalog) {
                const saveResult = await saveCatalogAction(testFarmerId, translateResult.catalog);
                expect(saveResult.success).toBe(true);

                if (saveResult.catalogId) {
                    // Step 6: Broadcast
                    console.log('   Step 6: Broadcasting to network');
                    const broadcastResult = await broadcastCatalogAction(saveResult.catalogId);
                    expect(broadcastResult.success).toBe(true);

                    if (broadcastResult.bid) {
                        console.log(`      Received bid: ₹${broadcastResult.bid.bidAmount} from ${broadcastResult.bid.buyerName}`);
                    }

                    // Cleanup
                    await prisma.catalog.delete({ where: { id: saveResult.catalogId } });
                }
            }

            console.log('   ✅ End-to-end flow completed successfully');
        }, TEST_TIMEOUT * 3);
    });
});
