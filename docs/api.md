# API Documentation - Setu Voice-to-ONDC Gateway

Setu's backend logic is exposed via **Next.js Server Actions**. This document provides detailed information on all available actions, their parameters, and return types.

## Table of Contents
- [Voice Processing](#voice-processing)
- [Voice Translation](#voice-translation)
- [Catalog Management](#catalog-management)
- [Broadcast Operations](#broadcast-operations)
- [Network Monitoring](#network-monitoring)

---

## Voice Processing

### `processVoiceAction`
The core conversational agent handler. Manages state, understands intent, and drives the conversation.

**Parameters:**
- `currentState: ConversationState` - The current context of conversation
- `userAudioTranscription: string` - Text input from user

**Returns:** `Promise<ConversationResult>`
```typescript
interface ConversationResult {
  success: boolean;
  response: VoiceResponse;   // Text to speak back + language
  newState: ConversationState; // Updated context
  error?: string;
}
```

---

## Voice Translation

### `translateVoiceAction`
Converts vernacular voice commands into structured Beckn Protocol JSON using Google Gemini AI.

**Parameters:**
- `voiceText: string` - The raw text received from voice input (Hindi / Hinglish).

**Returns:** `Promise<TranslateVoiceResult>`
```typescript
interface TranslateVoiceResult {
  success: boolean;
  catalog?: BecknCatalogItem;
  error?: string;
}
```

**Workflow:**
1. Validates input text.
2. Uses Google Gemini to extract commodity, quantity, price.
3. Maps commodity names to standard codes (e.g., "Kanda" -> "Onion").
4. Returns a valid `BecknCatalogItem` if successful.

---

## Catalog Management

### `saveCatalogAction`
Persists a generated catalog to the database.

**Parameters:**
- `farmerId: string` - Unique identifier of the farmer.
- `catalog: BecknCatalogItem` - The JSON catalog object.

**Returns:** `Promise<SaveCatalogResult>`
```typescript
interface SaveCatalogResult {
  success: boolean;
  catalogId?: string;
  error?: string;
}
```

### `getCatalogAction`
Retrieves a specific catalog by its ID.

**Parameters:**
- `catalogId: string` - The ID assigned during creation.

**Returns:** `Promise<GetCatalogResult>`

---

## Broadcast Operations

### `broadcastFromVoiceAction`
Orchestrates the complete broadcast flow from a voice conversation.

**Parameters:**
- `catalogItem: BecknCatalogItem` - The validated catalog.
- `language: LanguageConfig` - User's language for success message generation.

**Returns:** `Promise<VoiceBroadcastResult>`
```typescript
interface VoiceBroadcastResult {
  // Status
  success: boolean;
  error?: string;
  errorType?: 'TIMEOUT' | 'DENIED' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMITED';
  
  // Data
  catalogId?: string;
  bid?: BuyerBid;
  successMessage?: string;
  
  // ONDC Metadata
  transactionId?: string;    // UUIDv4 (Production)
  processingTimeMs?: number; // Total network time
}
```

**Workflow:**
1. Validates catalog schema (Beckn v1.2).
2. Saves catalog to database (`status: DRAFT`).
3. Updates status to `BROADCASTED`.
4. Logs `OUTGOING_CATALOG` event.
5. Calls ONDC Network Simulator (v3.0 Production Grade).
6. Returns `BuyerBid` or typed error.

---

## Network Monitoring

### `getNetworkLogsAction`
Fetches transaction logs for display in the Debug Console or Network Viewer.

**Parameters:**
- `filter?: string` - Type filter (`ALL`, `OUTGOING_CATALOG`, `INCOMING_BID`).
- `page: number` - Current page (default: 1).
- `pageSize: number` - Logs per page (default: 10).

**Returns:** `Promise<GetNetworkLogsResult>`
```typescript
interface GetNetworkLogsResult {
  success: boolean;
  logs?: NetworkLog[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}
```

---

## Data Models

### `BecknCatalogItem`
Defined in `lib/beckn-schema.ts`.
- `descriptor`: Name and symbol (image URL).
- `price`: Value and currency (defaults to INR).
- `quantity`: Available count and measurement unit.
- `tags`: Metadata (grade, perishability).

---

*Last Updated: February 2026*
*Version: 1.0.0*
