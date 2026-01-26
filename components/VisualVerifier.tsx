"use client";

/**
 * VisualVerifier Component
 * 
 * Displays catalog data as an accessible visual card with minimal text.
 * Designed for illiterate farmers to verify product listings through visual icons and images.
 * 
 * Features:
 * - Large commodity icons (128x128px)
 * - High-contrast price badge with large font
 * - Visual quantity indicators
 * - Logistics provider logo display
 * - Thumbprint broadcast button (120x120px)
 * - Framer Motion animations
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, CheckCircle2, Package, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BecknCatalogItem } from "@/lib/beckn-schema";

/**
 * VisualVerifierProps
 */
export interface VisualVerifierProps {
  catalog: BecknCatalogItem;
  onBroadcast: () => Promise<void>;
  isBroadcasting: boolean;
}

/**
 * Commodity icon mapping
 * Maps product names to emoji icons
 */
function getCommodityIcon(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes("onion") || name.includes("pyaaz")) return "🧅";
  if (name.includes("mango") || name.includes("aam")) return "🥭";
  if (name.includes("tomato") || name.includes("tamatar")) return "🍅";
  if (name.includes("potato") || name.includes("aloo")) return "🥔";
  if (name.includes("wheat") || name.includes("gehun")) return "🌾";
  if (name.includes("rice") || name.includes("chawal")) return "🌾";
  
  return "📦"; // Default icon
}

/**
 * Logistics provider logo mapping
 */
function getLogisticsIcon(provider?: string): string {
  if (!provider) return "🚚";
  
  const name = provider.toLowerCase();
  
  if (name.includes("india post")) return "📮";
  if (name.includes("delhivery")) return "🚚";
  if (name.includes("bluedart") || name.includes("blue dart")) return "✈️";
  
  return "🚚";
}

/**
 * VisualVerifier Component
 */
export function VisualVerifier({ catalog, onBroadcast, isBroadcasting }: VisualVerifierProps) {
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleBroadcast = async () => {
    await onBroadcast();
    setBroadcastSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const commodityIcon = getCommodityIcon(catalog.descriptor.name);
  const logisticsIcon = getLogisticsIcon(catalog.tags.logistics_provider);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="w-full max-w-2xl border-2 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* Commodity Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-[128px] leading-none"
            >
              {commodityIcon}
            </motion.div>

            {/* Product Name */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center"
            >
              {catalog.descriptor.name}
            </motion.h2>

            {/* Price Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Badge className="px-6 py-3 text-2xl font-bold bg-green-600 hover:bg-green-700">
                ₹{catalog.price.value} per {catalog.quantity.unit}
              </Badge>
            </motion.div>

            {/* Quantity Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-xl"
            >
              <Package className="h-8 w-8 text-primary" />
              <span className="font-semibold">
                {catalog.quantity.available.count} {catalog.quantity.unit} available
              </span>
            </motion.div>

            {/* Quality Grade */}
            {catalog.tags.grade && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2"
              >
                <Badge variant="outline" className="px-4 py-2 text-lg">
                  Grade: {catalog.tags.grade}
                </Badge>
              </motion.div>
            )}

            {/* Logistics Provider */}
            {catalog.tags.logistics_provider && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 text-lg text-muted-foreground"
              >
                <span className="text-4xl">{logisticsIcon}</span>
                <span>{catalog.tags.logistics_provider}</span>
              </motion.div>
            )}

            {/* Broadcast Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-4"
            >
              <Button
                onClick={handleBroadcast}
                disabled={isBroadcasting || broadcastSuccess}
                size="lg"
                className="h-32 w-32 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                {isBroadcasting ? (
                  <Loader2 className="h-12 w-12 animate-spin" />
                ) : broadcastSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Fingerprint className="h-12 w-12" />
                    <span className="text-xs">Broadcast</span>
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Broadcast Success Animation */}
            {broadcastSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Catalog broadcasted to buyer network!
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
