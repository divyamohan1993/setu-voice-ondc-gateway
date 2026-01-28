/**
 * Generate placeholder images for Setu Voice-to-ONDC Gateway
 * Creates simple colored PNG images with text labels
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure directories exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const logosDir = path.join(__dirname, '..', 'public', 'logos');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

/**
 * Generate a simple colored PNG with text
 */
async function generatePlaceholder(filename, size, bgColor, text, textColor = '#FFFFFF') {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bgColor}" rx="8"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${size / 8}" 
        font-weight="bold"
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(filename);
  
  console.log(`[OK] Created: ${filename}`);
}

async function main() {
  console.log(' Generating placeholder images...\n');

  // Commodity Icons (128x128px)
  console.log('Creating commodity icons (128x128px)...');
  await generatePlaceholder(
    path.join(iconsDir, 'onion.png'),
    128,
    '#8B4789', // Purple
    ''
  );
  
  await generatePlaceholder(
    path.join(iconsDir, 'mango.png'),
    128,
    '#FFB347', // Orange
    ''
  );
  
  await generatePlaceholder(
    path.join(iconsDir, 'tomato.png'),
    128,
    '#FF6347', // Tomato red
    ''
  );
  
  await generatePlaceholder(
    path.join(iconsDir, 'potato.png'),
    128,
    '#8B7355', // Brown
    ''
  );
  
  await generatePlaceholder(
    path.join(iconsDir, 'wheat.png'),
    128,
    '#F5DEB3', // Wheat color
    '',
    '#8B4513' // Brown text
  );

  // Logistics Logos (64x64px)
  console.log('\nCreating logistics logos (64x64px)...');
  await generatePlaceholder(
    path.join(logosDir, 'india-post.png'),
    64,
    '#DC143C', // Crimson
    'POST'
  );
  
  await generatePlaceholder(
    path.join(logosDir, 'delhivery.png'),
    64,
    '#FF4500', // Orange red
    'DLV'
  );
  
  await generatePlaceholder(
    path.join(logosDir, 'bluedart.png'),
    64,
    '#0066CC', // Blue
    'BD'
  );

  // Buyer Logos (64x64px)
  console.log('\nCreating buyer logos (64x64px)...');
  await generatePlaceholder(
    path.join(logosDir, 'reliance.png'),
    64,
    '#003DA5', // Reliance blue
    'RFL'
  );
  
  await generatePlaceholder(
    path.join(logosDir, 'bigbasket.png'),
    64,
    '#84C225', // Green
    'BB'
  );
  
  await generatePlaceholder(
    path.join(logosDir, 'paytm.png'),
    64,
    '#00BAF2', // Paytm blue
    'PTM'
  );
  
  await generatePlaceholder(
    path.join(logosDir, 'flipkart.png'),
    64,
    '#2874F0', // Flipkart blue
    'FK'
  );

  console.log('\n[OK] All placeholder images generated successfully!');
}

main().catch(err => {
  console.error('[X] Error generating images:', err);
  process.exit(1);
});
