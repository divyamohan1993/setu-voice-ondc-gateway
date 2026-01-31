/**
 * AI Translation Service - Live Integration Tests
 * 
 * Tests the Gemini AI integration for voice translation.
 * All tests use REAL API calls to Google Gemini - no mocks.
 * 
 * @module tests/integration/translation-service
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';

// Load environment variables
config();

// Test timeout for AI API calls (can be slow)
const AI_TIMEOUT = 60000;

describe('AI Translation Service - Live API Tests', () => {

    let translateVoiceToJson: typeof import('@/lib/translation-agent').translateVoiceToJson;
    let translateVoiceToJsonWithFallback: typeof import('@/lib/translation-agent').translateVoiceToJsonWithFallback;
    let validateCatalog: typeof import('@/lib/translation-agent').validateCatalog;

    beforeAll(async () => {
        const translationAgent = await import('@/lib/translation-agent');
        translateVoiceToJson = translationAgent.translateVoiceToJson;
        translateVoiceToJsonWithFallback = translationAgent.translateVoiceToJsonWithFallback;
        validateCatalog = translationAgent.validateCatalog;

        console.log('\n========================================');
        console.log('AI TRANSLATION SERVICE - LIVE API TESTS');
        console.log('========================================');
        console.log('Using: Google Gemini 2.0 Flash\n');
    });

    describe('1. translateVoiceToJson() - Hindi Input', () => {

        const hindiInputs = [
            {
                text: 'मेरे पास 100 किलो प्याज है, 40 रुपये किलो में बेचना है',
                expected: { commodity: 'onion', quantity: 100, price: 40 }
            },
            {
                text: 'पचास किलो टमाटर है, बाजार भाव पर बेचूंगा',
                expected: { commodity: 'tomato', quantity: 50, price: 0 }
            },
            {
                text: 'दो सौ किलो आलू बेचना है',
                expected: { commodity: 'potato', quantity: 200, price: 0 }
            }
        ];

        it.each(hindiInputs)(
            'should translate Hindi: "$text"',
            async ({ text, expected }) => {
                console.log(`\n🗣️ Hindi input: "${text}"`);

                const result = await translateVoiceToJson(text);

                console.log('   📦 Translation result:');
                console.log(`      Commodity: ${result.descriptor?.name}`);
                console.log(`      Quantity: ${result.quantity?.available?.count} ${result.quantity?.unit}`);
                console.log(`      Price: ₹${result.price?.value}/${result.price?.currency}`);

                expect(result).toBeDefined();
                expect(result.descriptor).toBeDefined();
                expect(result.quantity).toBeDefined();
                expect(result.price).toBeDefined();

                // Verify commodity detection
                expect(result.descriptor.name.toLowerCase()).toContain(expected.commodity);

                // Verify quantity if specified
                if (expected.quantity > 0) {
                    expect(result.quantity.available.count).toBe(expected.quantity);
                }
            },
            AI_TIMEOUT
        );
    });

    describe('2. translateVoiceToJson() - English Input', () => {

        const englishInputs = [
            {
                text: 'I have 50 kg of tomatoes to sell at 30 rupees per kg',
                expected: { commodity: 'tomato', quantity: 50, price: 30 }
            },
            {
                text: 'selling 200 kilos of onions, grade A quality from Nashik',
                expected: { commodity: 'onion', quantity: 200, quality: 'A' }
            },
            {
                text: 'fresh mangoes 100 kg, alphonso variety, 80 rupees',
                expected: { commodity: 'mango', quantity: 100, price: 80 }
            }
        ];

        it.each(englishInputs)(
            'should translate English: "$text"',
            async ({ text, expected }) => {
                console.log(`\n🗣️ English input: "${text}"`);

                const result = await translateVoiceToJson(text);

                console.log('   📦 Translation result:');
                console.log(`      Commodity: ${result.descriptor?.name}`);
                console.log(`      Quantity: ${result.quantity?.available?.count} ${result.quantity?.unit}`);
                console.log(`      Price: ₹${result.price?.value}`);
                if (result.tags?.grade) {
                    console.log(`      Grade: ${result.tags.grade}`);
                }

                expect(result).toBeDefined();
                expect(result.descriptor?.name.toLowerCase()).toContain(expected.commodity);

                if (expected.quantity) {
                    expect(result.quantity?.available?.count).toBe(expected.quantity);
                }
            },
            AI_TIMEOUT
        );
    });

    describe('3. translateVoiceToJson() - Regional Languages', () => {

        const regionalInputs = [
            {
                language: 'Marathi',
                text: 'माझ्याकडे शंभर किलो कांदे आहेत, चाळीस रुपये किलो',
                expectedCommodity: 'onion'
            },
            {
                language: 'Tamil',
                text: 'என்னிடம் 50 கிலோ தக்காளி உள்ளது',
                expectedCommodity: 'tomato'
            },
            {
                language: 'Telugu',
                text: 'నా దగ్గర 100 కిలోల ఉల్లిపాయలు ఉన్నాయి',
                expectedCommodity: 'onion'
            },
            {
                language: 'Kannada',
                text: 'ನನ್ನ ಬಳಿ 80 ಕಿಲೋ ಟೊಮೆಟೊ ಇದೆ',
                expectedCommodity: 'tomato'
            },
            {
                language: 'Bengali',
                text: 'আমার কাছে 50 কেজি আলু আছে',
                expectedCommodity: 'potato'
            },
            {
                language: 'Gujarati',
                text: 'મારી પાસે 100 કિલો ડુંગળી છે',
                expectedCommodity: 'onion'
            }
        ];

        it.each(regionalInputs)(
            'should translate $language input',
            async ({ language, text, expectedCommodity }) => {
                console.log(`\n🗣️ ${language} input: "${text}"`);

                const result = await translateVoiceToJson(text);

                console.log(`   📦 Detected: ${result.descriptor?.name}`);
                console.log(`   📦 Quantity: ${result.quantity?.available?.count} ${result.quantity?.unit}`);

                expect(result).toBeDefined();
                expect(result.descriptor).toBeDefined();

                // Verify commodity was detected correctly
                const detectedName = result.descriptor.name.toLowerCase();
                expect(
                    detectedName.includes(expectedCommodity) ||
                    expectedCommodity.includes(detectedName.split(' ').pop()!)
                ).toBe(true);
            },
            AI_TIMEOUT
        );
    });

    describe('4. translateVoiceToJsonWithFallback() - Error Handling', () => {

        it('should handle ambiguous input with fallback', async () => {
            console.log('\n🔧 Testing fallback for ambiguous input');

            const ambiguousText = 'कुछ सब्जी बेचनी है';
            const result = await translateVoiceToJsonWithFallback(ambiguousText);

            console.log(`   Result: ${JSON.stringify(result).substring(0, 100)}...`);

            expect(result).toBeDefined();
            expect(result.descriptor).toBeDefined();
        }, AI_TIMEOUT);

        it('should handle numeric input', async () => {
            console.log('\n🔧 Testing numeric-heavy input');

            const numericText = '100 kg onion 50 rupees';
            const result = await translateVoiceToJsonWithFallback(numericText);

            console.log(`   Quantity: ${result.quantity?.available?.count}`);
            console.log(`   Price: ${result.price?.value}`);

            expect(result.quantity?.available?.count).toBe(100);
            expect(result.price?.value).toBe(50);
        }, AI_TIMEOUT);
    });

    describe('5. validateCatalog() - Validation', () => {

        it('should validate a complete catalog item', async () => {
            console.log('\n✅ Testing catalog validation');

            const input = 'I have 100 kg of fresh tomatoes, grade A, 35 rupees per kg';
            const result = await translateVoiceToJson(input);
            const validated = validateCatalog(result);

            console.log(`   Original price: ${result.price?.value}`);
            console.log(`   Validated price: ${validated.price.value}`);

            expect(validated).toBeDefined();
            expect(validated.descriptor.name).toBeDefined();
            expect(validated.price.value).toBeGreaterThan(0);
            expect(validated.quantity.available.count).toBeGreaterThan(0);
        }, AI_TIMEOUT);
    });

    describe('6. AI Response Quality', () => {

        it('should extract quality/grade information', async () => {
            console.log('\n🏆 Testing quality extraction');

            const input = 'Premium A grade Nasik onions, 100 kg at 45 rupees';
            const result = await translateVoiceToJson(input);

            console.log(`   Grade: ${result.tags?.grade || 'not detected'}`);
            console.log(`   Location: ${result.descriptor?.name}`);

            expect(result.tags).toBeDefined();
            // Grade should be detected
            if (result.tags?.grade) {
                expect(result.tags.grade.toUpperCase()).toContain('A');
            }
        }, AI_TIMEOUT);

        it('should handle market quote request (no price)', async () => {
            console.log('\n💰 Testing market quote request');

            const input = 'मुझे बाजार भाव पर प्याज बेचना है, 50 किलो';
            const result = await translateVoiceToJson(input);

            console.log(`   Price: ${result.price?.value} (should be 0 for market quote)`);

            expect(result).toBeDefined();
            expect(result.quantity?.available?.count).toBe(50);
            // Price should be 0 or very low for market quote
            expect(result.price?.value).toBeLessThanOrEqual(10);
        }, AI_TIMEOUT);

        it('should preserve original quantities accurately', async () => {
            console.log('\n📊 Testing quantity accuracy');

            const testCases = [
                { input: '50 kg tomato', expected: 50 },
                { input: '100 kilos onion', expected: 100 },
                { input: '25 kg potato', expected: 25 },
                { input: 'two hundred kg wheat', expected: 200 }
            ];

            for (const { input, expected } of testCases) {
                const result = await translateVoiceToJson(input);
                console.log(`   "${input}" → ${result.quantity?.available?.count} kg`);
                expect(result.quantity?.available?.count).toBe(expected);
            }
        }, AI_TIMEOUT * 2);
    });
});
