# API Documentation - Setu Voice-to-ONDC Gateway

Setu's backend logic is exposed via **Next.js Server Actions**. This document provides detailed information on all available actions, their parameters, and return types.

## Table of Contents
- [Voice Translation](#voice-translation)
- [Catalog Management](#catalog-management)
- [Broadcast Operations](#broadcast-operations)
- [Network Monitoring](#network-monitoring)

---

## Voice Translation

### `translateVoiceAction`
Converts vernacular voice commands into structured Beckn Protocol JSON using AI.

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
1. Validates input text (minimum 10 characters).
2. Forwards request to `translateVoiceToJsonWithFallback`.
3. Returns a valid `BecknCatalogItem` if successful.

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

### `broadcastCatalogAction`
Publishes a catalog to the simulated ONDC/Beckn network.

**Parameters:**
- `catalogId: string` - ID of the catalog to broadcast.

**Returns:** `Promise<BroadcastCatalogResult>`
```typescript
interface BroadcastCatalogResult {
  success: boolean;
  bid?: BuyerBid;
  error?: string;
}
```

**Workflow:**
1. Updates catalog status to `BROADCASTED`.
2. Creates an `OUTGOING_CATALOG` entry in the Network Logs.
3. Triggers the `Network Simulator`.
4. Returns a simulated `BuyerBid` (e.g., from a buyer like Reliance Fresh).

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

*Last Updated: January 2026*
