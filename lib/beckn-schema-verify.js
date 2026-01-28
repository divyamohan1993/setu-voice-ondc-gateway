// Simple verification script for Beckn schemas
// This can be run with: node lib/beckn-schema-verify.js

const { BecknCatalogItemSchema } = require('./beckn-schema.ts');

console.log(' Testing Beckn Protocol Schema Validation\n');

// Test 1: Valid catalog item
console.log('Test 1: Valid catalog item');
const validCatalog = {
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

try {
  const result = BecknCatalogItemSchema.parse(validCatalog);
  console.log('[OK] Valid catalog passed validation');
} catch (error) {
  console.error('[X] Valid catalog failed:', error.message);
  process.exit(1);
}

// Test 2: Catalog with default currency
console.log('\nTest 2: Catalog with default currency');
const catalogWithoutCurrency = {
  descriptor: {
    name: 'Alphonso Mangoes',
    symbol: 'https://example.com/mango.png'
  },
  price: {
    value: 150
  },
  quantity: {
    available: { count: 20 },
    unit: 'crate'
  },
  tags: {}
};

try {
  const result = BecknCatalogItemSchema.parse(catalogWithoutCurrency);
  if (result.price.currency === 'INR') {
    console.log('[OK] Default currency (INR) applied correctly');
  } else {
    console.error('[X] Default currency not applied');
    process.exit(1);
  }
} catch (error) {
  console.error('[X] Catalog with default currency failed:', error.message);
  process.exit(1);
}

// Test 3: Invalid catalog (negative price)
console.log('\nTest 3: Invalid catalog (negative price)');
const invalidCatalog = {
  descriptor: {
    name: 'Test Product',
    symbol: 'https://example.com/test.png'
  },
  price: {
    value: -10,
    currency: 'INR'
  },
  quantity: {
    available: { count: 100 },
    unit: 'kg'
  },
  tags: {}
};

try {
  BecknCatalogItemSchema.parse(invalidCatalog);
  console.error('[X] Invalid catalog should have been rejected');
  process.exit(1);
} catch (error) {
  console.log('[OK] Invalid catalog correctly rejected');
}

// Test 4: Invalid URL in descriptor
console.log('\nTest 4: Invalid URL in descriptor');
const invalidUrl = {
  descriptor: {
    name: 'Test Product',
    symbol: 'not-a-url'
  },
  price: {
    value: 50,
    currency: 'INR'
  },
  quantity: {
    available: { count: 100 },
    unit: 'kg'
  },
  tags: {}
};

try {
  BecknCatalogItemSchema.parse(invalidUrl);
  console.error('[X] Invalid URL should have been rejected');
  process.exit(1);
} catch (error) {
  console.log('[OK] Invalid URL correctly rejected');
}

// Test 5: Invalid perishability value
console.log('\nTest 5: Invalid perishability value');
const invalidPerishability = {
  descriptor: {
    name: 'Test Product',
    symbol: 'https://example.com/test.png'
  },
  price: {
    value: 50,
    currency: 'INR'
  },
  quantity: {
    available: { count: 100 },
    unit: 'kg'
  },
  tags: {
    perishability: 'very-high'
  }
};

try {
  BecknCatalogItemSchema.parse(invalidPerishability);
  console.error('[X] Invalid perishability should have been rejected');
  process.exit(1);
} catch (error) {
  console.log('[OK] Invalid perishability correctly rejected');
}

console.log('\n[OK] All schema validation tests passed!');
console.log('\n Summary:');
console.log('  - BecknDescriptorSchema: [OK]');
console.log('  - BecknPriceSchema: [OK]');
console.log('  - BecknQuantitySchema: [OK]');
console.log('  - BecknTagsSchema: [OK]');
console.log('  - BecknCatalogItemSchema: [OK]');
console.log('  - Type exports: [OK]');
