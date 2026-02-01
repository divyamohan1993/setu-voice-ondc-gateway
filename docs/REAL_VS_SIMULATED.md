# Setu Voice-to-ONDC Gateway - Real vs Simulated Components

## Overview

This document clarifies which components of the Setu Voice-to-ONDC Gateway are **REAL** (production-ready) and which are **SIMULATED** (for demonstration purposes due to external requirements).

---

## ✅ REAL Components (Production Ready)

### 1. Voice Recognition
- **Technology**: Web Speech API (browser native)
- **Status**: 100% Real
- **Description**: Uses the browser's built-in speech recognition engine to convert farmer's voice to text
- **Supported Languages**: 12 Indian languages (Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati, Punjabi, Odia, Assamese, Malayalam, English)
- **No simulation**: Direct integration with device microphone

### 2. Text-to-Speech (TTS)
- **Technology**: Web Speech Synthesis API (browser native)
- **Status**: 100% Real
- **Description**: Converts AI responses to natural speech in the farmer's chosen language
- **Supported Languages**: All 12 supported Indian languages
- **No simulation**: Direct audio output to device speakers

### 3. AI Processing (Google Gemini)
- **Technology**: Google Gemini 1.5/2.0 Flash API via Vercel AI SDK
- **Status**: 100% Real (requires API key)
- **Features**:
  - Natural language understanding in Indian languages
  - Commodity recognition and translation
  - Quantity/quality extraction from voice
  - Context-aware conversation flow
  - Multi-turn dialogue management
- **API Key Required**: `GOOGLE_GENERATIVE_AI_API_KEY` in `.env`
- **Fallback**: Regex-based extraction if API key missing

### 4. Live Mandi Prices
- **Technology**: data.gov.in AGMARKNET API
- **Status**: 100% Real (with API key)
- **Description**: Fetches real-time agricultural commodity prices from government sources
- **Data Source**: 
  - Primary: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
  - Fallback: `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24`
- **Coverage**: All major mandis across India
- **API Key Required**: `DATA_GOV_IN_API_KEY` in `.env`
- **Fallback**: Historical average prices if API unavailable

### 5. Location-Based Nearest Mandi
- **Technology**: Google Maps API (Geocoding + Distance Matrix)
- **Status**: 100% Real (with API key)
- **Description**: Finds the nearest mandi from user's current GPS location
- **How it works**:
  - Gets user's location via browser geolocation API
  - Fetches list of all mandis from data.gov.in
  - Uses Google Maps Distance Matrix API to calculate road distances
  - Returns prices from the nearest mandi
- **API Key Required**: `GOOGLE_MAPS_API_KEY` in `.env`
- **Fallback**: Haversine formula (straight-line distance) if Google Maps unavailable

### 6. Database
- **Technology**: Prisma ORM with BetterSQLite3 (development) / PostgreSQL (production)
- **Status**: 100% Real
- **Features**:
  - Farmer profiles and authentication
  - Catalog storage (Beckn Protocol JSON)
  - Network logs (all broadcasts and bids)
  - Session management
- **File**: `dev.db` (SQLite for development)

### 7. Multi-language Support
- **Status**: 100% Real
- **Languages**: 12 Indian languages with full localization
- **Features**:
  - UI text in all languages
  - Voice commands in all languages
  - AI understanding in all languages
  - Response generation in all languages

### 8. Auto-Learning System
- **Status**: 100% Real
- **Features**:
  - **Price Trend Learning**: Tracks historical prices to identify market trends
  - **Bid Pattern Learning**: Learns from historical bid patterns to generate realistic simulations
  - **Commodity Learning**: Remembers commodity mappings and normalizations
- **Data Persistence**: In-memory with database backup

---

## 🔄 SIMULATED Component (Requires ONDC Registration)

### ONDC Network Broadcast (v3.0 - Production Grade)

- **File**: `lib/network-simulator.ts`
- **Status**: Simulated (Production Grade)
- **Reason**: Real ONDC network integration requires:
  1. **ONDC Registration**: Official registration at https://ondc.org
  2. **BAP/BPP Certification**: Buyer App Platform or Seller App Platform certification
  3. **Network Integration**: Complex protocol implementation
  4. **Participant Agreements**: Legal agreements with ONDC

#### Production-Grade Simulation Features:
1. **Realistic Network Latency**: 
   - **12-25 seconds** round-trip time (previously 6-10s) to match complex production flows.
   - Simulates 5 distinct phases: Gateway Auth → Validation → Broadcast → Matching → Bid Generation.

2. **Verified Buyer Pool**: 
   - 10+ major verified buyers including Reliance Retail, BigBasket, Amazon Fresh, Blinkit, etc.
   - Each buyer has valid GSTIN, Subscriber IDs, and operating state restrictions.

3. **Production Failures Simulation**:
   - **5-7% Failure Rate**: Mimics real-world network instability.
   - **Timeouts**: 3% chance of Gateway timeout.
   - **Denials**: 2% chance of "No buyers found" based on location/commodity.
   - **Rate Limiting**: 1% chance of 429 Too Many Requests.

4. **Advanced Auto-Learning**:
   - Learns from every transaction to adjust future bid ratios.
   - Includes seasonal price adjustments (e.g., higher Onion prices in monsoon).

5. **Full Transaction Tracking**: 
   - Generates UUIDv4 Transaction IDs.
   - Logs every phase of the network call for audit trails.

#### How to Enable Real ONDC:
1. Register at https://ondc.org
2. Complete sandbox testing
3. Get BAP (Buyer App Platform) or BPP (Seller App Platform) certification
4. Replace `simulateBroadcast()` with real ONDC API calls
5. Implement full Beckn Protocol flow (search, select, init, confirm)

---

## Environment Variables

```env
# REQUIRED for full functionality
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key    # Enables AI processing
DATA_GOV_IN_API_KEY=your-data-gov-key            # Enables live mandi prices
GOOGLE_MAPS_API_KEY=your-google-maps-key         # Enables location-based mandi finding

# Database
DATABASE_URL="file:./dev.db"                      # SQLite for development
# DATABASE_URL="postgresql://..."                 # PostgreSQL for production

# Application
NODE_ENV=production                               # Must be production for deployment
ONDC_SIMULATION_MODE=true                         # Toggle simulation
```

---

## Auto-Learning Features

### 1. Market Trend Learning
- **Location**: `lib/mandi-price-service.ts`
- **Function**: `determineMarketTrend()`
- **How it works**:
  - Tracks price history for each commodity
  - Compares recent prices with historical average
  - Calculates percentage change to determine trend
  - Requires 3+ data points for accurate predictions

### 2. Bid Pattern Learning
- **Location**: `lib/network-simulator.ts`
- **Function**: `getLearnedBidRatio()`, `updateLearningData()`
- **How it works**:
  - Tracks historical bid-to-price ratios
  - Adjusts future simulated bids based on patterns
  - Requires 5+ bids for learned predictions

### 3. Commodity Recognition Learning
- **Location**: `lib/translation-agent.ts`, `lib/voice-conversation-agent.ts`
- **How it works**:
  - Uses AI to learn commodity names in various languages
  - Falls back to pattern matching for known commodities
  - Expands knowledge with each successful recognition

---

## Production Deployment Checklist

- [ ] Obtain and set `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Obtain and set `DATA_GOV_IN_API_KEY`
- [ ] Obtain and set `GOOGLE_MAPS_API_KEY` (enable Geocoding and Distance Matrix APIs)
- [ ] Switch to PostgreSQL database for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL/TLS for HTTPS
- [ ] Set up proper error monitoring
- [ ] Consider ONDC registration for real network integration
- [ ] Test all 12 languages in production environment

---

## Summary Table

| Component | Status | Technology | Auto-Learning |
|-----------|--------|------------|---------------|
| Voice Recognition | ✅ Real | Web Speech API | No |
| Text-to-Speech | ✅ Real | Web Speech Synthesis | No |
| AI Processing | ✅ Real | Google Gemini | Yes |
| Mandi Prices | ✅ Real | data.gov.in API | Yes (trend) |
| Location-based Mandi | ✅ Real | Google Maps API | No |
| Database | ✅ Real | Prisma/SQLite/PostgreSQL | N/A |
| Multi-language | ✅ Real | Built-in | N/A |
| ONDC Network | 🔄 Simulated | Production Simulator v3.0 | Yes (bids) |
