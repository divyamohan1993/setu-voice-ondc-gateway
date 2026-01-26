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