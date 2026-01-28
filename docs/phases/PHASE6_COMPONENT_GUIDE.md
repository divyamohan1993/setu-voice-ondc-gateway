# Phase 6 Component Usage Guide

## Quick Reference

This guide provides usage examples for all Phase 6 components.

## 1. VoiceInjector Component

### Import
```typescript
import { VoiceInjector } from "@/components/VoiceInjector";
```

### Usage
```typescript
<VoiceInjector
  onScenarioSelect={async (text: string) => {
    // Handle voice text translation
    console.log("Voice input:", text);
  }}
  isProcessing={false}
/>
```

### Props
- `onScenarioSelect`: Async function called when user selects a scenario
- `isProcessing`: Boolean to show loading state

### Features
- 4 pre-configured scenarios
- Animated dropdown
- Loading state with pulsing icon
- Large touch targets

---

## 2. VisualVerifier Component

### Import
```typescript
import { VisualVerifier } from "@/components/VisualVerifier";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
```

### Usage
```typescript
const catalog: BecknCatalogItem = {
  descriptor: {
    name: "Nasik Onions",
    symbol: "/icons/onion.png"
  },
  price: {
    value: 40,
    currency: "INR"
  },
  quantity: {
    available: { count: 500 },
    unit: "kg"
  },
  tags: {
    grade: "A",
    perishability: "medium",
    logistics_provider: "India Post"
  }
};

<VisualVerifier
  catalog={catalog}
  onBroadcast={async () => {
    // Handle broadcast action
    console.log("Broadcasting catalog...");
  }}
  isBroadcasting={false}
/>
```

### Props
- `catalog`: BecknCatalogItem object
- `onBroadcast`: Async function called when user clicks broadcast button
- `isBroadcasting`: Boolean to show broadcasting state

### Features
- Large commodity icon (128x128px)
- Price badge with  symbol
- Quantity visual indicators
- Thumbprint broadcast button (120x120px)
- Confetti animation on success

---

## 3. NetworkLogViewer Component

### Import
```typescript
import { NetworkLogViewer } from "@/components/NetworkLogViewer";
```

### Usage
```typescript
<NetworkLogViewer
  farmerId="farmer-1"
  limit={10}
  autoRefresh={true}
  refreshInterval={5000}
/>
```

### Props
- `farmerId` (optional): Filter logs by farmer ID
- `limit` (optional): Number of logs per page (default: 10)
- `autoRefresh` (optional): Enable auto-refresh (default: false)
- `refreshInterval` (optional): Refresh interval in ms (default: 5000)

### Features
- Color-coded event types
- Expandable log entries
- JSON syntax highlighting
- Filter dropdown
- Pagination controls
- Auto-refresh capability

---

## 4. LoadingSpinner Component

### Import
```typescript
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
```

### Usage
```typescript
<LoadingSpinner size="md" text="Loading..." />
```

### Props
- `size` (optional): "sm" | "md" | "lg" | "xl" (default: "md")
- `className` (optional): Additional CSS classes
- `text` (optional): Text to display next to spinner

### Sizes
- `sm`: 16x16px
- `md`: 24x24px
- `lg`: 32x32px
- `xl`: 48x48px

---

## 5. ErrorNotification Component

### Import
```typescript
import { ErrorNotification } from "@/components/ui/ErrorNotification";
```

### Usage
```typescript
<ErrorNotification
  title="Error"
  message="Something went wrong"
  onDismiss={() => console.log("Dismissed")}
  show={true}
/>
```

### Props
- `message`: Error message to display
- `title` (optional): Error title (default: "Error")
- `onDismiss` (optional): Function called when user dismisses
- `show` (optional): Control visibility (default: true)

### Features
- High-contrast red color scheme
- Alert icon
- Dismiss button
- Smooth animations

---

## 6. BroadcastLoader Component

### Import
```typescript
import { BroadcastLoader } from "@/components/ui/BroadcastLoader";
```

### Usage
```typescript
<BroadcastLoader message="Broadcasting to network..." />
```

### Props
- `message` (optional): Custom loading message

### Features
- Animated radio waves
- Pulsing gradient background
- Network-themed visuals
- Loading spinner

---

## 7. BuyerBidNotification Component

### Import
```typescript
import { BuyerBidNotification } from "@/components/ui/BuyerBidNotification";
import type { BuyerBid } from "@/lib/network-simulator";
```

### Usage
```typescript
const bid: BuyerBid = {
  buyerName: "Reliance Fresh",
  bidAmount: 42.50,
  timestamp: new Date(),
  buyerLogo: "/logos/reliance.png"
};

<BuyerBidNotification
  bid={bid}
  onDismiss={() => console.log("Dismissed")}
/>
```

### Props
- `bid`: BuyerBid object with buyer details
- `onDismiss` (optional): Function called when user dismisses

### Features
- Success animation
- Buyer information display
- Bid amount with  symbol
- Timestamp
- Celebration badge

---

## Complete Flow Example

```typescript
"use client";

import { useState } from "react";
import { VoiceInjector } from "@/components/VoiceInjector";
import { VisualVerifier } from "@/components/VisualVerifier";
import { BroadcastLoader } from "@/components/ui/BroadcastLoader";
import { BuyerBidNotification } from "@/components/ui/BuyerBidNotification";
import { ErrorNotification } from "@/components/ui/ErrorNotification";
import { translateVoiceAction, saveCatalogAction, broadcastCatalogAction } from "@/app/actions";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import type { BuyerBid } from "@/lib/network-simulator";

export default function MyPage() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [catalog, setCatalog] = useState<BecknCatalogItem | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [bid, setBid] = useState<BuyerBid | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScenarioSelect = async (voiceText: string) => {
    try {
      setIsTranslating(true);
      setError(null);

      // Translate voice to catalog
      const result = await translateVoiceAction(voiceText);
      if (!result.success || !result.catalog) {
        setError(result.error || "Translation failed");
        return;
      }

      // Save catalog
      const saveResult = await saveCatalogAction("farmer-1", result.catalog);
      if (!saveResult.success || !saveResult.catalogId) {
        setError(saveResult.error || "Failed to save");
        return;
      }

      setCatalog(result.catalog);
      setCatalogId(saveResult.catalogId);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleBroadcast = async () => {
    if (!catalogId) return;

    try {
      setIsBroadcasting(true);
      setError(null);

      const result = await broadcastCatalogAction(catalogId);
      if (!result.success || !result.bid) {
        setError(result.error || "Broadcast failed");
        return;
      }

      setBid(result.bid);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Error Notification */}
      {error && (
        <ErrorNotification
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Voice Injector */}
      <VoiceInjector
        onScenarioSelect={handleScenarioSelect}
        isProcessing={isTranslating}
      />

      {/* Visual Verifier */}
      {catalog && !isBroadcasting && (
        <VisualVerifier
          catalog={catalog}
          onBroadcast={handleBroadcast}
          isBroadcasting={isBroadcasting}
        />
      )}

      {/* Broadcast Loader */}
      {isBroadcasting && <BroadcastLoader />}

      {/* Buyer Bid Notification */}
      {bid && <BuyerBidNotification bid={bid} />}
    </div>
  );
}
```

---

## Styling Guidelines

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)

### Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px or larger
- Broadcast button: 120x120px

### Contrast Ratios
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Animations
- Duration: 0.3s - 0.6s
- Easing: Spring or ease-out
- Purpose: Guide attention, provide feedback

---

## Best Practices

1. **Always handle errors**: Use ErrorNotification for user-facing errors
2. **Show loading states**: Use LoadingSpinner or BroadcastLoader during async operations
3. **Provide feedback**: Use animations and visual cues for all interactions
4. **Keep it simple**: Minimize text, maximize visual communication
5. **Test accessibility**: Ensure all interactive elements are keyboard accessible
6. **Use high contrast**: Maintain 4.5:1 contrast ratio for all text
7. **Large touch targets**: Make buttons and interactive elements easy to tap

---

## Troubleshooting

### Component not rendering
- Check that all required props are provided
- Verify imports are correct
- Check console for errors

### Animations not working
- Ensure Framer Motion is installed
- Check that AnimatePresence wraps conditional components
- Verify motion components have initial/animate props

### Styling issues
- Ensure Tailwind CSS is configured correctly
- Check that global styles are imported
- Verify CSS classes are valid

### Server Actions failing
- Check that functions are marked with "use server"
- Verify database connection
- Check environment variables

---

## Support

For issues or questions:
1. Check the implementation summary: `PHASE6_IMPLEMENTATION_SUMMARY.md`
2. Review the design document: `.kiro/specs/setu-voice-ondc-gateway/design.md`
3. Check the requirements: `.kiro/specs/setu-voice-ondc-gateway/requirements.md`
