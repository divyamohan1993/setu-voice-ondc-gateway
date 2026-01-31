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
 * Handle commodity extraction
 */
async function handleCommodity(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    // Helper for successful commodity found
    const onCommodityFound = (commodity: string, commodityEnglish: string, quantity?: number, quality?: string) => {
        const newState: ConversationState = {
            ...state,
            collectedData: {
                ...state.collectedData,
                commodity: commodityEnglish,
                quantityKg: quantity,
                quality: quality
            }
        };

        // If quantity was also mentioned/found
        if (quantity && quantity > 0) {
            if (quality) {
                newState.stage = "asking_price_preference";
                return {
                    response: {
                        text: getLocalizedText("ask_price_preference", lang.code, {
                            commodity: commodity,
                            quantity: quantity.toString()
                        }),
                        stage: "asking_price_preference" as ConversationStage,
                        expectsResponse: true
                    },
                    newState
                };
            } else {
                newState.stage = "asking_quality";
                return {
                    response: {
                        text: getLocalizedText("ask_quality", lang.code, {
                            commodity: commodity
                        }),
                        stage: "asking_quality" as ConversationStage,
                        expectsResponse: true
                    },
                    newState
                };
            }
        }

        // Ask for quantity
        newState.stage = "asking_quantity";
        return {
            response: {
                text: getLocalizedText("ask_quantity", lang.code, {
                    commodity: commodity
                }),
                stage: "asking_quantity" as ConversationStage,
                expectsResponse: true
            },
            newState
        };
    };

    try {
        // Fallback: Check if API key is missing, if so, use regex directly
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            throw new Error("No API Key");
        }

        // Use AI to extract commodity from natural speech
        const result = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: z.object({
                commodity: z.string().describe("The agricultural commodity mentioned"),
                commodityEnglish: z.string().describe("English name of the commodity"),
                location: z.string().optional().describe("Location if mentioned"),
                quantity: z.number().optional().describe("Quantity in kg if mentioned"),
                quality: z.string().optional().describe("Quality grade if mentioned"),
                understood: z.boolean().describe("Whether we could understand the input")
            }),
            prompt: `User is a farmer speaking in ${lang.englishName}. Extract commodity information from their speech:
            
User said: "${userInput}"

Extract:
1. commodity: The name of the crop in ${lang.englishName} script/language.
2. commodityEnglish: The English name.
3. Any location mentioned
4. Quantity in kg if mentioned
5. Quality grade if mentioned

If you cannot understand, set understood to false.`
        });

        if (!result.object.understood || !result.object.commodity) {
            // AI couldn't match, maybe try regex fallback before giving up?
            const fallbackEnglish = mapCommodityName(userInput);
            if (fallbackEnglish) {
                return onCommodityFound(fallbackEnglish, fallbackEnglish);
            }

            return {
                response: {
                    text: getLocalizedText("not_understood_commodity", lang.code),
                    stage: "asking_commodity",
                    expectsResponse: true
                },
                newState: state
            };
        }

        return onCommodityFound(
            result.object.commodity,
            result.object.commodityEnglish || result.object.commodity,
            result.object.quantity,
            result.object.quality
        );

    } catch (error) {
        console.warn("[!] Commodity extraction failed (or no key), trying regex fallback:", error);

        // Regex Fallback
        const fallbackEnglish = mapCommodityName(userInput);
        if (fallbackEnglish) {
            console.log(`[OK] Regex fallback found: ${fallbackEnglish}`);
            return onCommodityFound(fallbackEnglish, fallbackEnglish);
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
 */
async function handleQuantity(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-2.0-flash"),
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
 */
async function handleQuality(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-2.0-flash"),
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
 */
async function handlePricePreference(
    state: ConversationState,
    userInput: string
): Promise<{ response: VoiceResponse; newState: ConversationState }> {
    const lang = state.language;

    try {
        const result = await generateObject({
            model: google("gemini-2.0-flash"),
            schema: z.object({
                wantsMarketPrice: z.boolean().describe("User wants to see current market prices"),
                specificPrice: z.number().optional().describe("Specific price per kg mentioned"),
                understood: z.boolean()
            }),
            prompt: `Understand farmer's price preference.
      
User said: "${userInput}"

Determine:
1. Do they want to see current market prices first? (mention of "mandi", "market", "rate", "kitna chal raha")
2. Or do they have a specific price in mind? (mentioned rupees/price/rate with a number)

If specific price mentioned, convert to per kg if needed.`
        });

        // Fetch market prices
        const commodity = state.collectedData.commodity || "unknown";
        const priceSuggestion = await getPriceSuggestion(commodity, state.collectedData.location);

        let priceText = formatPriceForVoice(priceSuggestion, lang.code);

        if (result.object.specificPrice && result.object.specificPrice > 0) {
            // User has specific price in mind
            const suggestedCompare = result.object.specificPrice >= priceSuggestion.pricePerKg.average
                ? getLocalizedText("price_good", lang.code)
                : getLocalizedText("price_low", lang.code);

            priceText += suggestedCompare;
        }

        const newState: ConversationState = {
            ...state,
            stage: "showing_market_prices",
            collectedData: {
                ...state.collectedData,
                preferredPrice: result.object.specificPrice,
                useMarketPrice: result.object.wantsMarketPrice
            },
            priceSuggestion
        };

        return {
            response: {
                text: priceText + " " + getLocalizedText("confirm_price", lang.code),
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
            model: google("gemini-2.0-flash"),
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
            model: google("gemini-2.0-flash"),
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
        ask_commodity: "आप कौन सी फसल बेचना चाहते हैं? जैसे प्याज़, आलू, टमाटर...",
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
        error_general: "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।"
    },
    "mr": {
        ask_commodity: "तुम्हाला कोणते पीक विकायचे आहे? जसे कांदा, बटाटा, टोमॅटो...",
        ask_quantity: "किती {commodity} विकायचे आहे? किलो किंवा क्विंटल मध्ये सांगा।",
        ask_quality: "{commodity} ची क्वालिटी कशी आहे? चांगली, मध्यम, किंवा मिक्स?",
        ask_price_preference: "तुम्हाला प्रति किलो किती रुपये हवे आहेत? किंवा बाजार भाव बघायचा आहे?",
        confirm_price: "हा भाव ठीक आहे का?",
        price_good: "तुमचा भाव चांगला आहे।",
        price_low: "तुमचा भाव बाजार भावापेक्षा थोडा कमी आहे।",
        listing_summary: "{quantity} किलो {commodity}, {quality} क्वालिटी, {price} रुपये प्रति किलो।",
        confirm_broadcast: "खरेदीदारांना पाठवू का?",
        broadcasting: "ठीक आहे। खरेदीदारांना पाठवत आहे. कृपया प्रतीक्षा करा...",
        success: "अभिनंदन! {buyer} ने {amount} रुपये प्रति किलोची ऑफर दिली आहे!",
        cancelled: "काही हरकत नाही। पुन्हा केव्हाही बोला।",
        not_understood_commodity: "माफ करा, समजले नाही। कोणते पीक विकायचे आहे?",
        not_understood_quantity: "किती किलो किंवा क्विंटल आहे? कृपया पुन्हा सांगा।",
        error_retry: "माफ करा, कृपया पुन्हा बोला।",
        error_general: "काहीतरी चूक झाली। कृपया पुन्हा प्रयत्न करा।"
    },
    "ta": {
        ask_commodity: "எந்த பயிரை விற்க விரும்புகிறீர்கள்? வெங்காயம், உருளைக்கிழங்கு, தக்காளி போன்றவை...",
        ask_quantity: "எவ்வளவு {commodity} விற்க வேண்டும்? கிலோ அல்லது குவிண்டால் சொல்லுங்கள்।",
        ask_quality: "{commodity} தரம் எப்படி இருக்கிறது? நல்லது, நடுத்தரம், அல்லது கலப்பு?",
        ask_price_preference: "கிலோவுக்கு எவ்வளவு விலை வேண்டும்? அல்லது சந்தை விலை பார்க்கணுமா?",
        confirm_price: "இந்த விலை சரியா?",
        price_good: "உங்கள் விலை நல்லது।",
        price_low: "உங்கள் விலை சந்தை விலையை விட சற்று குறைவு।",
        listing_summary: "{quantity} கிலோ {commodity}, {quality} தரம், {price} ரூபாய் கிலோவுக்கு।",
        confirm_broadcast: "வாங்குபவர்களுக்கு அனுப்பட்டுமா?",
        broadcasting: "சரி। வாங்குபவர்களுக்கு அனுப்புகிறேன். தயவுசெய்து காத்திருங்கள்...",
        success: "வாழ்த்துக்கள்! {buyer} கிலோவுக்கு {amount} ரூபாய் கொடுக்க முன்வந்துள்ளார்!",
        cancelled: "பரவாயில்லை। எப்போது வேண்டுமானாலும் மீண்டும் பேசுங்கள்।",
        not_understood_commodity: "மன்னிக்கவும், புரியவில்லை। எந்த பயிரை விற்க வேண்டும்?",
        not_understood_quantity: "எத்தனை கிலோ அல்லது குவிண்டால்? மீண்டும் சொல்லுங்கள்.",
        error_retry: "மன்னிக்கவும், மீண்டும் பேசுங்கள்.",
        error_general: "ஏதோ பிழை ஏற்பட்டது। மீண்டும் முயற்சிக்கவும்."
    },
    "te": {
        ask_commodity: "ఏ పంట అమ్మాలనుకుంటున్నారు? ఉల్లిపాయలు, బంగాళాదుంపలు, టొమాటోలు వంటివి...",
        ask_quantity: "ఎంత {commodity} అమ్మాలి? కిలోలు లేదా క్వింటాల్లలో చెప్పండి.",
        ask_quality: "{commodity} నాణ్యత ఎలా ఉంది? మంచిది, మధ్యస్థం, లేదా కలపడం?",
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
        not_understood_quantity: "ఎన్ని కిలోలు లేదా క్వింటాల్లు? దయచేసి మళ్ళీ చెప్పండి.",
        error_retry: "క్షమించండి, దయచేసి మళ్ళీ చెప్పండి.",
        error_general: "ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
    },
    "en": {
        ask_commodity: "What crop do you want to sell? Like onion, potato, tomato...",
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
        error_general: "Something went wrong. Please try again."
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
