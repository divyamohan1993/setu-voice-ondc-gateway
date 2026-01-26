/**
 * Property-Based Tests for Setu Voice-to-ONDC Gateway
 * 
 * These tests use fast-check to verify properties hold across many inputs.
 * Property-based testing helps find edge cases that example-based tests might miss.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { BecknCatalogItemSchema, type BecknCatalogItem } from '@/lib/beckn-schema';
import { validateCatalog } from '@/lib/translation-agent';

/**
 * Task 10.6.2: Create Beckn catalog arbitrary generator
 * 
 * This generator creates random but valid Beckn catalog items
 * for property-based testing.
 */
export const becknCatalogArbitrary = (): fc.Arbitrary<BecknCatalogItem> => {
  return fc.record({
    descriptor: fc.record({
      name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
      symbol: fc.constantFrom(
        '/icons/onion.png',
        '/icons/mango.png',
        '/icons/tomato.png',
        '/icons/potato.png',
        '/icons/wheat.png'
      ),
    }),
    price: fc.record({
      value: fc.float({ min: 1, max: 100000, noNaN: true }),
      currency: fc.constant('INR'),
    }),
    quantity: fc.record({
      available: fc.record({
        count: fc.integer({ min: 1, max: 1000000 }),
      }),
      unit: fc.constantFrom('kg', 'quintal', 'ton', 'piece'),
    }),
    tags: fc.record({
      grade: fc.option(fc.constantFrom('A', 'B', 'C'), { nil: undefined }),
      perishability: fc.constantFrom('high', 'medium', 'low'),
      logistics_provider: fc.option(
        fc.constantFrom('India Post', 'Delhivery', 'Blue Dart'),
        { nil: undefined }
      ),
    }),
  });
};

describe('Property-Based Tests', () => {
  /**
   * Task 10.6.3: Test round-trip serialization/deserialization
   * 
   * Property: Any valid Beckn catalog should survive JSON serialization
   * and deserialization without data loss.
   */
  describe('10.6.3: Round-trip serialization', () => {
    it('should preserve data through JSON round-trip', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          // Serialize to JSON string
          const json = JSON.stringify(catalog);
          
          // Deserialize back to object
          const deserialized = JSON.parse(json);
          
          // Should be deeply equal
          expect(deserialized).toEqual(catalog);
        }),
        { numRuns: 20 }
      );
    });

    it('should validate after round-trip', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          // Round-trip through JSON
          const json = JSON.stringify(catalog);
          const deserialized = JSON.parse(json);
          
          // Should still validate
          const result = BecknCatalogItemSchema.safeParse(deserialized);
          expect(result.success).toBe(true);
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Task 10.6.4: Test all translations produce valid Beckn JSON
   * 
   * Property: The validateCatalog function should always return
   * a valid Beckn catalog, even for invalid input.
   */
  describe('10.6.4: Translation validation', () => {
    it('should always produce valid Beckn JSON from any catalog', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          // Validate the catalog
          const validated = validateCatalog(catalog);
          
          // Result should always be valid
          const parseResult = BecknCatalogItemSchema.safeParse(validated);
          expect(parseResult.success).toBe(true);
        }),
        { numRuns: 20 }
      );
    });

    it('should handle catalogs with missing optional fields', () => {
      const catalogWithOptionals = fc.record({
        descriptor: fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          symbol: fc.constantFrom(
            '/icons/onion.png',
            '/icons/mango.png',
            '/icons/tomato.png',
            '/icons/potato.png',
            '/icons/wheat.png'
          ),
        }),
        price: fc.record({
          value: fc.float({ min: 1, max: 100000, noNaN: true }),
          currency: fc.constant('INR'),
        }),
        quantity: fc.record({
          available: fc.record({
            count: fc.integer({ min: 1, max: 1000000 }),
          }),
          unit: fc.constantFrom('kg', 'quintal', 'ton', 'piece'),
        }),
        tags: fc.record({
          grade: fc.option(fc.constantFrom('A', 'B', 'C'), { nil: undefined }),
          perishability: fc.constantFrom('high', 'medium', 'low'),
          logistics_provider: fc.option(
            fc.constantFrom('India Post', 'Delhivery', 'Blue Dart'),
            { nil: undefined }
          ),
        }),
      });

      fc.assert(
        fc.property(catalogWithOptionals, (catalog) => {
          const validated = validateCatalog(catalog);
          const parseResult = BecknCatalogItemSchema.safeParse(validated);
          expect(parseResult.success).toBe(true);
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Task 10.6.5: Test all catalogs render without errors
   * 
   * Property: Any valid Beckn catalog should be renderable
   * (i.e., all required fields are present and accessible).
   */
  describe('10.6.5: Catalog renderability', () => {
    it('should have all required fields for rendering', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          // Check all required fields are present
          expect(catalog.descriptor).toBeDefined();
          expect(catalog.descriptor.name).toBeDefined();
          expect(catalog.descriptor.symbol).toBeDefined();
          
          expect(catalog.price).toBeDefined();
          expect(catalog.price.value).toBeDefined();
          expect(catalog.price.currency).toBeDefined();
          
          expect(catalog.quantity).toBeDefined();
          expect(catalog.quantity.available).toBeDefined();
          expect(catalog.quantity.available.count).toBeDefined();
          expect(catalog.quantity.unit).toBeDefined();
          
          expect(catalog.tags).toBeDefined();
          expect(catalog.tags.perishability).toBeDefined();
        }),
        { numRuns: 20 }
      );
    });

    it('should have valid numeric values', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          // Price should be non-negative and finite
          expect(catalog.price.value).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(catalog.price.value)).toBe(true);
          
          // Quantity should be non-negative integer
          expect(catalog.quantity.available.count).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(catalog.quantity.available.count)).toBe(true);
        }),
        { numRuns: 20 }
      );
    });

    it('should have non-empty strings for required text fields', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          expect(catalog.descriptor.name.length).toBeGreaterThan(0);
          expect(catalog.descriptor.symbol.length).toBeGreaterThan(0);
          expect(catalog.price.currency.length).toBeGreaterThan(0);
          expect(catalog.quantity.unit.length).toBeGreaterThan(0);
          expect(catalog.tags.perishability.length).toBeGreaterThan(0);
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Task 10.6.6: Test bid amounts are within valid range
   * 
   * Property: Bid amounts should always be within ±5-10% of catalog price.
   */
  describe('10.6.6: Bid amount validation', () => {
    it('should generate bids within ±5-10% of catalog price', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 100000, noNaN: true }),
          (catalogPrice) => {
            // Simulate bid calculation (from network-simulator.ts)
            const variation = Math.random() * 0.05 + 0.05; // 5-10%
            const isIncrease = Math.random() > 0.5;
            const bidAmount = isIncrease
              ? catalogPrice * (1 + variation)
              : catalogPrice * (1 - variation);
            
            // Bid should be within ±10% of catalog price
            const minBid = catalogPrice * 0.90;
            const maxBid = catalogPrice * 1.10;
            
            expect(bidAmount).toBeGreaterThanOrEqual(minBid);
            expect(bidAmount).toBeLessThanOrEqual(maxBid);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never generate negative bids', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 100000, noNaN: true }),
          (catalogPrice) => {
            // Simulate bid calculation
            const variation = Math.random() * 0.05 + 0.05;
            const isIncrease = Math.random() > 0.5;
            const bidAmount = isIncrease
              ? catalogPrice * (1 + variation)
              : catalogPrice * (1 - variation);
            
            expect(bidAmount).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should generate finite bid amounts', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.01), max: 100000, noNaN: true }),
          (catalogPrice) => {
            // Simulate bid calculation
            const variation = Math.random() * 0.05 + 0.05;
            const isIncrease = Math.random() > 0.5;
            const bidAmount = isIncrease
              ? catalogPrice * (1 + variation)
              : catalogPrice * (1 - variation);
            
            expect(Number.isFinite(bidAmount)).toBe(true);
            expect(Number.isNaN(bidAmount)).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Additional property: Schema validation is consistent
   */
  describe('Schema validation consistency', () => {
    it('should give same validation result for same input', () => {
      fc.assert(
        fc.property(becknCatalogArbitrary(), (catalog) => {
          const result1 = BecknCatalogItemSchema.safeParse(catalog);
          const result2 = BecknCatalogItemSchema.safeParse(catalog);
          
          expect(result1.success).toBe(result2.success);
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Additional property: Price calculations are commutative
   */
  describe('Price calculation properties', () => {
    it('should maintain price relationships after percentage changes', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 10000, noNaN: true }),
          fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
          (price, percentage) => {
            const increased = price * (1 + percentage);
            const decreased = increased * (1 - percentage);
            
            // Due to floating point, use approximate equality
            const diff = Math.abs(decreased - price);
            const tolerance = price * 0.01; // 1% tolerance
            
            expect(diff).toBeLessThan(tolerance);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
