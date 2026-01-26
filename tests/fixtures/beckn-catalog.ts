import { BecknCatalogItem } from '@/lib/beckn-schema';

/**
 * Sample Beckn catalog items for testing
 */

export const SAMPLE_ONION_CATALOG: BecknCatalogItem = {
  descriptor: {
    name: 'Nasik Onions',
    symbol: '/icons/onion.png',
  },
  price: {
    value: 40,
    currency: 'INR',
  },
  quantity: {
    available: {
      count: 500,
    },
    unit: 'kg',
  },
  tags: {
    grade: 'A',
    perishability: 'medium',
    logistics_provider: 'India Post',
  },
};

export const SAMPLE_MANGO_CATALOG: BecknCatalogItem = {
  descriptor: {
    name: 'Alphonso Mangoes',
    symbol: '/icons/mango.png',
  },
  price: {
    value: 120,
    currency: 'INR',
  },
  quantity: {
    available: {
      count: 20,
    },
    unit: 'crate',
  },
  tags: {
    grade: 'Premium',
    perishability: 'high',
    logistics_provider: 'Delhivery',
  },
};

export const SAMPLE_TOMATO_CATALOG: BecknCatalogItem = {
  descriptor: {
    name: 'Fresh Tomatoes',
    symbol: '/icons/tomato.png',
  },
  price: {
    value: 30,
    currency: 'INR',
  },
  quantity: {
    available: {
      count: 100,
    },
    unit: 'kg',
  },
  tags: {
    grade: 'B',
    perishability: 'high',
    logistics_provider: 'India Post',
  },
};

export const INVALID_CATALOG_MISSING_FIELDS = {
  descriptor: {
    name: 'Invalid Product',
    // Missing symbol
  },
  price: {
    value: -10, // Invalid negative price
    currency: 'INR',
  },
  // Missing quantity
  tags: {},
};

export const INVALID_CATALOG_WRONG_TYPES = {
  descriptor: {
    name: 123, // Should be string
    symbol: 'not-a-url', // Should be valid URL
  },
  price: {
    value: 'forty', // Should be number
    currency: 'RUPEES', // Should be 3-letter code
  },
  quantity: {
    available: {
      count: 'many', // Should be number
    },
    unit: '',
  },
  tags: {},
};

/**
 * Factory function to create custom catalog items for testing
 */
export function createTestCatalog(
  overrides: Partial<BecknCatalogItem> = {}
): BecknCatalogItem {
  return {
    ...SAMPLE_ONION_CATALOG,
    ...overrides,
  };
}
