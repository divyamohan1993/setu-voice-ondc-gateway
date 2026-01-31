/**
 * Voice Conversation Agent - Live Integration Tests
 * 
 * Tests the end-to-end voice conversation flow with real AI.
 * All tests use REAL API calls - no mocks.
 * 
 * @module tests/integration/voice-conversation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { config } from 'dotenv';
import type { ConversationState, VoiceResponse } from '@/lib/voice-conversation-agent';

// Load environment variables
config();

// Test timeout for AI API calls
const AI_TIMEOUT = 60000;

describe('Voice Conversation Agent - Live API Tests', () => {

    let processVoiceInput: typeof import('@/lib/voice-conversation-agent').processVoiceInput;
    let initConversation: typeof import('@/lib/voice-conversation-agent').initConversation;
    let getLanguageByCode: typeof import('@/lib/voice-conversation-agent').getLanguageByCode;
    let SUPPORTED_LANGUAGES: typeof import('@/lib/voice-conversation-agent').SUPPORTED_LANGUAGES;

    beforeAll(async () => {
        const voiceAgent = await import('@/lib/voice-conversation-agent');
        processVoiceInput = voiceAgent.processVoiceInput;
        initConversation = voiceAgent.initConversation;
        getLanguageByCode = voiceAgent.getLanguageByCode;
        SUPPORTED_LANGUAGES = voiceAgent.SUPPORTED_LANGUAGES;

        console.log('\n========================================');
        console.log('VOICE CONVERSATION - LIVE API TESTS');
        console.log('========================================\n');
    });

    describe('1. Language Support', () => {

        it('should support all 12 Indian languages', () => {
            console.log('\n🌐 Testing language support');

            const expectedLanguages = [
                'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu', 'pa', 'or', 'as', 'ml', 'en'
            ];

            expectedLanguages.forEach(code => {
                const lang = getLanguageByCode(code);
                expect(lang).toBeDefined();
                console.log(`   ✅ ${lang!.englishName} (${code})`);
            });

            expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(12);
        });

        it('should have proper greeting in each language', () => {
            console.log('\n👋 Testing greetings in all languages');

            SUPPORTED_LANGUAGES.forEach(lang => {
                expect(lang.greeting).toBeDefined();
                expect(lang.greeting.length).toBeGreaterThan(0);
                console.log(`   ${lang.englishName}: "${lang.greeting.substring(0, 50)}..."`);
            });
        });
    });

    describe('2. Conversation Flow - Hindi', () => {

        it('should complete full conversation in Hindi', async () => {
            console.log('\n🗣️ Testing complete Hindi conversation flow');

            // Initialize conversation
            const language = getLanguageByCode('hi')!;
            let state = initConversation(language);

            console.log('   Stage 1: Greeting');
            expect(state.stage).toBe('greeting');

            // Step 1: User provides commodity
            console.log('   Stage 2: Commodity input');
            let result = await processVoiceInput(state, 'मेरे पास 100 किलो प्याज है');
            state = result.newState;

            console.log(`      Response stage: ${result.response.stage}`);
            console.log(`      Commodity detected: ${state.collectedData.commodity}`);
            console.log(`      Quantity: ${state.collectedData.quantityKg}`);

            expect(state.collectedData.commodity).toBeDefined();

            // Step 2: User provides price (if needed)
            if (result.response.stage === 'asking_price_preference') {
                console.log('   Stage 3: Price input');
                result = await processVoiceInput(state, '40 रुपये किलो');
                state = result.newState;

                console.log(`      Price: ${state.collectedData.preferredPrice}`);
            }

            // Final stage should be confirmation or success
            console.log(`   Final stage: ${result.response.stage}`);
            expect(['confirming_listing', 'broadcasting', 'success', 'showing_market_prices', 'asking_price_preference']).toContain(result.response.stage);
        }, AI_TIMEOUT * 2);
    });

    describe('3. Conversation Flow - English', () => {

        it('should handle English conversation flow', async () => {
            console.log('\n🗣️ Testing English conversation flow');

            const language = getLanguageByCode('en')!;
            let state = initConversation(language);

            // Full input with all details
            const result = await processVoiceInput(
                state,
                'I have 50 kg of fresh tomatoes, grade A quality, selling at 35 rupees per kg'
            );

            console.log(`   Commodity: ${result.newState.collectedData.commodity}`);
            console.log(`   Quantity: ${result.newState.collectedData.quantityKg}`);
            console.log(`   Stage: ${result.response.stage}`);

            expect(result.newState.collectedData.commodity).toBeDefined();
        }, AI_TIMEOUT);
    });

    describe('4. Conversation Flow - Regional Languages', () => {

        const regionalTests = [
            { code: 'mr', text: 'माझ्याकडे 80 किलो टोमॅटो आहे, 30 रुपये किलो' },
            { code: 'ta', text: 'என்னிடம் 50 கிலோ தக்காளி உள்ளது' },
            { code: 'te', text: 'నా వద్ద 100 కిలోల ఉల్లిపాయలు ఉన్నాయి' },
            { code: 'kn', text: 'ನನ್ನ ಬಳಿ 60 ಕಿಲೋ ಈರುಳ್ಳಿ ಇದೆ' },
            { code: 'bn', text: 'আমার কাছে 50 কেজি পেঁয়াজ আছে' }
        ];

        it.each(regionalTests)(
            'should process $code language input',
            async ({ code, text }) => {
                const language = getLanguageByCode(code)!;
                console.log(`\n🗣️ Testing ${language.englishName}`);
                console.log(`   Input: "${text}"`);

                const state = initConversation(language);
                const result = await processVoiceInput(state, text);

                console.log(`   Commodity: ${result.newState.collectedData.commodity || 'pending'}`);
                console.log(`   Quantity: ${result.newState.collectedData.quantityKg || 'pending'}`);
                console.log(`   Stage: ${result.response.stage}`);

                expect(result.response).toBeDefined();
                expect(result.response.text).toBeDefined();
                expect(result.response.text.length).toBeGreaterThan(0);
            },
            AI_TIMEOUT
        );
    });

    describe('5. Error Handling', () => {

        it('should handle incomplete input gracefully', async () => {
            console.log('\n🔧 Testing incomplete input handling');

            const language = getLanguageByCode('hi')!;
            const state = initConversation(language);

            // Very short/incomplete input
            const result = await processVoiceInput(state, 'हाँ');

            console.log(`   Response: "${result.response.text.substring(0, 50)}..."`);
            console.log(`   Stage: ${result.response.stage}`);

            expect(result.response).toBeDefined();
            // Should ask for more information
            expect(result.response.stage).not.toBe('success');
        }, AI_TIMEOUT);

        it('should handle unrecognized commodity', async () => {
            console.log('\n🔧 Testing unrecognized commodity');

            const language = getLanguageByCode('en')!;
            const state = initConversation(language);

            const result = await processVoiceInput(state, 'I have 50 kg of unknownthing123');

            console.log(`   Detected: ${result.newState.collectedData.commodity || 'nothing'}`);
            console.log(`   Stage: ${result.response.stage}`);

            expect(result.response).toBeDefined();
        }, AI_TIMEOUT);
    });

    describe('6. Response Localization', () => {

        it('should respond in the same language as input', async () => {
            console.log('\n🌐 Testing response localization');

            // Hindi input should get Hindi response
            const hindiLang = getLanguageByCode('hi')!;
            const hindiState = initConversation(hindiLang);
            const hindiResult = await processVoiceInput(hindiState, 'मेरे पास प्याज है');

            console.log(`   Hindi response: "${hindiResult.response.text.substring(0, 50)}..."`);

            // Check if response contains Hindi characters (Devanagari)
            const hasHindiChars = /[\u0900-\u097F]/.test(hindiResult.response.text);
            expect(hasHindiChars).toBe(true);

            // Tamil input should get Tamil response
            const tamilLang = getLanguageByCode('ta')!;
            const tamilState = initConversation(tamilLang);
            const tamilResult = await processVoiceInput(tamilState, 'என்னிடம் தக்காளி உள்ளது');

            console.log(`   Tamil response: "${tamilResult.response.text.substring(0, 50)}..."`);

            // Check if response contains Tamil characters
            const hasTamilChars = /[\u0B80-\u0BFF]/.test(tamilResult.response.text);
            expect(hasTamilChars).toBe(true);
        }, AI_TIMEOUT * 2);
    });

    describe('7. State Management', () => {

        it('should maintain conversation state across turns', async () => {
            console.log('\n📊 Testing state management across turns');

            const language = getLanguageByCode('en')!;
            let state = initConversation(language);

            // Turn 1: Commodity
            console.log('   Turn 1: Providing commodity');
            let result = await processVoiceInput(state, 'I have onions');
            state = result.newState;
            console.log(`      Commodity saved: ${state.collectedData.commodity}`);

            // Turn 2: Quantity
            console.log('   Turn 2: Providing quantity');
            result = await processVoiceInput(state, '100 kg');
            state = result.newState;
            console.log(`      Quantity saved: ${state.collectedData.quantityKg}`);

            // Verify state is maintained
            expect(state.collectedData.commodity).toBeDefined();

            console.log(`   Final state: commodity=${state.collectedData.commodity}, quantity=${state.collectedData.quantityKg}`);
        }, AI_TIMEOUT * 2);
    });

    describe('8. VoiceResponse Structure', () => {

        it('should return properly structured VoiceResponse', async () => {
            console.log('\n📦 Testing VoiceResponse structure');

            const language = getLanguageByCode('en')!;
            const state = initConversation(language);

            const result = await processVoiceInput(state, 'I have 100 kg of onions');
            const response = result.response;

            console.log(`   text: ${typeof response.text}`);
            console.log(`   stage: ${response.stage}`);
            console.log(`   expectsResponse: ${response.expectsResponse}`);

            expect(response.text).toBeDefined();
            expect(typeof response.text).toBe('string');
            expect(response.stage).toBeDefined();
            expect(typeof response.expectsResponse).toBe('boolean');
        }, AI_TIMEOUT);
    });
});
