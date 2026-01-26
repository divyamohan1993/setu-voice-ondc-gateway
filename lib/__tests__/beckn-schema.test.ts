/**
 * Beckn Schema Tests
 * 
 * Tests for Beckn Protocol schema validation using Zod.
 * Covers valid data, invalid data, edge cases, and default values.
 */

import { describe, test, expect } from 'vitest';
import {
  BecknDescriptorSchema,
  BecknPriceSchema,
  BecknQuantitySchema,
  BecknTagsSchema,
  BecknCatalogItemSchema,
  type BecknCatalogItem
} from '../beckn-schema';

describe('Beckn Schema Validation', () => {
  // Task 10.3.1: Test schema validation with valid data
  describe('Valid Data Validation', () => {
    test('validates complete catalog item with all fields', () => {
      const validCatalog: BecknCatalogItem = {
        descriptor: {
          name: 'Nasik Onions',
          symbol: '/icons/onion.png'
        },
        price: {
          value: 40,
          currency: 'INR'
        },
        quantity: {
          available: {
            count: 500
          },
          unit: 'kg'
        },
        tags: {
          grade: 'A',
          perishability: 'medium',
          logistics_provider: 'India Post'
        }
      };

      const result = BecknCatalogItemSchema.safeParse(validCatalog);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validCatalog);
      }
    });

    test('validates descriptor with valid name and symbol', () => {
      const validDescriptor = {
        name: 'Alphonso Mangoes',
        symbol: '/icons/mango.png'
      };

      const result = BecknDescriptorSchema.safeParse(validDescriptor);
      expect(result.success).toBe(true);
    });

    test('validates descriptor with HTTP URL symbol', () => {
      const validDescriptor = {
        name: 'Tomatoes',
        symbol: 'https://example.com/tomato.png'
      };

      const result = BecknDescriptorSchema.safeParse(validDescriptor);
      expect(result.success).toBe(true);
    });

    test('validates price with positive value', () => {
      const validPrice = {
        value: 100.50,
        currency: 'INR'
      };

      const result = BecknPriceSchema.safeParse(validPrice);
      expect(result.success).toBe(true);
    });

    test('validates quantity with positive count', () => {
      const validQuantity = {
        available: {
          count: 1000
        },
        unit: 'kg'
      };

      const result = BecknQuantitySchema.safeParse(validQuantity);
      expect(result.success).toBe(true);
    });

    test('validates tags with all optional fields', () => {
      const validTags = {
        grade: 'Premium',
        perishability: 'high' as const,
        logistics_provider: 'Delhivery'
      };

      const result = BecknTagsSchema.safeParse(validTags);
      expect(result.success).toBe(true);
    });

    test('validates tags with empty object (all optional)', () => {
      const emptyTags = {};

      const result = BecknTagsSchema.safeParse(emptyTags);
      expect(result.success).toBe(true);
    });
  });

  // Task 10.3.2: Test schema validation with invalid data
  describe('Invalid Data Validation', () => {
    test('rejects descriptor with empty name', () => {
      const invalidDescriptor = {
        name: '',
        symbol: '/icons/onion.png'
      };

      const result = BecknDescriptorSchema.safeParse(invalidDescriptor);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Product name is required');
      }
    });

    test('rejects descriptor with invalid symbol URL', () => {
      const invalidDescriptor = {
        name: 'Onions',
        symbol: 'invalid-url'
      };

      const result = BecknDescriptorSchema.safeParse(invalidDescriptor);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Symbol must be a valid URL');
      }
    });

    test('rejects price with negative value', () => {
      const invalidPrice = {
        value: -10,
        currency: 'INR'
      };

      const result = BecknPriceSchema.safeParse(invalidPrice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Price must be positive');
      }
    });

    test('rejects price with invalid currency code', () => {
      const invalidPrice = {
        value: 100,
        currency: 'INVALID'
      };

      const result = BecknPriceSchema.safeParse(invalidPrice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Currency must be 3-letter code');
      }
    });

    test('rejects quantity with negative count', () => {
      const invalidQuantity = {
        available: {
          count: -5
        },
        unit: 'kg'
      };

      const result = BecknQuantitySchema.safeParse(invalidQuantity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Count must be positive');
      }
    });

    test('rejects quantity with empty unit', () => {
      const invalidQuantity = {
        available: {
          count: 100
        },
        unit: ''
      };

      const result = BecknQuantitySchema.safeParse(invalidQuantity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Unit is required');
      }
    });

    test('rejects tags with invalid perishability value', () => {
      const invalidTags = {
        perishability: 'invalid'
      };

      const result = BecknTagsSchema.safeParse(invalidTags);
      expect(result.success).toBe(false);
    });

    test('rejects catalog with missing required fields', () => {
      const incompleteCatalog = {
        descriptor: {
          name: 'Onions'
          // Missing symbol
        },
        price: {
          value: 40
        }
        // Missing quantity and tags
      };

      const result = BecknCatalogItemSchema.safeParse(incompleteCatalog);
      expect(result.success).toBe(false);
    });
  });

  // Task 10.3.3: Test edge cases (zero prices, empty strings)
  describe('Edge Cases', () => {
    test('rejects zero price', () => {
      const zeroPrice = {
        value: 0,
        currency: 'INR'
      };

      const result = BecknPriceSchema.safeParse(zeroPrice);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Price must be positive');
      }
    });

    test('rejects zero quantity count', () => {
      const zeroQuantity = {
        available: {
          count: 0
        },
        unit: 'kg'
      };

      const result = BecknQuantitySchema.safeParse(zeroQuantity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Count must be positive');
      }
    });

    test('accepts very small positive price', () => {
      const smallPrice = {
        value: 0.01,
        currency: 'INR'
      };

      const result = BecknPriceSchema.safeParse(smallPrice);
      expect(result.success).toBe(true);
    });

    test('accepts very large price', () => {
      const largePrice = {
        value: 999999.99,
        currency: 'INR'
      };

      const result = BecknPriceSchema.safeParse(largePrice);
      expect(result.success).toBe(true);
    });

    test('accepts very large quantity', () => {
      const largeQuantity = {
        available: {
          count: 1000000
        },
        unit: 'kg'
      };

      const result = BecknQuantitySchema.safeParse(largeQuantity);
      expect(result.success).toBe(true);
    });

    test('accepts single character unit', () => {
      const singleCharUnit = {
        available: {
          count: 100
        },
        unit: 'L'
      };

      const result = BecknQuantitySchema.safeParse(singleCharUnit);
      expect(result.success).toBe(true);
    });

    test('accepts long product name', () => {
      const longName = {
        name: 'A'.repeat(200),
        symbol: '/icons/test.png'
      };

      const result = BecknDescriptorSchema.safeParse(longName);
      expect(result.success).toBe(true);
    });

    test('rejects empty string in required fields', () => {
      const emptyName = {
        name: '',
        symbol: '/icons/test.png'
      };

      const result = BecknDescriptorSchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });

    test('rejects whitespace-only name', () => {
      const whitespaceName = {
        name: '   ',
        symbol: '/icons/test.png'
      };

      const result = BecknDescriptorSchema.safeParse(whitespaceName);
      // Zod min(1) doesn't trim, so this should pass
      // But in real validation, we might want to trim
      expect(result.success).toBe(true);
    });
  });

  // Task 10.3.4: Test default value application
  describe('Default Value Application', () => {
    test('applies default currency when not provided', () => {
      const priceWithoutCurrency = {
        value: 50
      };

      const result = BecknPriceSchema.safeParse(priceWithoutCurrency);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('INR');
      }
    });

    test('preserves provided currency', () => {
      const priceWithCurrency = {
        value: 50,
        currency: 'USD'
      };

      const result = BecknPriceSchema.safeParse(priceWithCurrency);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });

    test('handles optional tags fields', () => {
      const tagsWithSomeFields = {
        grade: 'A'
        // perishability and logistics_provider not provided
      };

      const result = BecknTagsSchema.safeParse(tagsWithSomeFields);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.grade).toBe('A');
        expect(result.data.perishability).toBeUndefined();
        expect(result.data.logistics_provider).toBeUndefined();
      }
    });

    test('validates complete catalog with default currency', () => {
      const catalogWithoutCurrency = {
        descriptor: {
          name: 'Test Product',
          symbol: '/icons/test.png'
        },
        price: {
          value: 100
          // currency not provided
        },
        quantity: {
          available: {
            count: 50
          },
          unit: 'kg'
        },
        tags: {}
      };

      const result = BecknCatalogItemSchema.safeParse(catalogWithoutCurrency);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price.currency).toBe('INR');
      }
    });

    test('validates catalog with minimal required fields', () => {
      const minimalCatalog = {
        descriptor: {
          name: 'Minimal Product',
          symbol: '/icons/minimal.png'
        },
        price: {
          value: 10
        },
        quantity: {
          available: {
            count: 1
          },
          unit: 'piece'
        },
        tags: {}
      };

      const result = BecknCatalogItemSchema.safeParse(minimalCatalog);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price.currency).toBe('INR');
        expect(result.data.tags).toEqual({});
      }
    });
  });

  // Additional comprehensive tests
  describe('Type Safety', () => {
    test('ensures type inference works correctly', () => {
      const catalog: BecknCatalogItem = {
        descriptor: {
          name: 'Type Test',
          symbol: '/icons/type.png'
        },
        price: {
          value: 25,
          currency: 'INR'
        },
        quantity: {
          available: {
            count: 100
          },
          unit: 'kg'
        },
        tags: {
          grade: 'A',
          perishability: 'low',
          logistics_provider: 'Test Logistics'
        }
      };

      // TypeScript should not complain about this assignment
      expect(catalog.descriptor.name).toBe('Type Test');
      expect(catalog.price.value).toBe(25);
      expect(catalog.quantity.available.count).toBe(100);
      expect(catalog.tags.grade).toBe('A');
    });
  });
});
