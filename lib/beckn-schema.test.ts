import { describe, it, expect } from 'vitest';
import {
  BecknDescriptorSchema,
  BecknPriceSchema,
  BecknQuantitySchema,
  BecknTagsSchema,
  BecknCatalogItemSchema,
  type BecknCatalogItem
} from './beckn-schema';

describe('Beckn Protocol Schema Validation', () => {
  describe('BecknDescriptorSchema', () => {
    it('should validate a valid descriptor', () => {
      const validDescriptor = {
        name: 'Nasik Onions',
        symbol: 'https://example.com/onion.png'
      };
      
      const result = BecknDescriptorSchema.parse(validDescriptor);
      expect(result).toEqual(validDescriptor);
    });

    it('should reject empty name', () => {
      const invalidDescriptor = {
        name: '',
        symbol: 'https://example.com/onion.png'
      };
      
      expect(() => BecknDescriptorSchema.parse(invalidDescriptor)).toThrow();
    });

    it('should reject invalid URL', () => {
      const invalidDescriptor = {
        name: 'Nasik Onions',
        symbol: 'not-a-url'
      };
      
      expect(() => BecknDescriptorSchema.parse(invalidDescriptor)).toThrow();
    });
  });

  describe('BecknPriceSchema', () => {
    it('should validate a valid price', () => {
      const validPrice = {
        value: 40,
        currency: 'INR'
      };
      
      const result = BecknPriceSchema.parse(validPrice);
      expect(result).toEqual(validPrice);
    });

    it('should apply default currency', () => {
      const priceWithoutCurrency = {
        value: 40
      };
      
      const result = BecknPriceSchema.parse(priceWithoutCurrency);
      expect(result.currency).toBe('INR');
    });

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
