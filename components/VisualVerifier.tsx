"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Loader2, CheckCircle2, Package, TrendingUp, Sparkles, RefreshCcw, AlertTriangle, Volume2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import { getCommodityIconFromProduct, getLogisticsLogo } from "@/lib/icon-mapper";
import { cn } from "@/lib/utils";

export interface VisualVerifierProps {
  catalog: BecknCatalogItem;
  onBroadcast: () => Promise<void>;
  onRetry: () => void;
  isBroadcasting: boolean;
}

export function VisualVerifier({ catalog, onBroadcast, onRetry, isBroadcasting }: VisualVerifierProps) {
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Validation checks
  const isPriceMissing = catalog.price.value === 0;
  const isQtyMissing = catalog.quantity.available.count === 0;
  const isNameUnknown = catalog.descriptor.name === "Unknown Commodity" || catalog.descriptor.name === "";

  // Allow missing price/qty for "Get Quote" flow
  const isCriticalMissing = isNameUnknown;
  const isQuoteRequest = isPriceMissing || isQtyMissing;

  // Speak summary on mount
  useEffect(() => {
    const speakSummary = () => {
      if ('speechSynthesis' in window) {
        const name = isNameUnknown ? "Unknown crop" : catalog.descriptor.name;
        const qty = isQtyMissing ? "Quantity unknown" : `${catalog.quantity.available.count} ${catalog.quantity.unit}`;
        const price = isPriceMissing ? "Price unknown" : `${catalog.price.value} rupees`;

        // Hindi-ish synthesis attempt (best effort)
        const text = `Aapne kaha: ${name}, ${qty}, ${price}. Kya ye sahi hai?`;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN';
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    };

    // Small delay to allow UI to settle
    const timer = setTimeout(speakSummary, 500);
    return () => clearTimeout(timer);
  }, [catalog, isNameUnknown, isQtyMissing, isPriceMissing]);

  const handleBroadcast = async () => {
    if (isCriticalMissing) return;
    await onBroadcast();
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const commodityIconPath = getCommodityIconFromProduct(catalog.descriptor.name);
  const logisticsLogoPath = catalog.tags.logistics_provider
    ? getLogisticsLogo(catalog.tags.logistics_provider)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <Card className="border-0 shadow-2xl bg-white overflow-hidden rounded-3xl">
        <div className="bg-orange-50 p-4 text-center border-b border-orange-100">
          <h2 className="text-xl font-bold text-orange-900 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Verify Details (जांच करें)
          </h2>
        </div>

        <CardContent className="p-6 space-y-8">
          {/* Commodity Section */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 relative mb-4">
              <Image
                src={commodityIconPath}
                alt={catalog.descriptor.name}
                fill
                className="object-contain drop-shadow-lg"
              />
              {isNameUnknown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <AlertTriangle className="w-12 h-12 text-yellow-400" />
                </div>
              )}
            </div>

            <h1 className={cn(
              "text-3xl font-black text-center",
              isNameUnknown ? "text-red-500" : "text-gray-900"
            )}>
              {isNameUnknown ? "Fasal Batayein?" : catalog.descriptor.name}
            </h1>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className={cn(
              "p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors",
              isQtyMissing ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-100"
            )}>
              <Package className={cn("w-8 h-8 mb-2", isQtyMissing ? "text-red-400" : "text-blue-500")} />
              <span className="text-xs font-semibold text-gray-500 uppercase">Matra (Qty)</span>
              <span className={cn("text-xl font-bold", isQtyMissing ? "text-red-600" : "text-gray-800")}>
                {isQtyMissing ? "?" : `${catalog.quantity.available.count} ${catalog.quantity.unit}`}
              </span>
            </div>

            {/* Price */}
            <div className={cn(
              "p-4 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors",
              isPriceMissing ? "bg-red-50 border-red-200" : "bg-green-50 border-green-100"
            )}>
              <span className={cn("text-3xl font-bold mb-1", isPriceMissing ? "text-red-400" : "text-green-600")}>₹</span>
              <span className="text-xs font-semibold text-gray-500 uppercase">Keemat (Price)</span>
              <span className={cn("text-xl font-bold", isPriceMissing ? "text-red-600" : "text-gray-800")}>
                {isPriceMissing ? "?" : catalog.price.value}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {isCriticalMissing && (
            <div className="bg-red-100 text-red-800 p-4 rounded-xl text-center font-medium animate-pulse flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Kuch jaankari missing hai.<br />Kripya dobara bolein.
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Retry Button */}
            <Button
              variant="outline"
              onClick={onRetry}
              className="h-24 rounded-2xl flex flex-col gap-2 hover:bg-gray-50 border-2"
            >
              <RefreshCcw className="w-8 h-8 text-gray-500" />
              <span className="text-lg font-semibold text-gray-600">Dobara (Retry)</span>
            </Button>

            {/* Confirm/Broadcast Button */}
            <Button
              onClick={handleBroadcast}
              disabled={isBroadcasting || broadcastSuccess || isCriticalMissing}
              className={cn(
                "h-24 rounded-2xl flex flex-col gap-2 shadow-lg transition-all",
                isCriticalMissing
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {isBroadcasting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : broadcastSuccess ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <Fingerprint className="w-10 h-10" />
              )}
              <span className="text-lg font-bold">
                {broadcastSuccess ? "Sent!" : isQuoteRequest ? "Bhav Poochhein (Get Quote)" : "Bechein (Sell)"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
