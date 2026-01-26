# Beckn Protocol Schema Validation

This module provides Zod schemas for validating Beckn Protocol catalog items as per the ONDC specification. It ensures type safety and runtime validation for all catalog data in the Setu Voice-to-ONDC Gateway application.

## Overview

The Beckn Protocol is an open protocol specification used by ONDC (Open Network for Digital Commerce) for catalog and transaction data. This module defines the schema structure for catalog items that farmers create through voice input.

## Files

- **beckn-schema.ts** - Main schema definitions and type exports
- **beckn-schema.test.ts** - Comprehensive test suite (requires Vitest)
- **beckn-schema-example.ts** - Usage examples and patterns
- **beckn-schema-verify.js** - Simple Node.js verification script

## Schemas

### BecknDescriptorSchema

Represents the product descriptor with name and image.

```typescript
{
  name: string;      // Product name (required, non-empty)
  symbol: string;    // Image URL (required, valid URL)
}
```

### BecknPriceSchema

Represents the price information.

```typescript
{
  value: number;     // Price value (required, must be positive)
  currency: string;  // ISO 4217 code (required, 3 letters, defaults to "INR")
}
```

### BecknQuantitySchema

Represents the quantity information.

```typescript
{
  available: {
    count: number;   // Available count (required, must be positive)
  };
  unit: string;      // Unit of measurement (required, e.g., "kg", "piece")
}
```

### BecknTagsSchema

Represents optional metadata tags.

```typescript
{
  grade?: string;                           // Quality grade (optional)
  perishability?: "low" | "medium" | "high"; // Perishability level (optional)
  logistics_provider?: string;              // Logistics provider name (optional)
}
```

### BecknCatalogItemSchema

Complete catalog item combining all schemas.

```typescript
{
  descriptor: BecknDescriptor;
  price: BecknPrice;
  quantity: BecknQuantity;
  tags: BecknTags;
}
```

## Usage

### Basic Validation

```typescript
import { BecknCatalogItemSchema } from './beckn-schema';

const catalog = {
  descriptor: {
    name: 'Nasik Onions',
    symbol: 'https://example.com/onion.png'
  },
  price: {
    value: 40,
    currency: 'INR'
  },
  quantity: {
    available: { count: 500 },
    unit: 'kg'
  },
  tags: {
    grade: 'A',
    perishability: 'medium',
    logistics_provider: 'India Post'
  }
};

// Throws error if validation fails
const validCatalog = BecknCatalogItemSchema.parse(catalog);
```

### Safe Parsing

```typescript
import { BecknCatalogItemSchema } from './beckn-schema';

const result = BecknCatalogItemSchema.safeParse(unknownData);

if (result.success) {
  console.log('Valid catalog:', result.data);
} else {
  console.error('Validation errors:', result.error.errors);
}
```

### Type-Safe Catalog Creation

```typescript
import { type BecknCatalogItem } from './beckn-schema';

function createCatalog(): BecknCatalogItem {
  return {
    descriptor: {
      name: 'Alphonso Mangoes',
      symbol: 'https://example.com/mango.png'
    },
    price: {
      value: 150
      // currency defaults to 'INR'
    },
    quantity: {
      available: { count: 20 },
      unit: 'crate'
    },
    tags: {
      grade: 'Premium',
      perishability: 'high'
    }
  };
}
```

### Builder Pattern

```typescript
import { BecknCatalogBuilder } from './beckn-schema-example';

const catalog = new BecknCatalogBuilder()
  .setDescriptor('Fresh Tomatoes', 'https://example.com/tomato.png')
  .setPrice(30, 'INR')
  .setQuantity(200, 'kg')
  .setGrade('B')
  .setPerishability('high')
  .setLogisticsProvider('Delhivery')
  .build();
```

## Validation Rules

### Descriptor
- `name` must be a non-empty string
- `symbol` must be a valid URL

### Price
- `value` must be a positive number (> 0)
- `currency` must be exactly 3 characters (ISO 4217 code)
- `currency` defaults to "INR" if not provided

### Quantity
- `available.count` must be a positive number (> 0)
- `unit` must be a non-empty string

### Tags
- All fields are optional
- `perishability` must be one of: "low", "medium", "high"
- `grade` and `logistics_provider` can be any string

## Error Handling

When validation fails, Zod provides detailed error messages:

```typescript
try {
  BecknCatalogItemSchema.parse(invalidData);
} catch (error) {
  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.log(`${err.path.join('.')}: ${err.message}`);
    });
  }
}
```

Example error output:
```
price.value: Price must be positive
descriptor.symbol: Symbol must be a valid URL
```

## Testing

### Run Verification Script

```bash
node lib/beckn-schema-verify.js
```

This runs a simple test suite that validates:
- Valid catalog items
- Default currency application
- Invalid price rejection
- Invalid URL rejection
- Invalid perishability rejection

### Run Unit Tests (requires Vitest)

```bash
npm test lib/beckn-schema.test.ts
```

The test suite includes:
- Individual schema validation tests
- Edge case testing (zero values, empty strings)
- Complete catalog validation
- Type export verification

## Integration with Setu

This schema module is used throughout the Setu application:

1. **Translation Agent** - Validates AI-generated catalog JSON
2. **Server Actions** - Validates catalog data before database storage
3. **Visual Verifier** - Ensures catalog data is valid before rendering
4. **Database Layer** - Validates catalog JSON stored in PostgreSQL

## Type Exports

The module exports TypeScript types inferred from Zod schemas:

```typescript
export type BecknCatalogItem = z.infer<typeof BecknCatalogItemSchema>;
export type BecknDescriptor = z.infer<typeof BecknDescriptorSchema>;
export type BecknPrice = z.infer<typeof BecknPriceSchema>;
export type BecknQuantity = z.infer<typeof BecknQuantitySchema>;
export type BecknTags = z.infer<typeof BecknTagsSchema>;
```

These types can be imported and used throughout the application for type safety.

## Examples

See `beckn-schema-example.ts` for comprehensive usage examples including:
- Creating catalog items
- Validating external data
- Builder pattern implementation
- Type guards
- Safe parsing with error details

## References

- [Beckn Protocol Specification](https://developers.becknprotocol.io/)
- [ONDC Documentation](https://ondc.org/)
- [Zod Documentation](https://zod.dev/)

## License

Part of the Setu Voice-to-ONDC Gateway project.
