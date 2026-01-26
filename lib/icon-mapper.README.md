# Icon Mapper Utility

A comprehensive utility for mapping commodity names, logistics providers, and buyer names to their corresponding icon/logo paths in the Setu Voice-to-ONDC Gateway application.

## Overview

The Icon Mapper provides a centralized, type-safe way to retrieve visual assets based on text identifiers. It handles case-insensitive matching, supports multiple name variants (including Hindi/Hinglish), and provides sensible defaults for unknown values.

## Features

- ✅ **Multi-language Support**: Handles English and Hindi/Hinglish commodity names
- ✅ **Case-Insensitive**: Works with any case combination
- ✅ **Whitespace Tolerant**: Automatically trims input
- ✅ **Variant Support**: Recognizes multiple names for the same commodity
- ✅ **Safe Defaults**: Returns fallback icons for unknown values
- ✅ **Type-Safe**: Full TypeScript support with proper types
- ✅ **Well-Tested**: Comprehensive unit test coverage

## Installation

The utility is already included in the project at `lib/icon-mapper.ts`. No additional installation required.

## Usage

### Basic Usage

```typescript
import { 
  getCommodityIcon, 
  getLogisticsLogo, 
  getBuyerLogo 
} from '@/lib/icon-mapper';

// Get commodity icon
const onionIcon = getCommodityIcon('onion');
// Returns: "/icons/onion.png"

// Get logistics logo
const postLogo = getLogisticsLogo('India Post');
// Returns: "/logos/india-post.png"

// Get buyer logo
const bbLogo = getBuyerLogo('BigBasket');
// Returns: "/logos/bigbasket.png"
```

### Advanced Usage

```typescript
import { 
  getCommodityIconFromProduct,
  extractCommodityName 
} from '@/lib/icon-mapper';

// Extract commodity from product name
const commodity = extractCommodityName('Fresh Nasik Onions');
// Returns: "onions"

// Get icon directly from product name
const icon = getCommodityIconFromProduct('Organic Alphonso Mango');
// Returns: "/icons/mango.png"
```

### React Component Example

```tsx
import { getCommodityIcon, getLogisticsLogo } from '@/lib/icon-mapper';

function CatalogCard({ catalog }) {
  return (
    <div className="catalog-card">
      <img 
        src={getCommodityIcon(catalog.descriptor.name)} 
        alt={catalog.descriptor.name}
        width={128}
        height={128}
      />
      <img 
        src={getLogisticsLogo(catalog.tags.logistics_provider)} 
        alt={catalog.tags.logistics_provider}
        width={64}
        height={64}
      />
    </div>
  );
}
```

## API Reference

### Functions

#### `getCommodityIcon(commodityName: string): string`

Returns the icon path for a given commodity name.

**Parameters:**
- `commodityName` (string): The name of the commodity (e.g., "onion", "pyaaz", "Mango")

**Returns:**
- (string): Path to the commodity icon (e.g., "/icons/onion.png")

**Example:**
```typescript
getCommodityIcon('pyaaz')      // "/icons/onion.png"
getCommodityIcon('Alphonso')   // "/icons/mango.png"
getCommodityIcon('unknown')    // "/icons/wheat.png" (default)
```

---

#### `getLogisticsLogo(providerName: string): string`

Returns the logo path for a given logistics provider.

**Parameters:**
- `providerName` (string): The name of the logistics provider

**Returns:**
- (string): Path to the logistics logo

**Example:**
```typescript
getLogisticsLogo('India Post')  // "/logos/india-post.png"
getLogisticsLogo('delhivery')   // "/logos/delhivery.png"
```

---

#### `getBuyerLogo(buyerName: string): string`

Returns the logo path for a given buyer.

**Parameters:**
- `buyerName` (string): The name of the buyer

**Returns:**
- (string): Path to the buyer logo

**Example:**
```typescript
getBuyerLogo('BigBasket')       // "/logos/bigbasket.png"
getBuyerLogo('Paytm Mall')      // "/logos/paytm.png"
```

---

#### `extractCommodityName(productName: string): string`

Extracts the commodity name from a product description.

**Parameters:**
- `productName` (string): The full product name

**Returns:**
- (string): The identified commodity name

**Example:**
```typescript
extractCommodityName('Nasik Onions')           // "onions"
extractCommodityName('Fresh Alphonso Mango')   // "alphonso"
```

---

#### `getCommodityIconFromProduct(productName: string): string`

Convenience function that extracts commodity name and returns icon path.

**Parameters:**
- `productName` (string): The full product name

**Returns:**
- (string): Path to the commodity icon

**Example:**
```typescript
getCommodityIconFromProduct('Nasik Onions')    // "/icons/onion.png"
getCommodityIconFromProduct('Unknown Product') // "/icons/wheat.png" (default)
```

## Supported Commodities

| Commodity | Variants | Icon Path |
|-----------|----------|-----------|
| Onion | onion, onions, pyaaz, pyaz | `/icons/onion.png` |
| Mango | mango, mangoes, aam, alphonso | `/icons/mango.png` |
| Tomato | tomato, tomatoes, tamatar | `/icons/tomato.png` |
| Potato | potato, potatoes, aloo | `/icons/potato.png` |
| Wheat | wheat, gehun, gehu | `/icons/wheat.png` |

## Supported Logistics Providers

| Provider | Variants | Logo Path |
|----------|----------|-----------|
| India Post | india post, india-post, indiapost | `/logos/india-post.png` |
| Delhivery | delhivery | `/logos/delhivery.png` |
| BlueDart | bluedart, blue dart, blue-dart | `/logos/bluedart.png` |

## Supported Buyers

| Buyer | Variants | Logo Path |
|-------|----------|-----------|
| Reliance Fresh | reliance, reliance fresh, reliance-fresh | `/logos/reliance.png` |
| BigBasket | bigbasket, big basket, big-basket | `/logos/bigbasket.png` |
| Paytm Mall | paytm, paytm mall, paytm-mall | `/logos/paytm.png` |
| Flipkart Grocery | flipkart, flipkart grocery, flipkart-grocery | `/logos/flipkart.png` |

## Default Values

When an unknown value is provided, the utility returns sensible defaults:

```typescript
DEFAULT_COMMODITY_ICON = '/icons/wheat.png'
DEFAULT_LOGISTICS_LOGO = '/logos/india-post.png'
DEFAULT_BUYER_LOGO = '/logos/reliance.png'
```

## Constants

You can also access the mapping objects directly:

```typescript
import { 
  COMMODITY_ICON_MAP,
  LOGISTICS_LOGO_MAP,
  BUYER_LOGO_MAP 
} from '@/lib/icon-mapper';

// Access all commodity mappings
console.log(COMMODITY_ICON_MAP);
// { onion: '/icons/onion.png', onions: '/icons/onion.png', ... }
```

## Testing

The utility includes comprehensive unit tests. Run them with:

```bash
npm test lib/__tests__/icon-mapper.test.ts
```

**Test Coverage:**
- ✅ All commodity variants
- ✅ All logistics provider variants
- ✅ All buyer variants
- ✅ Case-insensitive matching
- ✅ Whitespace handling
- ✅ Default fallback behavior
- ✅ Commodity extraction
- ✅ End-to-end icon retrieval

## Adding New Commodities

To add a new commodity:

1. Add the icon file to `public/icons/` (128x128px PNG)
2. Update `COMMODITY_ICON_MAP` in `lib/icon-mapper.ts`:

```typescript
export const COMMODITY_ICON_MAP: Record<string, string> = {
  // ... existing entries
  
  // New commodity
  banana: '/icons/banana.png',
  bananas: '/icons/banana.png',
  kela: '/icons/banana.png',
};
```

3. Add test cases in `lib/__tests__/icon-mapper.test.ts`

## Adding New Logistics Providers

To add a new logistics provider:

1. Add the logo file to `public/logos/` (64x64px PNG)
2. Update `LOGISTICS_LOGO_MAP` in `lib/icon-mapper.ts`:

```typescript
export const LOGISTICS_LOGO_MAP: Record<string, string> = {
  // ... existing entries
  
  // New provider
  dtdc: '/logos/dtdc.png',
  'dtdc courier': '/logos/dtdc.png',
};
```

## Adding New Buyers

To add a new buyer:

1. Add the logo file to `public/logos/` (64x64px PNG)
2. Update `BUYER_LOGO_MAP` in `lib/icon-mapper.ts`:

```typescript
export const BUYER_LOGO_MAP: Record<string, string> = {
  // ... existing entries
  
  // New buyer
  amazon: '/logos/amazon.png',
  'amazon fresh': '/logos/amazon.png',
};
```

## Best Practices

1. **Always use the utility functions** instead of hardcoding paths
2. **Handle unknown values gracefully** - the utility provides defaults
3. **Use case-insensitive matching** - don't normalize input yourself
4. **Test with real data** - verify icons display correctly in the UI
5. **Update tests** when adding new commodities/providers/buyers

## Integration Points

The Icon Mapper integrates with:

- **Translation Agent** (`lib/translation-agent.ts`): Assigns icons to generated catalogs
- **Visual Verifier** (`components/VisualVerifier.tsx`): Displays commodity icons
- **Network Simulator** (`lib/network-simulator.ts`): Assigns buyer logos to bids
- **Catalog Cards**: Shows logistics provider logos

## Troubleshooting

### Icon not displaying

1. Check the file exists: `ls public/icons/onion.png`
2. Verify the path is correct: `getCommodityIcon('onion')`
3. Check browser console for 404 errors
4. Ensure Next.js is serving static files from `public/`

### Wrong icon returned

1. Check the commodity name spelling
2. Verify the variant is in `COMMODITY_ICON_MAP`
3. Add the variant if missing
4. Check for typos in the mapping

### Default icon always returned

1. The commodity name is not recognized
2. Add the variant to the appropriate map
3. Check case sensitivity (should work, but verify)

## Performance

The Icon Mapper is highly performant:

- **O(1) lookup time**: Direct object property access
- **No network requests**: All mappings are in-memory
- **Minimal memory footprint**: Small mapping objects
- **No dependencies**: Pure TypeScript implementation

## License

Part of the Setu Voice-to-ONDC Gateway project.

## Related Documentation

- [Phase 8 Implementation Summary](../PHASE_8_IMPLEMENTATION.md)
- [Design Document](../.kiro/specs/setu-voice-ondc-gateway/design.md)
- [Requirements Document](../.kiro/specs/setu-voice-ondc-gateway/requirements.md)

## Support

For issues or questions, refer to the main project documentation or create an issue in the project repository.
