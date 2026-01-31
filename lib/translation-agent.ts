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
 * FALLBACK removed. We now use dynamic regex extraction or fail gracefully.
 */

/**
 * Commodity name mapping from Hindi/Hinglish to English
 * Maps vernacular terms to standardized product names
 */
/**
 * Commodity name mapping from Hindi/Hinglish to English
 * Maps vernacular terms to standardized product names
 */
export const COMMODITY_MAPPING: Record<string, string> = {
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
  "lentil": "Lentils",

  // Cucumber
  "cucumber": "Cucumber",
  "kheera": "Cucumber",
  "kakdi": "Cucumber"
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
export function mapCommodityName(voiceText: string): string | null {
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
  // Helpers usage removed as per previous instruction, logic moved to prompt
  return `You are a translation agent for the Setu Voice-to-ONDC Gateway system. Your task is to convert vernacular farmer voice commands into valid Beckn Protocol catalog items.

Voice Input: "${voiceText}"

Extract ONLY the information explicitly mentioned in the voice input. Do NOT guess or estimate values.

1. Product Name: If mentioned, map it to English (e.g., "Aloo" -> "Potatoes"). If NOT mentioned, use "Unknown Commodity".
2. Location: If mentioned, extract it. If NOT mentioned, return empty string "".
3. Quality Grade: If mentioned, extract it. If NOT mentioned, return empty string "".
4. Quantity: Extract the count and unit. If NOT mentioned, set count to 0 and unit to "".
5. Price: Extract the price mentioned. If specified as "market price" or NOT mentioned, set value to 0.

Additional Guidelines:
- For the symbol field, use "/icons/default.png" if commodity is unknown, otherwise "/icons/{commodity}.png"
- Set perishability based on commodity type only if commodity is known.
- Choose logistics provider only if appropriate.
- Currency is always "INR".

Generate a Beckn Protocol catalog item based ONLY on the evidence in the text.`;
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
    model: google("gemini-2.0-flash"),
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
/**
 * fallbackExtraction
 * 
 * Basic regex-based extraction when AI fails.
 * Tries to find numbers near keys like "rs", "price", "kg", "quintal".
 */
function fallbackExtraction(text: string): BecknCatalogItem {
  const lowerText = text.toLowerCase();

  // 1. Identify commodity
  let name = mapCommodityName(text) || "Unknown Commodity";
  // If not in map, try to take the first noun or just default to unknown? 
  // For safety, defaulting to Unknown is better than guessing wrong.

  // 2. Extract Price (look for "rs", "rupees", "price")
  // Regex: number followed optionally by space then rs/rupees/price OR price followed by number
  let price = 0;
  const priceMatch = lowerText.match(/(\d+)\s*(?:rs|rupees|rupaye|\/-)|(?:price|rate|kimat|bhav)\s*(?:is|of)?\s*(\d+)/);
  if (priceMatch) {
    price = parseInt(priceMatch[1] || priceMatch[2]);
  }

  // 3. Extract Quantity (look for "kg", "quintal", "ton", "kilo")
  let count = 0;
  let unit = "";
  const qtyMatch = lowerText.match(/(\d+)\s*(kg|kilo|quintal|ton|g|gram|piece|crate|box|peti)/);
  if (qtyMatch) {
    count = parseInt(qtyMatch[1]);
    unit = qtyMatch[2];
  }

  // 4. Location
  const location = extractLocation(text) || "";

  return {
    descriptor: {
      name: location ? `${location} ${name}` : name,
      symbol: "/icons/default.png"
    },
    price: {
      value: price,
      currency: "INR"
    },
    quantity: {
      available: { count },
      unit
    },
    tags: {
      grade: extractQualityGrade(text) || undefined,
      perishability: "medium",
      logistics_provider: "India Post"
    }
  };
}

export async function translateVoiceToJsonWithFallback(voiceText: string): Promise<BecknCatalogItem> {
  // Check for API key
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("[!] Google API key missing, using dynamic regex fallback");
    return validateCatalog(fallbackExtraction(voiceText));
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
        console.warn("[!] All translation attempts failed, using regex fallback");
        return validateCatalog(fallbackExtraction(voiceText));
      }

      // Exponential backoff
      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }

  return validateCatalog(fallbackExtraction(voiceText));
}
