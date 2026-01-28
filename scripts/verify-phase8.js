/**
 * Verification script for Phase 8 implementation
 * Checks that all required assets and utilities are in place
 */

const fs = require('fs');
const path = require('path');

console.log(' Verifying Phase 8 Implementation...\n');

let allPassed = true;

// Check directories
console.log(' Checking directories...');
const dirs = [
  'public/icons',
  'public/logos'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`  [OK] ${dir} exists`);
  } else {
    console.log(`  [X] ${dir} missing`);
    allPassed = false;
  }
});

// Check commodity icons
console.log('\n Checking commodity icons (128x128px)...');
const commodityIcons = [
  'onion.png',
  'mango.png',
  'tomato.png',
  'potato.png',
  'wheat.png'
];

commodityIcons.forEach(icon => {
  const fullPath = path.join(__dirname, '..', 'public', 'icons', icon);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  [OK] ${icon} (${stats.size} bytes)`);
  } else {
    console.log(`  [X] ${icon} missing`);
    allPassed = false;
  }
});

// Check logistics logos
console.log('\n Checking logistics logos (64x64px)...');
const logisticsLogos = [
  'india-post.png',
  'delhivery.png',
  'bluedart.png'
];

logisticsLogos.forEach(logo => {
  const fullPath = path.join(__dirname, '..', 'public', 'logos', logo);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  [OK] ${logo} (${stats.size} bytes)`);
  } else {
    console.log(`  [X] ${logo} missing`);
    allPassed = false;
  }
});

// Check buyer logos
console.log('\n Checking buyer logos (64x64px)...');
const buyerLogos = [
  'reliance.png',
  'bigbasket.png',
  'paytm.png',
  'flipkart.png'
];

buyerLogos.forEach(logo => {
  const fullPath = path.join(__dirname, '..', 'public', 'logos', logo);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`  [OK] ${logo} (${stats.size} bytes)`);
  } else {
    console.log(`  [X] ${logo} missing`);
    allPassed = false;
  }
});

// Check icon mapper utility
console.log('\n Checking icon mapper utility...');
const iconMapperPath = path.join(__dirname, '..', 'lib', 'icon-mapper.ts');
if (fs.existsSync(iconMapperPath)) {
  const content = fs.readFileSync(iconMapperPath, 'utf8');
  
  // Check for required exports
  const requiredExports = [
    'getCommodityIcon',
    'getLogisticsLogo',
    'getBuyerLogo',
    'extractCommodityName',
    'getCommodityIconFromProduct',
    'COMMODITY_ICON_MAP',
    'LOGISTICS_LOGO_MAP',
    'BUYER_LOGO_MAP'
  ];
  
  requiredExports.forEach(exportName => {
    if (content.includes(`export function ${exportName}`) || 
        content.includes(`export const ${exportName}`)) {
      console.log(`  [OK] ${exportName} exported`);
    } else {
      console.log(`  [X] ${exportName} not found`);
      allPassed = false;
    }
  });
} else {
  console.log('  [X] lib/icon-mapper.ts missing');
  allPassed = false;
}

// Check test file
console.log('\n Checking test file...');
const testPath = path.join(__dirname, '..', 'lib', '__tests__', 'icon-mapper.test.ts');
if (fs.existsSync(testPath)) {
  console.log('  [OK] lib/__tests__/icon-mapper.test.ts exists');
} else {
  console.log('  [X] lib/__tests__/icon-mapper.test.ts missing');
  allPassed = false;
}

// Check documentation
console.log('\n Checking documentation...');
const docs = [
  'PHASE_8_IMPLEMENTATION.md',
  'lib/icon-mapper.README.md',
  'public/assets-demo.html'
];

docs.forEach(doc => {
  const fullPath = path.join(__dirname, '..', doc);
  if (fs.existsSync(fullPath)) {
    console.log(`  [OK] ${doc} exists`);
  } else {
    console.log(`  [X] ${doc} missing`);
    allPassed = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('[OK] Phase 8 verification PASSED!');
  console.log('\nAll assets and utilities are in place.');
  console.log('\nNext steps:');
  console.log('  1. View assets demo: http://localhost:3000/assets-demo.html');
  console.log('  2. Run tests: npm test lib/__tests__/icon-mapper.test.ts');
  console.log('  3. Proceed to Phase 6: Frontend Components');
  process.exit(0);
} else {
  console.log('[X] Phase 8 verification FAILED!');
  console.log('\nSome assets or utilities are missing.');
  console.log('Please review the errors above and fix them.');
  process.exit(1);
}
