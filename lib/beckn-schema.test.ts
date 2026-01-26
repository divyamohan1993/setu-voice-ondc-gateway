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
        symbol: 'http://example.co
    it('should reject negative price', () => {
      const invalidPrice = {
        value: -10,
        currency: 'INR'
      };
      
      expect(() => BecknPriceSchema.parse(invalidPrice)).toThrow();
    });

    it('should reject zero price', () => {
      const invalidPrice = {
        value: 0,
        currency: 'INR'
      };
      
      expect(() => BecknPriceSchema.parse(invalidPrice)).toThrow();
    });

    it('should reject invalid currency code length', () => {
      const invalidPrice = {
        value: 40,
        currency: 'INRR'
      };
      
      expect(() => BecknPriceSchema.parse(invalidPrice)).toThrow();
    });
  });

  describe('BecknQuantitySchema', () => {
    it('should validate a valid quantity', () => {
      const validQuantity = {
        available: { count: 500 },
        unit: 'kg'
      };
      
      const result = BecknQuantitySchema.parse(validQuantity);
      expect(result).toEqual(validQuantity);
    });

    it('should reject negative count', () => {
      const invalidQuantity = {
        available: { count: -10 },
        unit: 'kg'
      };
      
      expect(() => BecknQuantitySchema.parse(invalidQuantity)).toThrow();
    });

    it('should reject zero count', () => {
      const invalidQuantity = {
        available: { count: 0 },
        unit: 'kg'
      };
      
      expect(() => BecknQuantitySchema.parse(invalidQuantity)).toThrow();
    });

    it('should reject empty unit', () => {
      const invalidQuantity = {
        available: { count: 500 },
        unit: ''
      };
      
      expect(() => BecknQuantitySchema.parse(invalidQuantity)).toThrow();
    });
  });

  describe('BecknTagsSchema', () => {
    it('should validate tags with all fields', () => {
      const validTags = {
        grade: 'A',
        perishability: 'medium' as const,
        logistics_provider: 'India Post'
      };
      
      const result = BecknTagsSchema.parse(validTags);
      expect(result).toEqual(validTags);
    });

    it('should validate tags with only some fields', () => {
      const partialTags = {
        grade: 'A'
      };
      
      const result = BecknTagsSchema.parse(partialTags);
      expect(result).toEqual(partialTags);
    });

    it('should validate empty tags object', () => {
      const emptyTags = {};
      
      const result = BecknTagsSchema.parse(emptyTags);
      expect(result).toEqual(emptyTags);
    });

    it('should validate valid perishability values', () => {
      const lowPerish = { perishability: 'low' as const };
      const mediumPerish = { perishability: 'medium' as const };
      const highPerish = { perishability: 'high' as const };
      
      expect(() => BecknTagsSchema.parse(lowPerish)).not.toThrow();
      expect(() => BecknTagsSchema.parse(mediumPerish)).not.toThrow();
      expect(() => BecknTagsSchema.parse(highPerish)).not.toThrow();
    });

    it('should reject invalid perishability value', () => {
      const invalidTags = {
        perishability: 'very-high'
      };
      
      expect(() => BecknTagsSchema.parse(invalidTags)).toThrow();
    });
  });

  describe('BecknCatalogItemSchema', () => {
    it('should validate a complete valid catalog item', () => {
      const validCatalog: BecknCatalogItem = {
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
      
      const result = BecknCatalogItemSchema.parse(validCatalog);
      expect(result).toEqual(validCatalog);
    });

    it('should validate catalog with minimal tags', () => {
      const catalogWithMinimalTags = {
        descriptor: {
          name: 'Alphonso Mangoes',
          symbol: 'https://example.com/mango.png'
        },
        price: {
          value: 150,
          currency: 'INR'
        },
        quantity: {
          available: { count: 20 },
          unit: 'crate'
        },
        tags: {}
      };
      
      const result = BecknCatalogItemSchema.parse(catalogWithMinimalTags);
      expect(result.descriptor.name).toBe('Alphonso Mangoes');
      expect(result.price.value).toBe(150);
    });

    it('should reject catalog with missing required fields', () => {
      const incompleteCatalog = {
        descriptor: {
          name: 'Nasik Onions',
          symbol: 'https://example.com/onion.png'
        },
        price: {
          value: 40,
          currency: 'INR'
        }
        // Missing quantity and tags
      };
      
      expect(() => BecknCatalogItemSchema.parse(incompleteCatalog)).toThrow();
    });

    it('should reject catalog with invalid nested fields', () => {
      const invalidCatalog = {
        descriptor: {
          name: 'Nasik Onions',
          symbol: 'not-a-url'
        },
        price: {
          value: 40,
          currency: 'INR'
        },
        quantity: {
          available: { count: 500 },
          unit: 'kg'
        },
        tags: {}
      };
      
      expect(() => BecknCatalogItemSchema.parse(invalidCatalog)).toThrow();
    });
  });

  describe('Type Exports', () => {
    it('should export correct TypeScript types', () => {
      // This is a compile-time test - if it compiles, the types are correct
      const catalog: BecknCatalogItem = {
        descriptor: {
          name: 'Test Product',
          symbol: 'https://example.com/test.png'
        },
        price: {
          value: 100,
          currency: 'INR'
        },
        quantity: {
          available: { count: 10 },
          unit: 'piece'
        },
        tags: {
          grade: 'Premium'
        }
      };
      
      expect(catalog.descriptor.name).toBe('Test Product');
    });
  });
});
