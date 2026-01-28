/**
 * Example usage of Beckn Protocol schemas
 * 
 * This file demonstrates how to use the Beckn schemas for validation
 * and type-safe catalog item creation.
 */

import {
  BecknCatalogItemSchema,
  type BecknCatalogItem,
  type BecknDescriptor,
  type BecknPrice,
  type BecknQuantity,
  type BecknTags,
  BecknPriceSchema
} from './beckn-schema';

/**
 * Example 1: Creating a type-safe catalog item
 */
export function createOnionCatalog(): BecknCatalogItem {
  const catalog: BecknCatalogItem = {
    descriptor: {
      name: 'Nasik Onions',
      symbol: 'https://example.com/icons/onion.png'
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

  // Validate the catalog before returning
  return BecknCatalogItemSchema.parse(catalog);
}

/**
 * Example 2: Creating a mango catalog with minimal tags
 */
export function createMangoCatalog(): BecknCatalogItem {
  const catalog: BecknCatalogItem = {
    descriptor: {
      name: 'Alphonso Mangoes',
      symbol: 'https://example.com/icons/mango.png'
    },
    price: {
      value: 150,
      currency: 'INR'
      // currency will default to 'INR'
    },
    quantity: {
      available: { count: 20 },
      unit: 'crate'
    },
    tags: {
      grade: 'Premium',
      perishability: 'high'
      // logistics_provider is optional
    }
  };

  return BecknCatalogItemSchema.parse(catalog);
}

/**
 * Example 3: Validating external data
 */
export function validateCatalogData(data: unknown): BecknCatalogItem | null {
  try {
    return BecknCatalogItemSchema.parse(data);
  } catch (error) {
    console.error('Catalog validation failed:', error);
    return null;
  }
}

/**
 * Example 4: Creating catalog with builder pattern
 */
export class BecknCatalogBuilder {
  private descriptor: BecknDescriptor | null = null;
  private price: BecknPrice | null = null;
  private quantity: BecknQuantity | null = null;
  private tags: BecknTags = {};

  setDescriptor(name: string, symbolUrl: string): this {
    this.descriptor = { name, symbol: symbolUrl };
    return this;
  }

  setPrice(value: number, currency: string = 'INR'): this {
    this.price = { value, currency };
    return this;
  }

  setQuantity(count: number, unit: string): this {
    this.quantity = {
      available: { count },
      unit
    };
    return this;
  }

  setGrade(grade: string): this {
    this.tags.grade = grade;
    return this;
  }

  setPerishability(level: 'low' | 'medium' | 'high'): this {
    this.tags.perishability = level;
    return this;
  }

  setLogisticsProvider(provider: string): this {
    this.tags.logistics_provider = provider;
    return this;
  }

  build(): BecknCatalogItem {
    if (!this.descriptor || !this.price || !this.quantity) {
      throw new Error('Descriptor, price, and quantity are required');
    }

    const catalog = {
      descriptor: this.descriptor,
      price: this.price,
      quantity: this.quantity,
      tags: this.tags
    };

    // Validate before returning
    return BecknCatalogItemSchema.parse(catalog);
  }
}

/**
 * Example 5: Using the builder
 */
export function createTomatoCatalogWithBuilder(): BecknCatalogItem {
  return new BecknCatalogBuilder()
    .setDescriptor('Fresh Tomatoes', 'https://example.com/icons/tomato.png')
    .setPrice(30, 'INR')
    .setQuantity(200, 'kg')
    .setGrade('B')
    .setPerishability('high')
    .setLogisticsProvider('Delhivery')
    .build();
}

/**
 * Example 6: Partial validation of sub-schemas
 */
export function validatePrice(data: unknown): BecknPrice | null {
  try {
    return BecknPriceSchema.parse(data);
  } catch (error) {
    console.error('Price validation failed:', error);
    return null;
  }
}

/**
 * Example 7: Type guards
 */
export function isBecknCatalogItem(data: unknown): data is BecknCatalogItem {
  try {
    BecknCatalogItemSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Example 8: Safe parsing with error details
 */
export function safeParseCatalog(data: unknown): {
  success: boolean;
  data?: BecknCatalogItem;
  errors?: string[];
} {
  const result = BecknCatalogItemSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  } else {
    return {
      success: false,
      errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`)
    };
  }
}
