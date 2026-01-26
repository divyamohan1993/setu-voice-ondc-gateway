# Network Simulator Module

## Overview

The Network Simulator module simulates buyer network responses to broadcasted catalogs in the Setu Voice-to-ONDC Gateway application. It demonstrates how the ONDC network would respond to farmer listings by generating mock buyer bids after a realistic delay.

## Features

- **8-Second Delay**: Simulates realistic network latency for ONDC broadcast and response
- **Random Buyer Selection**: Randomly selects from a pool of realistic Indian buyer platforms
- **Dynamic Bid Calculation**: Generates bid amounts within 5-10% of the catalog price
- **Database Logging**: Logs all network interactions to the NetworkLog table
- **Type-Safe**: Fully typed with TypeScript for compile-time safety

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    simulateBroadcast()                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Wait 8 seconds (simulate network latency)              │
│  2. Fetch catalog from database                            │
│  3. Select random buyer from pool                          │
│  4. Calculate bid amount (price ± 5-10%)                   │
│  5. Log INCOMING_BID to NetworkLog                         │
│  6. Return BuyerBid object                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API Reference

### `simulateBroadcast(catalogId: string): Promise<BuyerBid>`

Simulates a broadcast to the buyer network and generates a mock bid response.

**Parameters:**
- `catalogId` (string): The ID of the catalog being broadcasted

**Returns:**
- `Promise<BuyerBid>`: The generated buyer bid

**Throws:**
- `Error`: If catalog is not found or has invalid price

**Example:**
```typescript
import { simulateBroadcast } from './lib/network-simulator';

const bid = await simulateBroadcast('clx123abc');
console.log(`${bid.buyerName} bid ₹${bid.bidAmount}`);
// Output: "BigBasket bid ₹98.50"
```

### `getBuyerPool(): Buyer[]`

Gets the buyer pool for testing or display purposes.

**Returns:**
- `Buyer[]`: Array of all available buyers

**Example:**
```typescript
import { getBuyerPool } from './lib/network-simulator';

const buyers = getBuyerPool();
buyers.forEach(buyer => {
  console.log(`${buyer.name} - ${buyer.logo}`);
});
```

### `validateCatalogForBroadcast(catalog: any): boolean`

Validates that a catalog has the required structure for broadcasting.

**Parameters:**
- `catalog` (any): The catalog object to validate

**Returns:**
- `boolean`: True if catalog is valid for broadcasting

**Example:**
```typescript
import { validateCatalogForBroadcast } from './lib/network-simulator';

const catalog = {
  becknJson: {
    descriptor: { name: 'Onions' },
    price: { value: 100, currency: 'INR' }
  }
};

if (validateCatalogForBroadcast(catalog)) {
  console.log('Catalog is valid for broadcast');
}
```

## Types

### `Buyer`

```typescript
interface Buyer {
  name: string;    // Buyer platform name
  logo: string;    // Path to buyer logo image
}
```

### `BuyerBid`

```typescript
interface BuyerBid {
  buyerName: string;   // Name of the buyer platform
  bidAmount: number;   // Bid amount in INR
  timestamp: Date;     // When the bid was generated
  buyerLogo: string;   // Path to buyer logo image
}
```

## Buyer Pool

The simulator includes the following realistic buyer platforms:

| Buyer Name        | Logo Path                |
|-------------------|--------------------------|
| Reliance Fresh    | /logos/reliance.png      |
| BigBasket         | /logos/bigbasket.png     |
| Paytm Mall        | /logos/paytm.png         |
| Flipkart Grocery  | /logos/flipkart.png      |

## Bid Calculation Algorithm

The bid amount is calculated using the following formula:

```
bidAmount = catalogPrice × (0.95 + random(0, 0.10))
```

This ensures:
- Minimum bid: 95% of catalog price
- Maximum bid: 105% of catalog price
- Realistic market negotiation simulation

**Example:**
- Catalog Price: ₹100
- Possible Bids: ₹95.00 to ₹105.00

## Database Schema

The simulator interacts with two database tables:

### Catalog Table
```prisma
model Catalog {
  id          String        @id @default(cuid())
  farmerId    String
  becknJson   Json          // Contains price.value
  status      CatalogStatus
  createdAt   DateTime
  updatedAt   DateTime
}
```

### NetworkLog Table
```prisma
model NetworkLog {
  id        String         @id @default(cuid())
  type      NetworkLogType // "INCOMING_BID"
  payload   Json           // Contains bid details
  timestamp DateTime
}
```

## Usage in Server Actions

The network simulator is typically called from a Server Action after a catalog is broadcasted:

```typescript
// app/actions.ts
'use server';

import { simulateBroadcast } from '@/lib/network-simulator';
import { prisma } from '@/lib/db';

export async function broadcastCatalogAction(catalogId: string) {
  try {
    // Update catalog status to BROADCASTED
    await prisma.catalog.update({
      where: { id: catalogId },
      data: { status: 'BROADCASTED' }
    });
    
    // Log outgoing catalog
    await prisma.networkLog.create({
      data: {
        type: 'OUTGOING_CATALOG',
        payload: { catalogId },
        timestamp: new Date()
      }
    });
    
    // Simulate network response (waits 8 seconds)
    const bid = await simulateBroadcast(catalogId);
    
    return { success: true, bid };
  } catch (error) {
    console.error('Broadcast failed:', error);
    return { success: false, error: 'Failed to broadcast catalog' };
  }
}
```

## Error Handling

The simulator handles the following error cases:

1. **Catalog Not Found**
   ```typescript
   throw new Error(`Catalog with ID ${catalogId} not found`);
   ```

2. **Invalid Price**
   ```typescript
   throw new Error('Invalid catalog price');
   ```

3. **Database Connection Errors**
   - Handled by Prisma client
   - Errors propagate to calling function

## Testing

### Unit Tests

Run unit tests with:
```bash
npm test lib/__tests__/network-simulator.test.ts
```

### Manual Testing

Run the manual test script:
```bash
npx tsx lib/__tests__/network-simulator-manual-test.ts
```

### Integration Testing

Test with a real database:
```typescript
import { simulateBroadcast } from './lib/network-simulator';

// Ensure database is running and seeded
const bid = await simulateBroadcast('existing-catalog-id');
console.log(bid);
```

## Performance Considerations

- **8-Second Delay**: The intentional delay simulates realistic network latency. This is not a performance issue but a feature.
- **Database Queries**: Uses Prisma's optimized query engine
- **Random Selection**: O(1) time complexity using array indexing
- **Logging**: Asynchronous database write, doesn't block response

## Future Enhancements

Potential improvements for production use:

1. **Configurable Delay**: Make the 8-second delay configurable
2. **Multiple Bids**: Generate multiple competing bids
3. **Buyer Preferences**: Weight buyer selection based on product type
4. **Real-Time Updates**: Use WebSockets for live bid notifications
5. **Bid History**: Track bid history per catalog
6. **Buyer Profiles**: Add more detailed buyer information

## Related Modules

- `lib/db.ts`: Database connection and utilities
- `lib/beckn-schema.ts`: Beckn Protocol schema definitions
- `app/actions.ts`: Server Actions that use the simulator

## License

Part of the Setu Voice-to-ONDC Gateway project.
