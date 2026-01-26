"use client";

/**
 * VisualVerifier Component
 * 
 * Displays catalog data as an accessible visual card with minimal text.
 * Designed for illiterate farmers to verify product listings through visual icons and images.
 * 
 * Features:
 * - Large commodity icons (128x128px)
 * - High-contrast price badge with large font (32px)
 * - Visual quantity indicators with bag icons
 * - Logistics provider logo display (64x64px)
 * - Thumbprint broadcast button (120x120px)
 * - Framer Motion animations for card entrance, button interactions, and success
 * - High-contrast colors and minimal text for accessibility
 * 
 * **Validates: Requirements 4, 5, 10**
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Loader2, CheckCircle2, Package, TrendingUp, Sparkles } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import { getCommodityIconFromProduct, getLogisticsLogo } from "@/lib/icon-mapper";

/**
 * VisualVerifierProps
 */
export interface VisualVerifierProps {
  catalog: BecknCatalogItem;
  onBroadcast: () => Promise<void>;
  isBroadcasting: boolean;
}

/**
 * Confetti animation component
 * Displays celebratory confetti particles on broadcast success
 */
function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((i) => (
        <motion.div
          key={i}
          initial={{
            x: "50%",
            y: "50%",
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: `${50 + (Math.random() - 0.5) * 200}%`,
            y: `${50 + (Math.random() - 0.5) * 200}%`,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: i * 0.02,
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: [
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#FFA07A",
              "#98D8C8",
              "#F7DC6F",
            ][i % 6],
          }}
        />
      ))}
    </div>
  );
}

/**
 * VisualVerifier Component
 */
export function VisualVerifier({ catalog, onBroadcast, isBroadcasting }: VisualVerifierProps) {
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleBroadcast = async () => {
    await onBroadcast();
    setBroadcastSuccess(true);
    
    // Reset success state after animation
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  // Get icon paths using icon-mapper utility
  const commodityIconPath = getCommodityIconFromProduct(catalog.descriptor.name);
  const logisticsLogoPath = catalog.tags.logistics_provider 
    ? getLogisticsLogo(catalog.tags.logistics_provider)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      <Card className="w-full max-w-2xl border-4 border-primary/20 shadow-2xl bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center space-y-8">
            {/* Commodity Icon - 128x128px */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 200,
                damping: 15 
              }}
              className="relative w-32 h-32"
            >
              <Image
                src={commodityIconPath}
                alt={catalog.descriptor.name}
                width={128}
                height={128}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Product Name - Minimal text, large font */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              {catalog.descriptor.name}
            </motion.h2>

            {/* Price Badge - Large font (32px) with currency symbol */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
            >
              <Badge className="px-8 py-4 text-3xl md:text-4xl font-bold bg-green-600 hover:bg-green-700 shadow-xl border-2 border-green-400">
                ₹{catalog.price.value} / {catalog.quantity.unit}
              </Badge>
            </motion.div>

            {/* Quantity Indicator with visual representation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 text-2xl md:text-3xl bg-muted/50 px-6 py-3 rounded-full"
            >
              <Package className="h-10 w-10 text-primary" strokeWidth={2.5} />
              <span className="font-bold text-foreground">
                {catalog.quantity.available.count} {catalog.quantity.unit}
              </span>
            </motion.div>

            {/* Quality Grade Badge */}
            {catalog.tags.grade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Badge 
                  variant="outline" 
                  className="px-6 py-3 text-xl md:text-2xl font-semibold border-2 border-primary/50 bg-primary/5"
                >
                  Grade: {catalog.tags.grade}
                </Badge>
              </motion.div>
            )}

            {/* Logistics Provider Logo - 64x64px */}
            {logisticsLogoPath && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={logisticsLogoPath}
                    alt={catalog.tags.logistics_provider || "Logistics"}
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <span className="text-lg text-muted-foreground font-medium">
                  {catalog.tags.logistics_provider}
                </span>
              </motion.div>
            )}

            {/* Thumbprint Broadcast Button - 120x120px */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="pt-6 relative"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                <Button
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || broadcastSuccess}
                  size="lg"
                  className="h-32 w-32 rounded-full text-lg font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary border-4 border-primary/30"
                >
                  <AnimatePresence mode="wait">
                    {isBroadcasting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Loader2 className="h-14 w-14 animate-spin" strokeWidth={3} />
                      </motion.div>
                    ) : broadcastSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 className="h-14 w-14 text-green-400" strokeWidth={3} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <motion.div
                          animate={isHovering ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: isHovering ? Infinity : 0 }}
                        >
                          <Fingerprint className="h-14 w-14" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-sm font-semibold">Broadcast</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              {/* Confetti Animation on Success */}
              <AnimatePresence>
                {broadcastSuccess && <ConfettiAnimation />}
              </AnimatePresence>
            </motion.div>

            {/* Broadcast Success Message with Animation */}
            <AnimatePresence>
              {broadcastSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-center bg-green-50 dark:bg-green-950 px-6 py-4 rounded-2xl border-2 border-green-500"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: 2 }}
                  >
                    <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 flex items-center justify-center gap-3">
                      <Sparkles className="h-7 w-7" />
                      Catalog Broadcasted!
                      <Sparkles className="h-7 w-7" />
                    </p>
                  </motion.div>
                  <p className="text-base text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sent to buyer network
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
