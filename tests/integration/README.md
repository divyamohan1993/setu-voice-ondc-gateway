# Integration Tests - Live API Testing

## Overview

This directory contains comprehensive integration tests that use **REAL API calls** instead of mocks. These tests verify that all production APIs work correctly and ensure proper frontend-backend communication.

## Test Files

| File | Description | APIs Tested |
|------|-------------|-------------|
| `live-api.test.ts` | Environment configuration verification | API keys, configuration |
| `mandi-price-service.test.ts` | Live mandi price fetching | data.gov.in AGMARKNET API |
| `location-service.test.ts` | Location-based mandi finding | Google Maps API, data.gov.in |
| `translation-service.test.ts` | AI voice translation | Google Gemini 2.0 Flash |
| `voice-conversation.test.ts` | Multi-turn voice conversations | Google Gemini 2.0 Flash |
| `network-simulator.test.ts` | ONDC simulation & auto-learning | Database, simulation engine |
| `server-actions.test.ts` | End-to-end server actions | All APIs combined |

## Running Tests

### Prerequisites

Ensure the following environment variables are set in `.env`:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
DATA_GOV_IN_API_KEY=your-data-gov-key
GOOGLE_MAPS_API_KEY=your-google-maps-key  # Optional
```

Run database generation:
```bash
npx prisma generate
```

### Run All Integration Tests

```bash
npm run test:integration
```

### Run with Watch Mode

```bash
npm run test:integration:watch
```

### Run All Tests (Unit + Integration)

```bash
npm run test:all
```

## Test Categories

### 1. Mandi Price Service Tests
- Fetches live prices for 5 commodities (onion, tomato, potato, wheat, rice)
- Tests state-based filtering (Maharashtra, Karnataka, etc.)
- Verifies price suggestion accuracy
- Tests location-based pricing with GPS coordinates
- Performance testing (response time, concurrent requests)

### 2. Location Service Tests
- Fetches mandi list from government API
- Tests nearest mandi calculation for 5 major cities
- Verifies distance sorting accuracy
- Tests commodity-specific mandi finding
- Edge cases (remote locations, border areas)

### 3. Translation Service Tests
- Hindi input translation
- English input translation
- Regional language translation (Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati)
- Quality/grade extraction
- Market quote requests
- Quantity accuracy verification

### 4. Voice Conversation Tests
- 12 language support verification
- Complete conversation flow (Hindi, English)
- Regional language processing
- State management across turns
- Response localization
- Error handling

### 5. Network Simulator Tests
- Buyer pool verification
- Broadcast simulation with realistic delays
- Database logging
- Auto-learning system
- Bid calculation accuracy
- Catalog validation

### 6. Server Actions Tests
- startConversationAction for all languages
- processVoiceAction with AI
- getLivePricesAction with real data
- translateVoiceAction with Gemini
- saveCatalogAction with database
- broadcastCatalogAction with simulation
- getNetworkLogsAction retrieval
- Complete end-to-end flow

## Important Notes

### API Rate Limits
- Tests run sequentially to avoid rate limiting
- Each test has a 60-second timeout for slow API responses
- Connection retries are built-in

### Real Data
- All tests use REAL external APIs
- Prices shown are actual current market prices
- AI responses are generated live by Gemini

### Database
- Tests create and cleanup their own data
- Uses the same database as the application
- Network logs are preserved for analysis

### Timeouts
- Default: 60 seconds per test
- AI tests: 60 seconds (Gemini can be slow)
- Network simulation: 30 seconds (includes 6-10s delay)

## Test Output

Tests produce detailed console output showing:
- ✅ API responses and data
- 📡 Network calls and responses
- ⏱️ Performance metrics
- 🔧 Error handling verification

Example output:
```
🗣️ Testing Hindi conversation flow
   Stage 1: Greeting
   Stage 2: Commodity input
      Response stage: asking_price_preference
      Commodity detected: onion
      Quantity: 100
   ✅ Flow completed successfully
```

## Troubleshooting

### "API key not configured"
Ensure all required API keys are set in `.env`:
```bash
cat .env | grep -E "(GOOGLE_|DATA_)"
```

### "Timeout exceeded"
Increase timeout in `vitest.integration.config.ts`:
```ts
testTimeout: 120000, // 2 minutes
```

### "Database connection failed"
Ensure database is initialized:
```bash
npm run prisma:push
npm run prisma:seed
```

### "Rate limit exceeded"
Wait a few minutes and try again. Tests run sequentially to minimize this.

## Coverage

Integration tests cover:
- ✅ All production API endpoints
- ✅ All 12 Indian languages
- ✅ Error handling and fallbacks
- ✅ Performance requirements
- ✅ Database operations
- ✅ End-to-end flows

## Adding New Tests

1. Create test file in `tests/integration/`
2. Use live API calls (no mocks)
3. Add appropriate timeouts
4. Include console.log for visibility
5. Clean up test data in afterAll()

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { config } from 'dotenv';

config();

describe('My Integration Test', () => {
    it('should call real API', async () => {
        // Real API call here
        const result = await callRealAPI();
        expect(result).toBeDefined();
    }, 60000);
});
```
