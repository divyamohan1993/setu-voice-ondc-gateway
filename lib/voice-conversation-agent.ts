/**
 * Voice Conversation Agent
 * 
 * AI-powered conversational agent that talks with farmers in their native language.
 * Uses Gemini for conversation flow and dynamic commodity understanding.
 * 
 * @module voice-conversation-agent
 */

import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { getPriceSuggestion, formatPriceForVoice, type PriceSuggestion } from "./mandi-price-service";
import { BecknCatalogItemSchema, type BecknCatalogItem } from "./beckn-schema";
import { mapCommodityName } from "./translation-agent";

/**
 * Supported Indian languages with their configurations
 */
export interface LanguageConfig {
    code: string;        // BCP-47 language code
    name: string;        // Native name
    englishName: string; // English name
    greeting: string;    // Welcome greeting
    region: string;      // Primary region
    speechCode: string;  // Web Speech API code
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
    {
        code: "hi",
        name: "हिंदी",
        englishName: "Hindi",
        greeting: "नमस्ते! मैं आपकी फसल बेचने में मदद करूँगा।",
        region: "North India",
        speechCode: "hi-IN"
    },
    {
        code: "mr",
        name: "मराठी",
        englishName: "Marathi",
        greeting: "नमस्कार! मी तुम्हाला तुमची पिके विकण्यात मदत करेन।",
        region: "Maharashtra",
        speechCode: "mr-IN"
    },
    {
        code: "ta",
        name: "தமிழ்",
        englishName: "Tamil",
        greeting: "வணக்கம்! உங்கள் விளைபொருட்களை விற்க நான் உதவுவேன்।",
        region: "Tamil Nadu",
        speechCode: "ta-IN"
    },
    {
        code: "te",
        name: "తెలుగు",
        englishName: "Telugu",
        greeting: "నమస్కారం! మీ పంటలను అమ్మడంలో నేను సహాయం చేస్తాను।",
        region: "Andhra Pradesh / Telangana",
        speechCode: "te-IN"
    },
    {
        code: "kn",
        name: "ಕನ್ನಡ",
        englishName: "Kannada",
        greeting: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ಮಾರಾಟ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ।",
        region: "Karnataka",
        speechCode: "kn-IN"
    },
    {
        code: "bn",
        name: "বাংলা",
        englishName: "Bengali",
        greeting: "নমস্কার! আমি আপনার ফসল বিক্রি করতে সাহায্য করব।",
        region: "West Bengal",
        speechCode: "bn-IN"
    },
    {
        code: "gu",
        name: "ગુજરાતી",
        englishName: "Gujarati",
        greeting: "નમસ્તે! હું તમારા પાકને વેચવામાં મદદ કરીશ।",
        region: "Gujarat",
        speechCode: "gu-IN"
    },
    {
        code: "pa",
        name: "ਪੰਜਾਬੀ",
        englishName: "Punjabi",
        greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੀ ਫ਼ਸਲ ਵੇਚਣ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ।",
        region: "Punjab",
        speechCode: "pa-IN"
    },
    {
        code: "or",
        name: "ଓଡ଼ିଆ",
        englishName: "Odia",
        greeting: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ଫସଲ ବିକ୍ରି କରିବାରେ ସାହାଯ୍ୟ କରିବି।",
        region: "Odisha",
        speechCode: "or-IN"
    },
    {
        code: "as",
        name: "অসমীয়া",
        englishName: "Assamese",
        greeting: "নমস্কাৰ! মই আপোনাৰ শস্য বিক্ৰী কৰাত সহায় কৰিম।",
        region: "Assam",
        speechCode: "as-IN"
    },
    {
        code: "ml",
        name: "മലയാളം",
        englishName: "Malayalam",
        greeting: "നമസ്കാരം! നിങ്ങളുടെ വിളകള്‍ വില്‍ക്കാന്‍ ഞാന്‍ സഹായിക്കും।",
        region: "Kerala",
        speechCode: "ml-IN"
    },
    {
        code: "en",
        name: "English",
        englishName: "English",
        greeting: "Hello! I will help you sell your crops.",
        region: "All India",
        speechCode: "en-IN"
    }
];

/**
 * Conversation state
 */
export type ConversationStage =
    | "language_selection"
    | "greeting"
    | "asking_commodity"
    | "asking_quantity"
    | "asking_quality"
    | "asking_price_preference"
    | "showing_market_prices"
    | "confirming_listing"
    | "broadcasting"
    | "success"
    | "error";

export interface ConversationState {
    stage: ConversationStage;
    language: LanguageConfig;
    collectedData: {
        commodity?: string;
        quantityKg?: number;
        quality?: string;
        location?: string;
        preferredPrice?: number;
        useMarketPrice?: boolean;
        // Custom location override - user can specify a different mandi/city/state
        customState?: string;
        customCity?: string;
        customMandi?: string;
        useCustomLocation?: boolean;
    };
    priceSuggestion?: PriceSuggestion;
    catalogItem?: BecknCatalogItem;
    error?: string;
}

/**
 * Voice response from the agent
 */
export interface VoiceResponse {
    text: string;           // Text to speak
    stage: ConversationStage;
    expectsResponse: boolean;
    options?: string[];     // Quick options if any
    catalogItem?: BecknCatalogItem;
    priceSuggestion?: PriceSuggestion;
}

/**
 * Initialize a new conversation
 */
export function initConversation(language: LanguageConfig): ConversationState {
    return {
        stage: "greeting",
        language,
        collectedData: {}
    };
}

/**
 * Get language by code
 */
export function getLanguageByCode(code: string): LanguageConfig | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code || l.speechCode === code);
}

/**
 * Process user's voice input and generate response
 */
export async function processVoiceInput(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        switch (state.stage) {
            case "greeting":
                return handleGreeting(state, userInput);

            case "asking_commodity":
                return await handleCommodity(state, userInput);

            case "asking_quantity":
                return await handleQuantity(state, userInput);

            case "asking_quality":
                return await handleQuality(state, userInput);

            case "asking_price_preference":
                return await handlePricePreference(state, userInput);

            case "showing_market_prices":
                return await handleMarketPriceConfirmation(state, userInput);

            case "confirming_listing":
                return await handleListingConfirmation(state, userInput);

            default:
                return {
                    response: {
                        text: getLocalizedText("error_general", lang.code),
                        stage: "error",
                        expectsResponse: false
                    },
                    newState: { ...state, stage: "error" }
                };
        }
    } catch (error) {
        console.error("[X] Voice processing error:", error);
        return {
            response: {
                text: getLocalizedText("error_general", lang.code),
                stage: "error",
                expectsResponse: false
            },
            newState: { ...state, stage: "error", error: String(error) }
        };
    }
}

/**
 * Handle greeting stage
 */
function handleGreeting(
    state: ConversationState,
    userInput: string
): { response: VoiceResponse; newState: ConversationState } {
    const lang = state.language;

    return {
        response: {
            text: getLocalizedText("ask_commodity", lang.code),
            stage: "asking_commodity",
            expectsResponse: true
        },
        newState: { ...state, stage: "asking_commodity" }
    };
}

/**
 * Dynamic extraction schema for parsing all info from a single user sentence
 * This enables users to speak naturally: "I want to sell wheat at 50 rs per quintal and I have 400 quintals from Punjab"
 */
const DynamicExtractionSchema = z.object({
    // Commodity info
    commodity: z.string().optional().describe("The agricultural commodity mentioned (in original language)"),
    commodityEnglish: z.string().optional().describe("English name of the commodity"),

    // Quantity info
    quantity: z.number().optional().describe("Numerical quantity mentioned"),
    quantityUnit: z.enum(["kg", "quintal", "ton", "kilogram", "quintals", "tons", "unknown"]).optional()
        .describe("Unit of the quantity: kg, quintal (100kg), or ton (1000kg)"),
    quantityKg: z.number().optional().describe("Quantity converted to kilograms"),

    // Price info
    price: z.number().optional().describe("Price mentioned by user"),
    priceUnit: z.enum(["per_kg", "per_quintal", "per_ton", "total", "unknown"]).optional()
        .describe("Unit of the price: per kg, per quintal, per ton, or total"),
    pricePerKg: z.number().optional().describe("Price converted to per kg"),

    // Quality info
    quality: z.enum(["Premium", "A", "B", "Standard", "Mixed", "unknown"]).optional()
        .describe("Quality grade if mentioned"),

    // Custom location - user can specify a different mandi instead of GPS location
    customState: z.string().optional().describe("Indian state if user specified (e.g., Punjab, Maharashtra, Karnataka)"),
    customCity: z.string().optional().describe("City name if user specified"),
    customMandi: z.string().optional().describe("Specific mandi name if user specified"),
    wantsCustomLocation: z.boolean().optional()
        .describe("True if user wants prices from a specific location instead of their GPS location"),

    // Parsing confidence
    understood: z.boolean().describe("Whether we could understand the input"),
    hasAllInfo: z.boolean().describe("True if user provided commodity, quantity AND price in one sentence")
});

type DynamicExtraction = z.infer<typeof DynamicExtractionSchema>;

/**
 * Intelligently extract all available information from user's free-form speech.
 * Allows users to say everything in one sentence instead of answering one question at a time.
 * 
 * Examples that work:
 * - "I want to sell wheat at 50 rs per quintal and I have 400 quintals"
 * - "मुझे 200 किलो प्याज़ 25 रुपये किलो में बेचना है"
 * - "Give me Punjab mandi price for wheat"
 * - "मुझे लसुन का भाव देखना है नासिक मंडी का"
 */
async function extractDynamicInfo(
    userInput: string,
    language: LanguageConfig
): Promise<DynamicExtraction | null> {
    try {
        // Check if API key exists
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.warn("[!] No API key for dynamic extraction");
            return null;
        }

        console.log(`[AI] Extracting all info from: "${userInput}"`);

        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: DynamicExtractionSchema,
            prompt: `You are helping a farmer sell their produce. Extract ALL available information from their speech.
The user is speaking in ${language.englishName}. Be flexible and understanding.

User said: "${userInput}"

Extract as much as possible:

1. COMMODITY: What crop/produce they want to sell (onion, wheat, tomato, etc.)
   - Extract in original language as 'commodity'
   - Also provide English name as 'commodityEnglish'

2. QUANTITY: How much they want to sell
   - Extract the number as 'quantity'
   - Identify unit as 'quantityUnit': "kg", "quintal" (100kg), "ton" (1000kg)
   - Convert to kg and provide as 'quantityKg'
   - Note: 1 quintal = 100 kg, 1 ton = 1000 kg

3. PRICE: What price they want
   - Extract the number as 'price'
   - Identify unit as 'priceUnit': "per_kg", "per_quintal", "per_ton"
   - Convert to per kg and provide as 'pricePerKg'
   - Note: If price is per quintal, divide by 100 for per kg
   - "50 rupees per quintal" = 0.5 rs per kg
   - "50 rs per kg" = 50 rs per kg

4. QUALITY: Grade of produce if mentioned
   - "ache", "badhiya", "first class", "best", "organic" = Premium
   - "achha", "good" = A
   - "theek theek", "average" = B
   - "normal" = Standard
   - "mixed", "milaya" = Mixed

5. CUSTOM LOCATION: If user wants prices from a specific place (not their GPS location)
   - Set wantsCustomLocation=true if they mention any specific state/city/mandi
   - Extract customState (Punjab, Maharashtra, Karnataka, UP, MP, etc.)
   - Extract customCity (Ludhiana, Nasik, Bengaluru, Lucknow, etc.)
   - Extract customMandi (Azadpur, Lasalgaon, Vashi, etc.)
   
   Examples:
   - "Delhi mandi ka bhav" -> wantsCustomLocation=true, customCity="Delhi"
   - "Punjab wheat price" -> wantsCustomLocation=true, customState="Punjab"
   - "Lasalgaon onion rate" -> wantsCustomLocation=true, customMandi="Lasalgaon"

6. Set 'hasAllInfo'=true ONLY if user provided: commodity + quantity + price all in one sentence
   Example: "400 quintal wheat at 50 rs" -> hasAllInfo=true
   Example: "I want to sell wheat" -> hasAllInfo=false (missing quantity and price)

Be generous in understanding. Farmers speak naturally, not formally.
If you can't extract something, leave it undefined (don't guess).
Set understood=true if you could parse any meaningful info.`
        });

        console.log("[AI] Extraction result:", JSON.stringify(result.object, null, 2));
        return result.object;

    } catch (error) {
        console.error("[X] Dynamic extraction failed:", error);
        return null;
    }
}

/**
 * Generate a natural conversational response using Gemini
 * This creates human-like responses instead of rigid template-based replies
 */
async function generateNaturalResponse(
    context: {
        language: LanguageConfig;
        stage: ConversationStage;
        collectedData: ConversationState['collectedData'];
        userInput: string;
        nextStage: ConversationStage;
        priceSuggestion?: PriceSuggestion;
        additionalContext?: string;
    }
): Promise<string> {
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            // Fallback to template if no API key
            return getLocalizedText(getTemplateKeyForStage(context.nextStage), context.language.code, {
                commodity: context.collectedData.commodity || "crop",
                quantity: (context.collectedData.quantityKg || 0).toString(),
                price: (context.collectedData.preferredPrice || 0).toString(),
                quality: context.collectedData.quality || "Standard"
            });
        }

        console.log(`[AI] Generating natural response for stage: ${context.nextStage}`);

        const result = await generateText({
            model: google("gemini-3-flash-preview"),
            prompt: `You are a friendly agricultural assistant helping an Indian farmer sell their produce. 
Generate a natural, warm conversational response in ${context.language.englishName} (${context.language.name}).

Current conversation context:
- User just said: "${context.userInput}"
- We are now moving to: ${context.nextStage}
- Information collected so far:
  ${context.collectedData.commodity ? `• Commodity: ${context.collectedData.commodity}` : '• Commodity: Not yet known'}
  ${context.collectedData.quantityKg ? `• Quantity: ${context.collectedData.quantityKg} kg` : '• Quantity: Not yet known'}
  ${context.collectedData.quality ? `• Quality: ${context.collectedData.quality}` : '• Quality: Not yet known'}
  ${context.collectedData.preferredPrice ? `• Price: ₹${context.collectedData.preferredPrice}/kg` : '• Price: Not yet known'}
  ${context.collectedData.location ? `• Location: ${context.collectedData.location}` : ''}
${context.priceSuggestion ? `
Market price info:
  • Min price: ₹${context.priceSuggestion.pricePerKg.min}/kg
  • Max price: ₹${context.priceSuggestion.pricePerKg.max}/kg
  • Average: ₹${context.priceSuggestion.pricePerKg.average}/kg
  • Source: ${context.priceSuggestion.market || 'Local mandi'}` : ''}
${context.additionalContext ? `\nAdditional context: ${context.additionalContext}` : ''}

Instructions:
1. Be warm, friendly and encouraging - farmers appreciate a supportive tone
2. If we have collected some information, acknowledge it naturally (don't just repeat it robotically)
3. Based on the next stage, naturally guide the conversation:
   - asking_commodity: Ask what they want to sell in a friendly way
   - asking_quantity: Ask how much they have, mentioning the commodity name naturally
   - asking_quality: Ask about quality in a conversational way
   - asking_price_preference: Ask about their price expectation or if they want to see market rates
   - showing_market_prices: Share the market prices and ask for confirmation
   - confirming_listing: Summarize everything and ask for final confirmation to broadcast
4. Keep the response concise (1-3 sentences max)
5. Don't force questions unnaturally - if the user provided multiple pieces of info, acknowledge that
6. Speak naturally like a helpful friend, not like a formal system
7. Use the local language appropriately - ${context.language.englishName} speakers expect certain phrases and idioms

Generate ONLY the response text, nothing else.`
        });

        console.log(`[AI] Generated response: ${result.text}`);
        return result.text;

    } catch (error) {
        console.error("[X] Natural response generation failed:", error);
        // Fallback to template
        return getLocalizedText(getTemplateKeyForStage(context.nextStage), context.language.code, {
            commodity: context.collectedData.commodity || "crop",
            quantity: (context.collectedData.quantityKg || 0).toString(),
            price: (context.collectedData.preferredPrice || 0).toString(),
            quality: context.collectedData.quality || "Standard"
        });
    }
}

/**
 * Get the template key for a given stage (fallback)
 */
function getTemplateKeyForStage(stage: ConversationStage): string {
    switch (stage) {
        case "asking_commodity": return "ask_commodity";
        case "asking_quantity": return "ask_quantity";
        case "asking_quality": return "ask_quality";
        case "asking_price_preference": return "ask_price_preference";
        case "showing_market_prices": return "confirm_price";
        case "confirming_listing": return "confirm_broadcast";
        default: return "error_general";
    }
}

/**
 * Determine next stage based on what info we still need
 */
function determineNextStage(collectedData: ConversationState['collectedData']): ConversationStage {
    if (!collectedData.commodity) return "asking_commodity";
    if (!collectedData.quantityKg) return "asking_quantity";
    if (!collectedData.quality) return "asking_quality";
    if (!collectedData.preferredPrice) return "asking_price_preference";
    return "confirming_listing";
}

/**
 * Handle commodity extraction
 * ENHANCED: Uses dynamic extraction to parse ALL info from user's speech in one go
 * Users can say: "I want to sell 400 quintals of wheat at 50 rs per quintal from Punjab"
 */
async function handleCommodity(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        // STEP 1: Try dynamic extraction first - this can parse everything in one go
        const extracted = await extractDynamicInfo(userInput, lang);

        if (extracted && extracted.understood) {
            console.log("[AI] Dynamic extraction successful:", extracted);

            // Build collected data from extracted info
            const newCollectedData: ConversationState['collectedData'] = {
                ...state.collectedData,
                // Commodity
                commodity: extracted.commodityEnglish || extracted.commodity,
                // Quantity (convert to kg if needed)
                quantityKg: extracted.quantityKg || (extracted.quantity ?
                    (extracted.quantityUnit === 'quintal' || extracted.quantityUnit === 'quintals' ? extracted.quantity * 100 :
                        extracted.quantityUnit === 'ton' || extracted.quantityUnit === 'tons' ? extracted.quantity * 1000 :
                            extracted.quantity) : undefined),
                // Quality
                quality: extracted.quality && extracted.quality !== 'unknown' ? extracted.quality : undefined,
                // Price (convert to per kg if needed)
                preferredPrice: extracted.pricePerKg || (extracted.price ?
                    (extracted.priceUnit === 'per_quintal' ? extracted.price / 100 :
                        extracted.priceUnit === 'per_ton' ? extracted.price / 1000 :
                            extracted.price) : undefined),
                // Custom location
                customState: extracted.customState,
                customCity: extracted.customCity,
                customMandi: extracted.customMandi,
                useCustomLocation: extracted.wantsCustomLocation
            };

            // Determine what stage to go to based on what info we have
            const nextStage = determineNextStage(newCollectedData);

            console.log(`[AI] Extraction: understood=${extracted.understood}, hasAllInfo=${extracted.hasAllInfo}`);
            console.log(`[AI] Collected data:`, JSON.stringify(newCollectedData, null, 2));
            console.log(`[AI] Next stage: ${nextStage}`);

            const newState: ConversationState = {
                ...state,
                stage: nextStage,
                collectedData: newCollectedData
            };

            // If user provided ALL info (commodity + quantity + price), fast-track to confirmation
            if (extracted.hasAllInfo && newCollectedData.commodity && newCollectedData.quantityKg && newCollectedData.preferredPrice) {
                // Set quality to Standard if not provided
                if (!newCollectedData.quality) {
                    newCollectedData.quality = "Standard";
                }
                newState.collectedData = newCollectedData;

                // Skip directly to showing market prices for comparison
                newState.stage = "showing_market_prices";

                const commodity = extracted.commodity || extracted.commodityEnglish || "produce";
                const quantityKg = newCollectedData.quantityKg;
                const pricePerKg = newCollectedData.preferredPrice;

                // Create a confirmation message with all the extracted info
                const summaryText = getLocalizedText("fast_track_summary", lang.code, {
                    commodity: commodity,
                    quantity: quantityKg.toString(),
                    price: pricePerKg.toFixed(2)
                }) || `Got it! ${quantityKg} kg of ${commodity} at ₹${pricePerKg.toFixed(2)} per kg. Let me check the market prices for you.`;

                return {
                    response: {
                        text: summaryText,
                        stage: "showing_market_prices",
                        expectsResponse: true
                    },
                    newState
                };
            }

            // If we have commodity, generate appropriate next question
            if (newCollectedData.commodity) {
                // Generate natural response based on next stage
                const naturalText = await generateNaturalResponse({
                    language: lang,
                    stage: state.stage,
                    collectedData: newCollectedData,
                    userInput,
                    nextStage
                });

                return {
                    response: {
                        text: naturalText,
                        stage: nextStage,
                        expectsResponse: true
                    },
                    newState
                };
            }
        }

        // FALLBACK: If dynamic extraction didn't get commodity, try regex
        console.log("[!] Dynamic extraction didn't find commodity, trying fallback...");
        const fallbackEnglish = mapCommodityName(userInput);

        if (fallbackEnglish) {
            console.log(`[OK] Regex fallback found: ${fallbackEnglish}`);
            const newState: ConversationState = {
                ...state,
                stage: "asking_quantity",
                collectedData: {
                    ...state.collectedData,
                    commodity: fallbackEnglish
                }
            };

            return {
                response: {
                    text: getLocalizedText("ask_quantity", lang.code, { commodity: fallbackEnglish }),
                    stage: "asking_quantity" as ConversationStage,
                    expectsResponse: true
                },
                newState
            };
        }

        // Nothing understood - ask again
        return {
            response: {
                text: getLocalizedText("not_understood_commodity", lang.code),
                stage: "asking_commodity",
                expectsResponse: true
            },
            newState: state
        };

    } catch (error) {
        console.error("[X] Commodity extraction error:", error);

        // Regex Fallback
        const fallbackEnglish = mapCommodityName(userInput);
        if (fallbackEnglish) {
            console.log(`[OK] Error recovery fallback found: ${fallbackEnglish}`);
            const newState: ConversationState = {
                ...state,
                stage: "asking_quantity",
                collectedData: {
                    ...state.collectedData,
                    commodity: fallbackEnglish
                }
            };

            return {
                response: {
                    text: getLocalizedText("ask_quantity", lang.code, { commodity: fallbackEnglish }),
                    stage: "asking_quantity" as ConversationStage,
                    expectsResponse: true
                },
                newState
            };
        }

        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "asking_commodity",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Handle quantity extraction
 * ENHANCED: Uses dynamic extraction to also capture price, quality, location if user provides them
 */
async function handleQuantity(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        // Use dynamic extraction to capture all info user might provide
        const extracted = await extractDynamicInfo(userInput, lang);

        if (extracted && extracted.understood) {
            // Get quantity from dynamic extraction
            const quantityKg = extracted.quantityKg || (extracted.quantity ?
                (extracted.quantityUnit === 'quintal' || extracted.quantityUnit === 'quintals' ? extracted.quantity * 100 :
                    extracted.quantityUnit === 'ton' || extracted.quantityUnit === 'tons' ? extracted.quantity * 1000 :
                        extracted.quantity) : undefined);

            if (quantityKg && quantityKg > 0) {
                // Build new collected data with all extracted info
                const newCollectedData: ConversationState['collectedData'] = {
                    ...state.collectedData,
                    quantityKg,
                    // Also pick up any extra info user provided
                    quality: extracted.quality && extracted.quality !== 'unknown'
                        ? extracted.quality
                        : state.collectedData.quality,
                    preferredPrice: extracted.pricePerKg || (extracted.price ?
                        (extracted.priceUnit === 'per_quintal' ? extracted.price / 100 :
                            extracted.priceUnit === 'per_ton' ? extracted.price / 1000 :
                                extracted.price) : state.collectedData.preferredPrice),
                    customState: extracted.customState || state.collectedData.customState,
                    customCity: extracted.customCity || state.collectedData.customCity,
                    customMandi: extracted.customMandi || state.collectedData.customMandi,
                    useCustomLocation: extracted.wantsCustomLocation || state.collectedData.useCustomLocation
                };

                // Determine next stage based on what we have
                const nextStage = determineNextStage(newCollectedData);

                const newState: ConversationState = {
                    ...state,
                    stage: nextStage,
                    collectedData: newCollectedData
                };

                // Generate natural response based on what info we have
                const naturalText = await generateNaturalResponse({
                    language: lang,
                    stage: state.stage,
                    collectedData: newCollectedData,
                    userInput,
                    nextStage,
                    additionalContext: newCollectedData.quality && newCollectedData.preferredPrice
                        ? `User provided all remaining info in one go - quality and price`
                        : newCollectedData.quality
                            ? `User also mentioned quality`
                            : undefined
                });

                // If user provided all info, fast-track
                if (newCollectedData.quality && newCollectedData.preferredPrice) {
                    newState.stage = "showing_market_prices";
                }

                return {
                    response: {
                        text: naturalText,
                        stage: newState.stage,
                        expectsResponse: true
                    },
                    newState
                };
            }
        }

        // Fallback: Simple quantity extraction
        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: z.object({
                quantityKg: z.number().describe("Quantity in kilograms"),
                understood: z.boolean()
            }),
            prompt: `Extract quantity from farmer's speech. Convert to kilograms.
      
User said: "${userInput}"

Note:
- 1 quintal = 100 kg
- 1 ton = 1000 kg
- Numbers might be in Hindi/regional numerals

Return quantity in kilograms.`
        });

        if (!result.object.understood || result.object.quantityKg <= 0) {
            return {
                response: {
                    text: getLocalizedText("not_understood_quantity", lang.code),
                    stage: "asking_quantity",
                    expectsResponse: true
                },
                newState: state
            };
        }

        const newState: ConversationState = {
            ...state,
            stage: "asking_quality",
            collectedData: {
                ...state.collectedData,
                quantityKg: result.object.quantityKg
            }
        };

        return {
            response: {
                text: getLocalizedText("ask_quality", lang.code, {
                    commodity: state.collectedData.commodity || "crop"
                }),
                stage: "asking_quality",
                expectsResponse: true
            },
            newState
        };

    } catch (error) {
        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "asking_quantity",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Handle quality extraction
 * ENHANCED: Uses dynamic extraction to also capture price and location if user provides them
 */
async function handleQuality(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        // Try dynamic extraction first to capture all info
        const extracted = await extractDynamicInfo(userInput, lang);

        if (extracted && extracted.understood) {
            // Get quality from dynamic extraction
            const quality = extracted.quality && extracted.quality !== 'unknown'
                ? extracted.quality
                : undefined;

            if (quality) {
                // Build new collected data with all extracted info
                const newCollectedData: ConversationState['collectedData'] = {
                    ...state.collectedData,
                    quality,
                    // Also pick up price and location if provided
                    preferredPrice: extracted.pricePerKg || (extracted.price ?
                        (extracted.priceUnit === 'per_quintal' ? extracted.price / 100 :
                            extracted.priceUnit === 'per_ton' ? extracted.price / 1000 :
                                extracted.price) : state.collectedData.preferredPrice),
                    customState: extracted.customState || state.collectedData.customState,
                    customCity: extracted.customCity || state.collectedData.customCity,
                    customMandi: extracted.customMandi || state.collectedData.customMandi,
                    useCustomLocation: extracted.wantsCustomLocation || state.collectedData.useCustomLocation
                };

                // Determine next stage
                const nextStage = newCollectedData.preferredPrice ? "showing_market_prices" : "asking_price_preference";

                const newState: ConversationState = {
                    ...state,
                    stage: nextStage,
                    collectedData: newCollectedData
                };

                // Generate natural response
                const naturalText = await generateNaturalResponse({
                    language: lang,
                    stage: state.stage,
                    collectedData: newCollectedData,
                    userInput,
                    nextStage,
                    additionalContext: newCollectedData.preferredPrice
                        ? `User also provided price - can fast-track to market prices`
                        : undefined
                });

                return {
                    response: {
                        text: naturalText,
                        stage: nextStage,
                        expectsResponse: true
                    },
                    newState
                };
            }
        }

        // Fallback: Simple quality extraction
        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: z.object({
                quality: z.enum(["Premium", "A", "B", "Standard", "Mixed"]).describe("Quality grade"),
                understood: z.boolean()
            }),
            prompt: `Extract quality grade from farmer's speech.
      
User said: "${userInput}"

Map to one of: Premium (best/first-class/organic), A (good), B (average), Standard (normal), Mixed (various qualities)

Common terms:
- "ache hai" / "badhiya" / "first class" = Premium or A
- "thik hai" / "normal" = Standard
- "mixed" / "milaya hua" = Mixed`
        });

        const newState: ConversationState = {
            ...state,
            stage: "asking_price_preference",
            collectedData: {
                ...state.collectedData,
                quality: result.object.quality || "Standard"
            }
        };

        return {
            response: {
                text: getLocalizedText("ask_price_preference", lang.code, {
                    commodity: state.collectedData.commodity || "crop",
                    quantity: state.collectedData.quantityKg?.toString() || "0"
                }),
                stage: "asking_price_preference",
                expectsResponse: true
            },
            newState
        };

    } catch (error) {
        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "asking_quality",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Handle price preference
 * ENHANCED: Also extracts custom location if user specifies a different mandi
 */
async function handlePricePreference(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: z.object({
                wantsMarketPrice: z.boolean().describe("User wants to see current market prices"),
                specificPrice: z.number().optional().describe("Specific price per kg mentioned"),
                // Also extract custom location at this stage
                customState: z.string().optional().describe("Indian state if user specified"),
                customCity: z.string().optional().describe("City name if user specified"),
                customMandi: z.string().optional().describe("Specific mandi name if user specified"),
                wantsCustomLocation: z.boolean().optional().describe("True if user wants prices from specific location"),
                understood: z.boolean()
            }),
            prompt: `Understand farmer's price preference and any custom location they want.
      
User said: "${userInput}"

Determine:
1. Do they want to see current market prices first? (mention of "mandi", "market", "rate", "kitna chal raha")
2. Or do they have a specific price in mind? (mentioned rupees/price/rate with a number)
3. Did they mention a specific location? (state, city, mandi name)
   - Examples: "Punjab ka rate", "Lasalgaon mandi", "Delhi market price", "Maharashtra mein"
   - If yes, set wantsCustomLocation=true and extract customState/customCity/customMandi

If specific price mentioned, convert to per kg if needed.`
        });

        // Determine location for fetching prices
        // Priority: 1) Custom location from this input, 2) Custom location from earlier, 3) GPS-based
        const customState = result.object.customState || state.collectedData.customState;
        const customCity = result.object.customCity || state.collectedData.customCity;
        const customMandi = result.object.customMandi || state.collectedData.customMandi;
        const useCustomLocation = result.object.wantsCustomLocation || state.collectedData.useCustomLocation;

        // Build location string for fetching prices
        const locationForPrices = useCustomLocation
            ? (customState || customCity || customMandi || state.collectedData.location)
            : state.collectedData.location;

        console.log(`[PRICE] Fetching prices for location: ${locationForPrices || 'GPS-based'}`);

        // Fetch market prices
        const commodity = state.collectedData.commodity || "unknown";
        const priceSuggestion = await getPriceSuggestion(commodity, locationForPrices);

        const newState: ConversationState = {
            ...state,
            stage: "showing_market_prices",
            collectedData: {
                ...state.collectedData,
                preferredPrice: result.object.specificPrice,
                useMarketPrice: result.object.wantsMarketPrice,
                // Store custom location
                customState,
                customCity,
                customMandi,
                useCustomLocation
            },
            priceSuggestion
        };

        // Generate natural response with market price info
        const naturalText = await generateNaturalResponse({
            language: lang,
            stage: state.stage,
            collectedData: newState.collectedData,
            userInput,
            nextStage: "showing_market_prices",
            priceSuggestion,
            additionalContext: result.object.specificPrice
                ? `User mentioned specific price of ₹${result.object.specificPrice}/kg. ${result.object.specificPrice >= priceSuggestion.pricePerKg.average
                    ? "Their price is good - at or above market average"
                    : "Their price is below market average - might want to increase"
                }`
                : `User wants to know market prices before deciding`
        });

        return {
            response: {
                text: naturalText,
                stage: "showing_market_prices",
                expectsResponse: true,
                priceSuggestion
            },
            newState
        };

    } catch (error) {
        console.error("[X] Price preference handling failed:", error);
        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "asking_price_preference",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Handle market price confirmation
 */
async function handleMarketPriceConfirmation(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: z.object({
                confirmed: z.boolean().describe("User confirmed/agreed"),
                newPrice: z.number().optional().describe("If user specified a different price"),
                understood: z.boolean()
            }),
            prompt: `Understand if farmer confirmed the price.
      
User said: "${userInput}"

Look for:
- Confirmation: "haan", "theek hai", "chalo", "ok", "yes", "done"
- New price: any number mentioned
- Rejection: "nahi", "no", "zyada", "kam"`
        });

        let finalPrice = state.priceSuggestion?.pricePerKg.average || 0;

        if (result.object.newPrice && result.object.newPrice > 0) {
            finalPrice = result.object.newPrice;
        } else if (state.collectedData.preferredPrice) {
            finalPrice = state.collectedData.preferredPrice;
        }

        // Build catalog item
        const catalogItem: BecknCatalogItem = {
            descriptor: {
                name: `${state.collectedData.location || ""} ${state.collectedData.commodity || "Produce"}`.trim(),
                symbol: "/icons/default.png"
            },
            price: {
                value: finalPrice,
                currency: "INR"
            },
            quantity: {
                available: {
                    count: state.collectedData.quantityKg || 0
                },
                unit: "kg"
            },
            tags: {
                grade: state.collectedData.quality,
                perishability: "medium",
                logistics_provider: "India Post"
            }
        };

        const newState: ConversationState = {
            ...state,
            stage: "confirming_listing",
            collectedData: {
                ...state.collectedData,
                preferredPrice: finalPrice
            },
            catalogItem
        };

        // Summarize listing
        const summary = getLocalizedText("listing_summary", lang.code, {
            commodity: state.collectedData.commodity || "produce",
            quantity: state.collectedData.quantityKg?.toString() || "0",
            price: finalPrice.toString(),
            quality: state.collectedData.quality || "Standard"
        });

        return {
            response: {
                text: summary + " " + getLocalizedText("confirm_broadcast", lang.code),
                stage: "confirming_listing",
                expectsResponse: true,
                catalogItem
            },
            newState
        };

    } catch (error) {
        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "showing_market_prices",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Handle listing confirmation
 */
async function handleListingConfirmation(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-3-flash-preview"),
            schema: z.object({
                confirmed: z.boolean(),
                understood: z.boolean()
            }),
            prompt: `Did the farmer confirm broadcasting their listing?
      
User said: "${userInput}"

Look for: "haan", "yes", "bhejo", "broadcast", "theek hai", "chalo", "kar do"`
        });

        if (!result.object.confirmed) {
            return {
                response: {
                    text: getLocalizedText("cancelled", lang.code),
                    stage: "greeting",
                    expectsResponse: false
                },
                newState: { ...state, stage: "greeting" }
            };
        }

        // Proceed to broadcasting
        const newState: ConversationState = {
            ...state,
            stage: "broadcasting"
        };

        return {
            response: {
                text: getLocalizedText("broadcasting", lang.code),
                stage: "broadcasting",
                expectsResponse: false,
                catalogItem: state.catalogItem
            },
            newState
        };

    } catch (error) {
        return {
            response: {
                text: getLocalizedText("error_retry", lang.code),
                stage: "confirming_listing",
                expectsResponse: true
            },
            newState: state
        };
    }
}

/**
 * Generate success message after broadcast
 */
export function getSuccessMessage(lang: LanguageConfig, buyerName: string, bidAmount: number): string {
    return getLocalizedText("success", lang.code, {
        buyer: buyerName,
        amount: bidAmount.toString()
    });
}

/**
 * Localized text messages
 */
const LOCALIZED_TEXTS: Record<string, Record<string, string>> = {
    "hi": {
        ask_commodity: "आप कौन सी फसल बेचना चाहते हैं? जैसे प्याज़, आलू, टमाटर... आप एक ही बार में सब कुछ बता सकते हैं जैसे '400 क्विंटल गेहूं 50 रुपये क्विंटल में बेचना है'",
        ask_quantity: "कितना {commodity} बेचना है? किलो या क्विंटल में बताइए।",
        ask_quality: "{commodity} की क्वालिटी कैसी है? अच्छी, मीडियम, या मिक्स?",
        ask_price_preference: "आपको कितने रुपये प्रति किलो चाहिए? या मंडी का भाव देखना है?",
        confirm_price: "क्या यह दाम ठीक है?",
        price_good: "आपका भाव अच्छा है।",
        price_low: "आपका भाव थोड़ा कम है मंडी दाम से।",
        listing_summary: "{quantity} किलो {commodity}, {quality} क्वालिटी, {price} रुपये प्रति किलो।",
        confirm_broadcast: "क्या मैं खरीदारों को भेजूं?",
        broadcasting: "ठीक है। खरीदारों को भेज रहा हूं। कृपया प्रतीक्षा करें...",
        success: "बधाई हो! {buyer} ने {amount} रुपये प्रति किलो का ऑफर दिया है!",
        cancelled: "कोई बात नहीं। जब चाहें फिर से बोलें।",
        not_understood_commodity: "माफ़ कीजिए, समझ नहीं आया। कौन सी फसल बेचनी है?",
        not_understood_quantity: "कितना किलो या क्विंटल है? कृपया दोबारा बताइए।",
        error_retry: "माफ़ कीजिए, कृपया दोबारा बोलें।",
        error_general: "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।",
        fast_track_summary: "समझ गया! {quantity} किलो {commodity}, ₹{price} प्रति किलो। मंडी का भाव देखता हूं..."
    },
    "mr": {
        ask_commodity: "तुम्हाला कोणते पीक विकायचे आहे? जसे कांदा, बटाटा, टोमॅटो... तुम्ही एकदम सगळे सांगू शकता जसे '४०० क्विंटल गहू ५० रुपये क्विंटलला विकायचा आहे'",
        ask_quantity: "किती {commodity} विकायचे आहे? किलो किंवा क्विंटल मध्ये सांगा.",
        ask_quality: "{commodity} ची गुणवत्ता कशी आहे? चांगली, मध्यम, किंवा मिश्र?",
        ask_price_preference: "तुम्हाला प्रति किलो किती रुपये हवे आहेत? किंवा बाजार भाव बघायचा आहे का?",
        confirm_price: "हा भाव ठीक आहे का?",
        price_good: "तुमचा भाव चांगला आहे.",
        price_low: "तुमचा भाव बाजार भावापेक्षा थोडा कमी आहे.",
        listing_summary: "{quantity} किलो {commodity}, {quality} गुणवत्ता, {price} रुपये प्रति किलो.",
        confirm_broadcast: "खरेदीदारांना पाठवू का?",
        broadcasting: "ठीक आहे. खरेदीदारांना पाठवत आहे. कृपया वाट पहा...",
        success: "अभिनंदन! {buyer} यांनी प्रति किलो {amount} रुपयांची ऑफर दिली आहे!",
        cancelled: "काही हरकत नाही. पुन्हा केव्हाही बोला.",
        not_understood_commodity: "माफ करा, समजले नाही. कोणते पीक विकायचे आहे?",
        not_understood_quantity: "किती किलो किंवा क्विंटल आहे? कृपया पुन्हा सांगा.",
        error_retry: "माफ करा, कृपया पुन्हा बोला.",
        error_general: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
        fast_track_summary: "समजले! {quantity} किलो {commodity}, ₹{price} प्रति किलो. बाजार भाव तपासतो..."
    },
    "ta": {
        ask_commodity: "எந்த பயிரை விற்க விரும்புகிறீர்கள்? வெங்காயம், உருளைக்கிழங்கு, தக்காளி போன்றவை... நீங்கள் எல்லாவற்றையும் ஒரே நேரத்தில் சொல்லலாம், எ.கா. '400 குவிண்டால் கோதுமை 50 ரூபாய்க்கு விற்க வேண்டும்'",
        ask_quantity: "எவ்வளவு {commodity} விற்க வேண்டும்? கிலோ அல்லது குவிண்டாலில் சொல்லுங்கள்.",
        ask_quality: "{commodity} தரம் எப்படி இருக்கிறது? நல்லது, நடுத்தரம், அல்லது கலப்பு?",
        ask_price_preference: "கிலோவுக்கு எவ்வளவு விலை வேண்டும்? அல்லது சந்தை விலை பார்க்கணுமா?",
        confirm_price: "இந்த விலை சரியா?",
        price_good: "உங்கள் விலை நல்லது.",
        price_low: "உங்கள் விலை சந்தை விலையை விட சற்று குறைவு.",
        listing_summary: "{quantity} கிலோ {commodity}, {quality} தரம், {price} ரூபாய் கிலோவுக்கு.",
        confirm_broadcast: "வாங்குபவர்களுக்கு அனுப்பட்டுமா?",
        broadcasting: "சரி. வாங்குபவர்களுக்கு அனுப்புகிறேன். தயவுசெய்து காத்திருங்கள்...",
        success: "வாழ்த்துக்கள்! {buyer} கிலோவுக்கு {amount} ரூபாய் கொடுக்க முன்வந்துள்ளார்!",
        cancelled: "பரவாயில்லை. எப்போது வேண்டுமானாலும் மீண்டும் பேசுங்கள்.",
        not_understood_commodity: "மன்னிக்கவும், புரியவில்லை. எந்த பயிரை விற்க வேண்டும்?",
        not_understood_quantity: "எத்தனை கிலோ அல்லது குவிண்டால்? மீண்டும் சொல்லுங்கள்.",
        error_retry: "மன்னிக்கவும், மீண்டும் பேசுங்கள்.",
        error_general: "ஏதோ பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
        fast_track_summary: "புரிந்தது! {quantity} கிலோ {commodity}, ₹{price} கிலோவுக்கு. சந்தை விலை பார்க்கிறேன்..."
    },
    "te": {
        ask_commodity: "ఏ పంట అమ్మాలనుకుంటున్నారు? ఉల్లిపాయలు, బంగాళాదుంపలు, టొమాటోలు వంటివి... మీరు అన్నీ ఒకేసారి చెప్పవచ్చు, ఉదా. '400 క్వింటాళ్ల గోధుమలు 50 రూపాయలకు అమ్మాలి'",
        ask_quantity: "ఎంత {commodity} అమ్మాలి? కిలోలు లేదా క్వింటాళ్లలో చెప్పండి.",
        ask_quality: "{commodity} నాణ్యత ఎలా ఉంది? మంచిది, మధ్యస్థం, లేదా మిశ్రమం?",
        ask_price_preference: "కిలోకు ఎంత రూపాయలు కావాలి? లేదా మార్కెట్ ధర చూడాలా?",
        confirm_price: "ఈ ధర సరేనా?",
        price_good: "మీ ధర బాగుంది.",
        price_low: "మీ ధర మార్కెట్ ధర కంటే కొంచెం తక్కువ.",
        listing_summary: "{quantity} కిలోలు {commodity}, {quality} నాణ్యత, {price} రూపాయలు కిలోకు.",
        confirm_broadcast: "కొనుగోలుదారులకు పంపమంటారా?",
        broadcasting: "సరే. కొనుగోలుదారులకు పంపుతున్నాను. దయచేసి వేచి ఉండండి...",
        success: "అభినందనలు! {buyer} కిలోకు {amount} రూపాయలు ఆఫర్ చేశారు!",
        cancelled: "పర్వాలేదు. ఎప్పుడైనా మళ్ళీ మాట్లాడండి.",
        not_understood_commodity: "క్షమించండి, అర్థం కాలేదు. ఏ పంట అమ్మాలనుకుంటున్నారు?",
        not_understood_quantity: "ఎన్ని కిలోలు లేదా క్వింటాళ్లు? దయచేసి మళ్ళీ చెప్పండి.",
        error_retry: "క్షమించండి, దయచేసి మళ్ళీ చెప్పండి.",
        error_general: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        fast_track_summary: "అర్థమైంది! {quantity} కిలోల {commodity}, ₹{price} కిలోకు. మార్కెట్ ధర చూస్తున్నాను..."
    },
    "en": {
        ask_commodity: "What crop do you want to sell? Like onion, potato, tomato... You can also tell everything at once, like '400 quintals of wheat at 50 rupees per quintal'",
        ask_quantity: "How much {commodity} do you want to sell? Tell in kg or quintal.",
        ask_quality: "What is the quality of {commodity}? Good, medium, or mixed?",
        ask_price_preference: "How much rupees per kg do you want? Or want to see market price?",
        confirm_price: "Is this price okay?",
        price_good: "Your price is good.",
        price_low: "Your price is a bit lower than market rate.",
        listing_summary: "{quantity} kg {commodity}, {quality} quality, {price} rupees per kg.",
        confirm_broadcast: "Should I send to buyers?",
        broadcasting: "Okay. Sending to buyers. Please wait...",
        success: "Congratulations! {buyer} has offered {amount} rupees per kg!",
        cancelled: "No problem. Talk again whenever you want.",
        not_understood_commodity: "Sorry, I didn't understand. What crop do you want to sell?",
        not_understood_quantity: "How many kg or quintals? Please tell again.",
        error_retry: "Sorry, please speak again.",
        error_general: "Something went wrong. Please try again.",
        fast_track_summary: "Got it! {quantity} kg of {commodity} at ₹{price} per kg. Let me check the market prices for you..."
    }
};

// Add fallbacks for other languages
for (const lang of SUPPORTED_LANGUAGES) {
    if (!LOCALIZED_TEXTS[lang.code]) {
        LOCALIZED_TEXTS[lang.code] = LOCALIZED_TEXTS["en"]; // Fallback to English
    }
}

/**
 * Get localized text with variable substitution
 */
function getLocalizedText(
    key: string,
    langCode: string,
    variables?: Record<string, string>
): string {
    const texts = LOCALIZED_TEXTS[langCode] || LOCALIZED_TEXTS["en"];
    let text = texts[key] || LOCALIZED_TEXTS["en"][key] || key;

    if (variables) {
        for (const [varKey, varValue] of Object.entries(variables)) {
            text = text.replace(new RegExp(`\\{${varKey}\\}`, "g"), varValue);
        }
    }

    return text;
}
