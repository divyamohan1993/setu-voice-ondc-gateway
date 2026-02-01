"use server";

/**
 * Voice Conversation Server Actions
 * 
 * Server-side actions for the voice-first conversational UI.
 * Handles speech processing, conversation state, and broadcasting.
 */

import {
    processVoiceInput,
    getSuccessMessage,
    initConversation,
    getLanguageByCode,
    type ConversationState,
    type VoiceResponse,
    type LanguageConfig,
    SUPPORTED_LANGUAGES
} from "@/lib/voice-conversation-agent";
import { getPriceSuggestion, type PriceSuggestion } from "@/lib/mandi-price-service";
import { translateVoiceToJsonWithFallback, validateCatalog } from "@/lib/translation-agent";
import { prisma, handleDatabaseError } from "@/lib/db";
import { simulateBroadcast, type BuyerBid } from "@/lib/network-simulator";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import type { Prisma } from "@/lib/generated-client/client";

/**
 * Start a new conversation session
 */
export interface StartConversationResult {
    success: boolean;
    sessionId: string;
    greeting: string;
    language: LanguageConfig;
    error?: string;
}

export async function startConversationAction(
    languageCode: string
): Promise<StartConversationResult> {
    try {
        const language = getLanguageByCode(languageCode);

        if (!language) {
            return {
                success: false,
                sessionId: "",
                greeting: "",
                language: SUPPORTED_LANGUAGES[0],
                error: "Unsupported language"
            };
        }

        // Generate unique session ID
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        console.log(` Starting conversation in ${language.englishName}`);

        return {
            success: true,
            sessionId,
            greeting: language.greeting,
            language
        };

    } catch (error) {
        console.error("[X] Start conversation failed:", error);
        return {
            success: false,
            sessionId: "",
            greeting: "",
            language: SUPPORTED_LANGUAGES[0],
            error: error instanceof Error ? error.message : "Failed to start conversation"
        };
    }
}

/**
 * Process voice input in a conversation
 */
export interface ProcessVoiceResult {
    success: boolean;
    response?: VoiceResponse;
    newState?: ConversationState;
    error?: string;
}

export async function processVoiceAction(
    state: ConversationState,
    voiceText: string
): Promise<ProcessVoiceResult> {
    try {
        console.log(` Processing voice: "${voiceText.substring(0, 50)}..."`);

        const result = await processVoiceInput(state, voiceText);

        console.log(`[OK] Response stage: ${result.response.stage}`);

        return {
            success: true,
            response: result.response,
            newState: result.newState
        };

    } catch (error) {
        console.error("[X] Voice processing failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Voice processing failed"
        };
    }
}

/**
 * Get market prices for a commodity
 */
export interface GetLivePricesResult {
    success: boolean;
    priceSuggestion?: PriceSuggestion;
    error?: string;
}

export async function getLivePricesAction(
    commodity: string,
    location?: string
): Promise<GetLivePricesResult> {
    try {
        console.log(` Fetching prices for: ${commodity}`);

        const priceSuggestion = await getPriceSuggestion(commodity, location);

        return {
            success: true,
            priceSuggestion
        };

    } catch (error) {
        console.error("[X] Price fetch failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch prices"
        };
    }
}

/**
 * Broadcast catalog from voice conversation
 * 
 * PRODUCTION-GRADE IMPLEMENTATION:
 * - Validates catalog against Beckn Protocol schema
 * - Saves to database with proper status tracking
 * - Broadcasts to ONDC network (simulated with production characteristics)
 * - Handles network failures, timeouts, and denials gracefully
 * - Returns detailed transaction information
 */
export interface VoiceBroadcastResult {
    success: boolean;
    catalogId?: string;
    bid?: BuyerBid;
    successMessage?: string;
    error?: string;
    /** ONDC Transaction ID for tracking */
    transactionId?: string;
    /** Processing time in milliseconds */
    processingTimeMs?: number;
    /** Error type for UI handling */
    errorType?: 'TIMEOUT' | 'DENIED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMITED';
}

export async function broadcastFromVoiceAction(
    catalogItem: BecknCatalogItem,
    language: LanguageConfig
): Promise<VoiceBroadcastResult> {
    try {
        console.log(` Broadcasting catalog from voice conversation`);
        console.log(` [ONDC] Initiating production-grade broadcast...`);

        // Validate catalog
        const validatedCatalog = validateCatalog(catalogItem);

        // Save to database with default farmer
        const FARMER_ID = "farmer-1";

        // Verify farmer exists
        const farmer = await prisma.farmer.findUnique({
            where: { id: FARMER_ID }
        });

        if (!farmer) {
            return {
                success: false,
                error: "Farmer not found",
                errorType: 'VALIDATION_ERROR'
            };
        }

        // Create catalog
        const savedCatalog = await prisma.catalog.create({
            data: {
                farmerId: FARMER_ID,
                becknJson: validatedCatalog as Prisma.InputJsonValue,
                status: "DRAFT"
            }
        });

        console.log(`[OK] Catalog saved: ${savedCatalog.id}`);

        // Update to BROADCASTED
        await prisma.catalog.update({
            where: { id: savedCatalog.id },
            data: { status: "BROADCASTED" }
        });

        // Log outgoing catalog
        await prisma.networkLog.create({
            data: {
                type: "OUTGOING_CATALOG",
                payload: {
                    catalogId: savedCatalog.id,
                    farmerId: FARMER_ID,
                    becknJson: validatedCatalog,
                    timestamp: new Date().toISOString(),
                    source: "voice_conversation",
                    protocolVersion: "1.2.0",
                    domain: "ONDC:AGR10"
                },
                timestamp: new Date()
            }
        });

        // Simulate broadcast with production-grade ONDC network behavior
        // This may throw an error if network simulation encounters failure scenarios
        try {
            const bid = await simulateBroadcast(savedCatalog.id);

            // Generate success message in user's language
            const successMessage = getSuccessMessage(language, bid.buyerName, bid.bidAmount);

            console.log(`[OK] Broadcast successful: ${bid.buyerName} bid Rs ${bid.bidAmount}`);
            console.log(`[OK] Transaction ID: ${bid.transactionId || 'N/A'}`);
            console.log(`[OK] Processing Time: ${bid.processingTimeMs || 0}ms`);

            return {
                success: true,
                catalogId: savedCatalog.id,
                bid,
                successMessage,
                transactionId: bid.transactionId,
                processingTimeMs: bid.processingTimeMs
            };

        } catch (networkError) {
            // Handle ONDC network errors (timeouts, denials, etc.)
            const errorMessage = networkError instanceof Error ? networkError.message : "Network broadcast failed";
            console.warn(`[!] ONDC Network Event: ${errorMessage}`);

            // Parse error type from message
            let errorType: VoiceBroadcastResult['errorType'] = 'NETWORK_ERROR';
            if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
                errorType = 'TIMEOUT';
            } else if (errorMessage.includes('denied') || errorMessage.includes('No buyers')) {
                errorType = 'DENIED';
            } else if (errorMessage.includes('rate') || errorMessage.includes('Rate')) {
                errorType = 'RATE_LIMITED';
            }

            // Update catalog status to reflect the failed broadcast
            await prisma.catalog.update({
                where: { id: savedCatalog.id },
                data: { status: "DRAFT" } // Revert to draft so user can retry
            });

            return {
                success: false,
                catalogId: savedCatalog.id,
                error: errorMessage,
                errorType
            };
        }

    } catch (error) {
        console.error("[X] Voice broadcast failed:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Broadcast failed",
            errorType: 'VALIDATION_ERROR'
        };
    }
}

/**
 * Get all supported languages
 */
export async function getSupportedLanguagesAction() {
    return SUPPORTED_LANGUAGES;
}

/**
 * Translate text for TTS
 * Uses AI to ensure natural speech in target language
 */
export interface TranslateForSpeechResult {
    success: boolean;
    translatedText?: string;
    error?: string;
}

export async function translateForSpeechAction(
    text: string,
    targetLanguageCode: string
): Promise<TranslateForSpeechResult> {
    try {
        const language = getLanguageByCode(targetLanguageCode);

        if (!language) {
            return { success: false, error: "Unsupported language" };
        }

        // For now, return as-is (texts are already localized)
        // In production, add AI translation for dynamic content
        return {
            success: true,
            translatedText: text
        };

    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Translation failed"
        };
    }
}
