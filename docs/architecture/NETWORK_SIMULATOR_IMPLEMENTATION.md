# ONDC Network Simulator: Production-Grade Implementation (v3.0)

## Overview

The Network Simulator (`lib/network-simulator.ts`) is a mission-critical component that mimics the behavior of the Open Network for Digital Commerce (ONDC) ecosystem. In v3.0, this component has been upgraded to provide a **production-grade simulation** indistinguishable from the real network in terms of timing, protocols, and response variability.

---

## Key Features

### 1. Production-Grade Latency Simulation
Real ONDC transactions involve multiple hops (BAP -> Gateway -> BPP and back). The simulator duplicates this latency profile:

- **Total Round Trip Time**: 12-25 seconds (randomized)
- **Phase Breakdown**:
  - **Gateway Auth**: 2-4 seconds
  - **Schema Validation**: 1-2 seconds
  - **Broadcast**: 3-5 seconds
  - **Buyer Matching**: 2-4 seconds
  - **Bid Generation**: 2-5 seconds

### 2. Failure Scenarios (Chaos Engineering)
To test system resilience, the simulator injects random failures matching real-world network statistics (5-7% total error rate):

| Error Type | Probability | Description |
|------------|-------------|-------------|
| **TIMEOUT** | 3% | Gateway/BPP failed to respond in time |
| **DENIED** | 2% | No buyers found for the commodity/location |
| **RATE_LIMITED** | 1% | Too many requests from this BAP ID |
| **NETWORK_ERROR** | 1% | General connectivity failure |

### 3. Verified Buyer Pool
The simulator uses a dataset of real ONDC network participants with authentic details:

- **Participants**: Reliance Retail, BigBasket, Amazon Fresh, Blinkit, etc.
- **Attributes**:
  - `subscriberId`: Authentic ONDC subscriber naming convention
  - `gstin`: Valid GSTIN formats
  - `operatingStates`: Geographic restrictions
  - `successRate`: Performance metrics influencing matching

### 4. Auto-Learning Pricing Engine
The simulator doesn't just return random numbers. It learns:

1. **Historical Analysis**: Loads last 1000 bids to establish baselines.
2. **Seasonal Adjustment**: Applies monthly factors (e.g., Mangoes expensive in winter, cheap in summer).
3. **Regional Variation**: Checks state-specific pricing factors.
4. **Market Competition**: Simulates multiple buyers competing, driving prices up or down.

---

## Implementation Details

### Data Structures

#### Broadcast Response
```typescript
interface BroadcastResponse {
  success: boolean;
  bid?: BuyerBid;
  error?: {
    code: number;
    message: string;
    type: 'TIMEOUT' | 'DENIED' | 'NETWORK_ERROR' | ...;
  };
  transactionId: string;    // UUIDv4
  processingTimeMs: number;
  networkPhases: NetworkPhase[]; // Audit trail
}
```

#### Buyer Profile
```typescript
interface Buyer {
  name: string;
  subscriberId: string;
  gstin: string;
  operatingStates: string[];
  avgResponseTime: number;
  successRate: number;
  // ...
}
```

### Flow Logic

1. **Validation**: Checks catalog against Beckn Protocol schemas.
2. **Phase Simulation**: `simulateNetworkPhase()` creates realistically timed delay blocks.
3. **Chaos Check**: `shouldSimulateFailure()` determines if this request should fail.
4. **Buyer Selection**: Algorithms weights buyers by `successRate` and location match.
5. **Bid Calculation**:
   - `Base Price` = Catalog Price or Estimated Market Price
   - `Learned Ratio` = Historical Average * Seasonal Factor
   - `Final Bid` = Base Price * Learned Ratio * Random Competition Factor
6. **Logging**: Full transaction log saved to `NetworkLog` table in database.

---

## Usage

### Basic Broadcast
```typescript
import { simulateBroadcastProduction } from '@/lib/network-simulator';

const response = await simulateBroadcastProduction(catalogId);
if (response.success) {
  console.log("Bid received:", response.bid);
} else {
  console.error("Broadcast failed:", response.error);
}
```

### Multiple Bids (Competition)
```typescript
import { simulateMultipleBids } from '@/lib/network-simulator';

// Get 3 competing bids
const bids = await simulateMultipleBids(catalogId, 3);
```

---

## Integration Path to Real ONDC

This simulator is designed to be a "drop-in placeholder". To switch to real ONDC:

1. Create a new `lib/ondc-client.ts`
2. Implement the `search` and `on_search` protocol callbacks.
3. Replace the `simulateBroadcastProduction` call in `app/actions.ts` with the real client.
4. The rest of the UI and database structure remains unchanged, as the simulator produces strictly compliant data structures.
