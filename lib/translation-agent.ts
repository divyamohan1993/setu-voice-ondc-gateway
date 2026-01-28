/**
 * Translation Agent
 * 
 * This module provides AI-powered translation of vernacular voice commands
 * into Beckn Protocol-compliant JSON catalog items. It uses the Vercel AI SDK
 * with structured output generation and includes fallback mechanisms for reliability.
 */

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { BecknCatalogItemSchema, type BecknCatalogItem } from "./beckn-schema";

/**
 * FALLBACK_CATALOG
 * 
 * A hardcoded valid Beckn Protocol catalog item used as a fallback
 * when AI translation fails or API key is missing. This ensures
 * live demos cannot fail.
 */
const FALLBACK_CATALOG: BecknCatalogItem = {
  descriptor: {
    name: "Nasik Onions",
    symbol: "/icons/onion.png"
  },
  price: {
    value: 40,
    currency: "INR"
  },
  quantity: {
    available: { count: 500 },
    unit: "kg"
  },
  tags: {
    grade: "A",
    perishability: "medium",
    logistics_provider: "India Post"
  }
};

/**
 * Commodity name mapping from Hindi/Hinglish to English
 * Maps vernacular terms to standardized product names
 */
const COMMODITY_MAPPING: Record<string, string> = {
  // Onions
  "pyaaz": "Onions",
  "pyaz": "Onions",
  "kanda": "Onions",

  // Mangoes
  "aam": "Mangoes",
  "mango": "Mangoes",
  "alphonso": "Alphonso Mangoes",

  // Tomatoes
  "tamatar": "Tomatoes",
  "tomato": "Tomatoes",

  // Potatoes
  "aloo": "Potatoes",
  "potato": "Potatoes",
  "batata": "Potatoes",

  // Wheat
  "gehun": "Wheat",
  "gehu": "Wheat",
  "wheat": "Wheat",

  // Rice
  "chawal": "Rice",
  "rice": "Rice",
  "basmati": "Basmati Rice",

  // Lentils
  "dal": "Lentils",
  "daal": "Lentils",
  "lentil": "Lentils"
};

/**
 * Location extraction patterns
 * Common Indian agricultural regions
 */
const LOCATION_PATTERNS: Record<string, string> = {
  "nasik": "Nasik",
  "nashik": "Nasik",
  "ratnagiri": "Ratnagiri",
  "pune": "Pune",
  "mumbai": "Mumbai",
  "delhi": "Delhi",
  "bengaluru": "Bengaluru",
  "bangalore": "Bengaluru",
  "hyderabad": "Hyderabad"
};

/**
 * Quality grade extraction patterns
 * Maps vernacular quality indicators to standard grades
 */
const GRADE_PATTERNS: Record<string, string> = {
  "grade a": "A",
  "a grade": "A",
  "premium": "Premium",
  "best": "Premium",
  "first class": "A",
  "top quality": "Premium",
  "organic": "Organic"
};

/**
 * mapCommodityName
 * 
 * Maps Hindi/Hinglish commodity names to standardized English names
 * 
 * @param voiceText - The raw voice input text
 * @returns Standardized commodity name or null if not found
 */
function mapCommodityName(voiceText: string): string | null {
  const lowerText = voiceText.toLowerCase();

  for (const [hindiTerm, englishName] of Object.entries(COMMODITY_MAPPING)) {
    if (lowerText.includes(hindiTerm)) {
      return englishName;
    }
  }

  return null;
}

/**
 * extractLocation
 * 
 * Extracts location information from voice text
 * 
 * @param voiceText - The raw voice input text
 * @returns Extracted location or null if not found
 */
function extractLocation(voiceText: string): string | null {
  const lowerText = voiceText.toLowerCase();

  for (const [pattern, location] of Object.entries(LOCATION_PATTERNS)) {
    if (lowerText.includes(pattern)) {
      return location;
    }
  }

  return null;
}

/**
 * extractQualityGrade
 * 
 * Extracts quality grade information from voice text
 * 
 * @param voiceText - The raw voice input text
 * @returns Extracted grade or null if not found
 */
function extractQualityGrade(voiceText: string): string | null {
  const lowerText = voiceText.toLowerCase();

  for (const [pattern, grade] of Object.entries(GRADE_PATTERNS)) {
    if (lowerText.includes(pattern)) {
      return grade;
    }
  }

  return null;
}

/**
 * buildPrompt
 * 
 * Builds a comprehensive prompt for the AI model to convert
 * voice text into Beckn Protocol JSON
 * 
 * @param voiceText - The raw voice input text
 * @returns Formatted prompt string
 */
function buildPrompt(voiceText: string): string {
  const commodity = mapCommodityName(voiceText);
  const location = extractLocation(voiceText);
  const grade = extractQualityGrade(voiceText);

  return `You are a translation agent for the Setu Voice-to-ONDC Gateway system. Your task is to convert vernacular farmer voice commands into valid Beckn Protocol catalog items.

Voice Input: "${voiceText}"

Extract the following information and generate a valid Beckn Protocol catalog item:

1. Product Name: ${commodity ? `Use "${commodity}"` : "Identify the commodity mentioned"}
2. Location: ${location ? `The product is from ${location}` : "Extract location if mentioned"}
3. Quality Grade: ${grade ? `Grade is "${grade}"` : "Extract quality grade if mentioned (A, B, Premium, Organic, etc.)"}
4. Quantity: Extract the quantity and unit (kg, piece, liter, crate, etc.)
5. Price: Estimate a reasonable market price in INR based on the commodity and quantity

Additional Guidelines:
- For the symbol field, use "/icons/{commodity}.png" format (e.g., "/icons/onion.png")
- Set perishability based on commodity type:
  * Fruits/Vegetables: "high" or "medium"
  * Grains/Pulses: "low"
- Choose an appropriate logistics provider:
  * For perishable items: "Delhivery" or "BlueDart"
  * For non-perishable items: "India Post"
- If location is mentioned, include it in the product name (e.g., "Nasik Onions")
- Currency should always be "INR"

Generate a complete, valid Beckn Protocol catalog item.`;
}

/**
 * validateCatalog
 * 
 * Validates a catalog item against the Beckn Protocol schema
 * and applies default values for optional fields
 * 
 * @param data - The data to validate
 * @returns Validated BecknCatalogItem
 * @throws Error if validation fails
 */
export function validateCatalog(data: unknown): BecknCatalogItem {
  try {
    const validated = BecknCatalogItemSchema.parse(data);

    // Apply defaults for optional fields if not present
    if (!validated.tags.perishability) {
      validated.tags.perishability = "medium";
    }

    if (!validated.tags.logistics_provider) {
      validated.tags.logistics_provider = "India Post";
    }

    console.log("[OK] Catalog validation successful");
    return validated;
  } catch (error) {
    console.error("[X] Catalog validation failed:", error);
    throw new Error(`Invalid catalog structure: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * translateVoiceToJson
 * 
 * Translates voice text to Beckn Protocol JSON using AI
 * This is the core translation function without fallback logic
 * 
 * @param voiceText - The raw voice input text
 * @returns Promise resolving to BecknCatalogItem
 * @throws Error if translation fails
 */
export async function translateVoiceToJson(voiceText: string): Promise<BecknCatalogItem> {
  console.log(" Starting AI translation for:", voiceText);

  const prompt = buildPrompt(voiceText);

  const result = await generateObject({
    model: google("gemini-3-flash-preview"),
    schema: BecknCatalogItemSchema,
    prompt: prompt,
  });

  console.log("[OK] AI translation completed");

  // Validate the result
  const validated = validateCatalog(result.object);

  return validated;
}

/**
 * translateVoiceToJsonWithFallback
 * 
 * Translates voice text to Beckn Protocol JSON with comprehensive
 * fallback mechanisms. This is the main function to use in production.
 * 
 * Features:
 * - API key validation
 * - Retry logic with exponential backoff (3 attempts)
 * - Fallback to hardcoded catalog on all failures
 * - Comprehensive error logging
 * 
 * @param voiceText - The raw voice input text
 * @returns Promise resolving to BecknCatalogItem (never fails)
 */
export async function translateVoiceToJsonWithFallback(voiceText: string): Promise<BecknCatalogItem> {
  // Check for API key
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("[!]  Google API key missing, using fallback catalog");
    return FALLBACK_CATALOG;
  }

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(` Translation attempt ${attempt}/3`);

      const result = await translateVoiceToJson(voiceText);

      console.log("[OK] Translation successful on attempt", attempt);
      return result;

    } catch (error) {
      console.error(`[X] Translation attempt ${attempt} failed:`, error);

      // If this was the last attempt, use fallback
      if (attempt === 3) {
        console.warn("[!]  All translation attempts failed, using fallback catalog");
        return FALLBACK_CATALOG;
      }

      // Exponential backoff: wait 1s, 2s, 4s
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(` Waiting ${backoffMs}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  // This should never be reached, but TypeScript needs it
  return FALLBACK_CATALOG;
}
