/**
 * Beckn Schema Tests
 * Phase 10.3: Beckn Schema Tests
 * 
 * Tests for Beckn Protocol schema validation using Zod.
 */

import { describe, it, expect } from 'vitest';
import {
  BecknCatalogItemSchema,
  BecknDescriptorSchema,
  BecknPriceSchema,
  BecknQuantitySchema,
  BecknTagsSchema
} from './beckn-schema';
import {
  SAMPLE_ONION_CATALOG,
  SAMPLE_MANGO_CATALOG,
  SAMPLE_TOMATO_CATALOG,
  INVALID_CATALOG_MISSING_FIELDS,
  INVALID_CATALOG_WRONG_TYPES
} from '@/tests/fixtures/beckn-catalog';

describe('Beckn Schema Validation', () => {
  describe('10.3.1: Schema validation with valid data', () => {
    it('should validate onion catalog successfully', () => {
      const result = BecknCatalogItemSchema.safeParse(SAMPLE_ONION_CATALOG);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.descriptor.name).toBe('Nasik Onions');
        expect(result.data.price.value).toBe(40);
        expect(result.data.quantity.available.count).toBe(500);
      }
    });

    it('should validate mango catalog successfully', () => {
      const result = BecknCatalogItemSchema.safeParse(SAMPLE_MANGO_CATALOG);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.descriptor.name).toBe('Alphonso Mangoes');
        expect(result.data.price.value).toBe(120);
        expect(result.data.quantity.unit).toBe('crate');
      }
    });

    it('should validate tomato catalog successfully', () => {
      const result = BecknCatalogItemSchema.safeParse(SAMPLE_TOMATO_CATALOG);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.descriptor.name).toBe('Fresh Tomatoes');
        expect(result.data.tags.perishability).toBe('high');
      }
    });

    it('should validate descriptor schema', () => {
      const validDescriptor = {
        name: 'Test Product',
        symbol: 'http://example.com/icon.png'
      };
      
      const result = BecknDescriptorSchema.safeParse(validDescriptor);
      expect(result.success).toBe(true);
    });

    it('should validate price schema', () => {
      const validPrice = {
        value: 100,
        currency: 'INR'
      };
      
      const result = BecknPriceSchema.safeParse(validPrice);
      expect(result.success).toBe(true);
    });

    it('should validate quantity schema', () => {
      const validQuantity = {
        available: { count: 50 },
        unit: 'kg'
      };
      
      const result = BecknQuantitySchema.safeParse(validQuantity);
      expect(result.success).toBe(true);
    });

    it('should validate tags schema with all fields', () => {
      const validTags = {
        grade: 'A',
        perishability: 'medium' as const,
        logistics_provider: 'India Post'
      };
      
      const result = BecknTagsSchema.safeParse(validTags);
      expect(result.success).toBe(true);
    });
  });

  describe('10.3.2: Schema validation with invalid data', () => {
    it('should reject catalog with missing fields', () => {
      const result = BecknCatalogItemSchema.safeParse(INVALID_CATALOG_MISSING_FIELDS);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject catalog with wrong types', () => {
      const result = BecknCatalogItemSchema.safeParse(INVALID_CATALOG_WRONG_TYPES);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should reject descriptor without symbol', () => {
      const invalidDescriptor = {
        name: 'Test Product'
        // Missing symbol
      };
      
      const result = BecknDescriptorSchema.safeParse(invalidDescriptor);
      expect(result.success).toBe(false);
    });

    it('should reject descriptor with invalid URL', () => {
      const invalidDescriptor = {
        name: 'Test Product',
        symbol: 'not-a-url'
      };
      
      const result = BecknDescriptorSchema.safeParse(invalidDescriptor);
      expect(result.success).toBe(false);
    });

    it('should reject price with negative value', () => {
      const invalidPrice = {
        value: -50,
        currency: 'INR'
      };
      
      const result = BecknPriceSchema.safeParse(invalidPrice);
      expect(result.success).toBe(false);
    });

    it('should reject price with invalid currency code', () => {
      const invalidPrice = {
        value: 100,
        currency: 'RUPEES' // Should be 3-letter code
      };
      
      const result = BecknPriceSchema.safeParse(invalidPrice);
      expect(result.success).toBe(false);
    });

    it('should reject quantity with negative count', () => {
      const invalidQuantity = {
        available: { count: -10 },
        unit: 'kg'
      };
      
      const result = BecknQuantitySchema.safeParse(invalidQuantity);
      expect(result.success).toBe(false);
    });

    it('should reject tags with invalid perishability', () => {
      const invalidTags = {
        perishability: 'very-high' // Not in enum
      };
      
      const result = BecknTagsSchema.safeParse(invalidTags);
      expect(result.success).toBe(false);
    });
  });

  describe('10.3.3: Edge cases (zero prices, empty strings)', () => {
    it('should reject zero price', () => {
      const catalogWithZeroPrice = {
        ...SAMPLE_ONION_CATALOG,
        price: {
          value: 0,
          currency: 'INR'
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithZeroPrice);
      expect(result.success).toBe(false);
    });

    it('should reject empty product name', () => {
      const catalogWithEmptyName = {
        ...SAMPLE_ONION_CATALOG,
        descriptor: {
          name: '',
          symbol: 'http://example.com/icon.png'
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithEmptyName);
      expect(result.success).toBe(false);
    });

    it('should reject empty unit', () => {
      const catalogWithEmptyUnit = {
        ...SAMPLE_ONION_CATALOG,
        quantity: {
          available: { count: 100 },
          unit: ''
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithEmptyUnit);
      expect(result.success).toBe(false);
    });

    it('should handle very large quantities', () => {
      const catalogWithLargeQuantity = {
        ...SAMPLE_ONION_CATALOG,
        quantity: {
          available: { count: 1000000 },
          unit: 'kg'
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithLargeQuantity);
      expect(result.success).toBe(true);
    });

    it('should handle very large prices', () => {
      const catalogWithLargePrice = {
        ...SAMPLE_ONION_CATALOG,
        price: {
          value: 999999,
          currency: 'INR'
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithLargePrice);
      expect(result.success).toBe(true);
    });

    it('should handle decimal prices', () => {
      const catalogWithDecimalPrice = {
        ...SAMPLE_ONION_CATALOG,
        price: {
          value: 45.50,
          currency: 'INR'
        }
      };
      
      const result = BecknCatalogItemSchema.safeParse(catalogWithDecimalPrice);
      expect(result.success).toBe(true);
    });
  });

  describe('10.3.4: Default value application', () => {
    it('should apply default currency INR', () => {
      const priceWithoutCurrency = {
        value: 100
      };
      
      const result = BecknPriceSchema.parse(priceWithoutCurrency);
      expect(result.currency).toBe('INR');
    });

    it('should allow optional tags fields to be undefined', () => {
      const tagsWithoutOptionals = {};
      
      const result = BecknTagsSchema.safeParse(tagsWithoutOptionals);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.grade).toBeUndefined();
        expect(result.data.perishability).toBeUndefined();
        expect(result.data.logistics_provider).toBeUndefined();
      }
    });

    it('should allow partial tags', () => {
      const partialTags = {
        grade: 'A'
        // Other fields optional
      };
      
      const result = BecknTagsSchema.safeParse(partialTags);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.grade).toBe('A');
      }
    });
  });
});
