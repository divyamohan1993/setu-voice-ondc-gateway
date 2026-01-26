"use client";

/**
 * VisualVerifier Component
 * 
 * Displays catalog data as an accessible visual card with minimal text.
 * Designed for illiterate farmers to verify product listings through
 * visual icons, images, and high-contrast elements.
 * 
 * Features:
 * - Large commodity icons (128x128px)
 * - Price badge with large font and currency symbol
 * - Quantity indicator with visual representation
 * - Logistics provider logo display
 * - Thumbprint broadcast button (120x120px)
 * - Framer Motion animations
 * - High-contrast colors
 * - Minimal text
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Fingerprint, 
  Package, 
  IndianRupee, 
  Truck, 
  CheckCircle2,
  Loader2,
  Apple,
  Wheat,
  Carrot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BecknCatalogItem } from "@/lib/beckn-schema";

/**
 * VisualVerifierProps
 * 
 * Props for the VisualVerifier component
 */
export interface VisualVerifierProps {
  catalog: BecknCatalogItem;
  onBroadcast: () => Promise<void>;
  isBroadcasting: boolean;
}

/**
 * Commodity icon mapping
 * Maps product names to icon components
 */
function getCommodityIcon(productName: string) {
  const name = productName.toLowerCase();
  
  if (name.includes("onion") || name.includes("pyaaz") || name.includes("tomato") || name.includes("tamatar") || name.includes("potato") || name.includes("aloo")) {
    return Carrot;
  }
  
  if (name.includes("mango") || name.includes("aam") || name.includes("apple")) {
    return Apple;
  }
  
  if (name.includes("wheat") || name.includes("gehun") || name.includes("rice") || name.includes("chawal")) {
    return Wheat;
  }
  
  // Default icon
  return Package;
}

/**
 * Get commodity icon color based on product type
 */
function getCommodityColor(productName: string) {
  const name = productName.toLowerCase();
  
  if (name.includes("onion") || name.includes("pyaaz")) {
    return "from-purple-400 to-pink-500";
  }
  
  if (name.includes("mango") || name.includes("aam")) {
    return "from-yellow-400 to-orange-500";
  }
  
  if (name.includes("wheat") || name.includes("gehun")) {
    return "from-amber-400 to-yellow-600";
  }
  
  if (name.includes("tomato") || name.includes("tamatar")) {
    return "from-red-400 to-red-600";
  }
  
  if (name.includes("potato") || name.includes("aloo")) {
    return "from-amber-600 to-brown-500";
  }
  
  // Default color
  return "from-green-400 to-blue-500";
}

/**
 * Get logistics provider logo path
 */
function getLogisticsLogo(provider?: string): string {
  if (!provider) return "/logos/india-post.png";
  
  const providerLower = provider.toLowerCase();
  
  if (providerLower.includes("india post")) {
    return "/logos/india-post.png";
  }
  
  if (providerLower.includes("delhivery")) {
    return "/logos/delhivery.png";
  }
  
  if (providerLower.includes("bluedart") || providerLower.includes("blue dart")) {
    return "/logos/bluedart.png";
  }
  
  // Default
  return "/logos/india-post.png";
}

/**
 * Render quantity visual indicators (bag icons)
 */
function QuantityIndicator({ count, unit }: { count: number; unit: string }) {
  // Show up to 5 bag icons for visual representation
  const displayCount = Math.min(count > 100 ? 5 : Math.ceil(count / 20), 5);
  
  return (
    <div className="flex items-center gap-3">
      <div className