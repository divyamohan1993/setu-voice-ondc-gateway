/**
 * Beckn Schema Demo
 * 
 * This file demonstrates the complete functionality of the Beckn Protocol schemas
 * with real-world examples from the Setu Voice-to-ONDC Gateway use case.
 */

import {
  BecknCatalogItemSchema,
  type BecknCatalogItem
} from './beckn-schema';

/**
 * Demo 1: Farmer's voice input translated to catalog
 * Voice: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai"
 */
export const onionCatalogDemo: BecknCatalogItem = {
  descriptor: {
    name: 'Nasik Onions',
    symbol: 'https://setu.ondc.in/icons/onion.png'
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

/**
 * Demo 2: Farmer's voice input for mangoes
 * Voice: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai"
 */
export const mangoCatalogDemo: BecknCatalogItem = {
  descriptor: {
    name: 'Ratnagiri Alphonso Mangoes',
    symbol: 'https://setu.ondc.in/icons/mango.png'
  },
  price: {
    value: 150,
    currency: 'INR'
  },
  quantity: {
    available: { count: 20 },
    unit: 'crate'
  },
  tags: {
    grade: 'Organic Certified',
    perishability: 'high',
    logistics_provider: 'Delhivery'
  }
};

/**
 * Demo 3: Validate all demo catalogs
 */
export function validateDemoCatalogs(): void {
  console.log(' Validating Demo Catalogs\n');

  // Validate onion catalog
  try {
    const validOnion = BecknCatalogItemSchema.parse(onionCatalogDemo);
    console.log('[OK] Onion Catalog Valid');
    console.log(`   Product: ${validOnion.descriptor.name}`);
    console.log(`   Price: ${validOnion.price.value} per ${validOnion.quantity.unit}`);
    console.log(`   Quantity: ${validOnion.quantity.available.count} ${validOnion.quantity.unit}`);
    console.log(`   Grade: ${validOnion.tags.grade}`);
    console.log(`   Logistics: ${validOnion.tags.logistics_provider}\n`);
  } catch (error) {
    console.error('[X] Onion Catalog Invalid:', error);
  }

  // Validate mango catalog
  try {
    const validMango = BecknCatalogItemSchema.parse(mangoCatalogDemo);
    console.log('[OK] Mango Catalog Valid');
    console.log(`   Product: ${validMango.descriptor.name}`);
    console.log(`   Price: ${validMango.price.value} per ${validMango.quantity.unit}`);
    console.log(`   Quantity: ${validMango.quantity.available.count} ${validMango.quantity.unit}`);
    console.log(`   Grade: ${validMango.tags.grade}`);
    console.log(`   Logistics: ${validMango.tags.logistics_provider}\n`);
  } catch (error) {
    console.error('[X] Mango Catalog Invalid:', error);
  }
}

/**
 * Demo 4: Show validation errors for invalid data
 */
export function demonstrateValidationErrors(): void {
  console.log(' Demonstrating Validation Errors\n');

  // Invalid: Negative price
  const invalidPrice = {
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

  const result1 = BecknCatalogItemSchema.safeParse(invalidPrice);
  if (!result1.success) {
    console.log('[X] Invalid Price Example:');
    result1.error.issues.forEach(err => {
      console.log(`   ${err.path.join('.')}: ${err.message}`);
    });
    console.log();
  }

  // Invalid: Bad URL
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

  const result2 = BecknCatalogItemSchema.safeParse(invalidUrl);
  if (!result2.success) {
    console.log('[X] Invalid URL Example:');
    result2.error.issues.forEach(err => {
      console.log(`   ${err.path.join('.')}: ${err.message}`);
    });
    console.log();
  }

  // Invalid: Wrong perishability
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
      perishability: 'very-high' // Should be 'low', 'medium', or 'high'
    }
  };

  const result3 = BecknCatalogItemSchema.safeParse(invalidPerishability);
  if (!result3.success) {
    console.log('[X] Invalid Perishability Example:');
    result3.error.issues.forEach(err => {
      console.log(`   ${err.path.join('.')}: ${err.message}`);
    });
    console.log();
  }
}

/**
 * Demo 5: Show type safety in action
 */
export function demonstrateTypeSafety(): void {
  console.log(' Demonstrating Type Safety\n');

  // TypeScript will catch these errors at compile time:

  // [X] This would fail TypeScript compilation:
  // const invalid: BecknCatalogItem = {
  //   descriptor: {
  //     name: 'Test',
  //     // Missing 'symbol' field
  //   },
  //   price: { value: 50, currency: 'INR' },
  //   quantity: { available: { count: 100 }, unit: 'kg' },
  //   tags: {}
  // };

  // [OK] This passes TypeScript compilation:
  const valid: BecknCatalogItem = {
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
    tags: {}
  };

  console.log('[OK] Type-safe catalog created');
  console.log(`   Product: ${valid.descriptor.name}`);
  console.log(`   Type checking: Passed at compile time\n`);
}

/**
 * Run all demos
 */
export function runAllDemos(): void {
  console.log('');
  console.log('  Beckn Protocol Schema Demo - Setu Voice-to-ONDC');
  console.log('\n');

  validateDemoCatalogs();
  demonstrateValidationErrors();
  demonstrateTypeSafety();

  console.log('');
  console.log('  Demo Complete!');
  console.log('');
}

// Run demos if executed directly
if (require.main === module) {
  runAllDemos();
}
