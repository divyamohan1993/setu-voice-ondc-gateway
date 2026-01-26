"use client";

/**
 * Home Page
 * 
 * Main application page for the Setu Voice-to-ONDC Gateway.
 * Implements the complete voice-to-catalog-to-broadcast flow.
 * 
 * Flow:
 * 1. User selects voice scenario from VoiceInjector
 * 2. System translates voice to Beckn Protocol JSON
 * 3. VisualVerifier displays catalog as visual card
 * 4. User confirms and broadcasts catalog
 * 5. Network simulator generates buyer bid
 * 6. Toast notification shows bid result
 */

import { useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { translateVoiceAction, saveCatalogAction, broadcastCatalogAction } from "@/app/actions";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import type { BuyerBid } from "@/lib/network-simulator";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Code splitting: Lazy load heavy components
const VoiceInjector = dynamic(
  () => import("@/components/VoiceInjector").then(mod => ({ default: mod.VoiceInjector })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const VisualVerifier = dynamic(
  () => import("@/components/VisualVerifier").then(mod => ({ default: mod.VisualVerifier })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const BroadcastLoader = dynamic(
  () => import("@/components/ui/BroadcastLoader").then(mod => ({ default: mod.BroadcastLoader })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const BuyerBidNotification = dynamic(
  () => import("@/components/ui/BuyerBidNotification").then(mod => ({ default: mod.BuyerBidNotification })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export default function Home() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [catalog, setCatalog] = useState<BecknCatalogItem | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [buyerBid, setBuyerBid] = useState<BuyerBid | null>(null);

  // Default farmer ID (from seed data)
  const FARMER_ID = "farmer-1";

  /**
   * Handle scenario selection and translation
   */
  const handleScenarioSelect = async (voiceText: string) => {
    try {
      setIsTranslating(true);
      setCatalog(null);
      setCatalogId(null);
      setBuyerBid(null);

      // Translate voice to catalog
      const translateResult = await translateVoiceAction(voiceText);

      if (!translateResult.success || !translateResult.catalog) {
        toast.error(translateResult.error || "Translation failed");
        return;
      }

      // Save catalog to database
      const saveResult = await saveCatalogAction(FARMER_ID, translateResult.catalog);

      if (!saveResult.success || !saveResult.catalogId) {
        toast.error(saveResult.error || "Failed to save catalog");
        return;
      }

      // Update state
      setCatalog(translateResult.catalog);
      setCatalogId(saveResult.catalogId);
      
      toast.success("Voice translated to catalog successfully!");
    } catch (error) {
      console.error("Translation flow error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsTranslating(false);
    }
  };

  /**
   * Handle catalog broadcast
   */
  const handleBroadcast = async () => {
    if (!catalogId) {
      toast.error("No catalog to broadcast");
      return;
    }

    try {
      setIsBroadcasting(true);
      setBuyerBid(null);

      // Broadcast catalog
      const result = await broadcastCatalogAction(catalogId);

      if (!result.success || !result.bid) {
        toast.error(result.error || "Broadcast failed");
        return;
      }

      // Show buyer bid
      setBuyerBid(result.bid);
      
      toast.success("Catalog broadcasted successfully!");
    } catch (error) {
      console.error("Broadcast flow error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Setu</h1>
            <p className="text-sm text-muted-foreground">Voice-to-ONDC Gateway</p>
          </div>
          
          <Link href="/debug">
            <Button variant="outline" size="sm" className="gap-2">
              <Bug className="h-4 w-4" />
              Debug Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Voice Injector */}
        <div className="flex justify-center">
          <VoiceInjector
            onScenarioSelect={handleScenarioSelect}
            isProcessing={isTranslating}
          />
        </div>

        {/* Visual Verifier */}
        <AnimatePresence mode="wait">
          {catalog && !isBroadcasting && (
            <motion.div
              key="verifier"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <VisualVerifier
                catalog={catalog}
                onBroadcast={handleBroadcast}
                isBroadcasting={isBroadcasting}
              />
            </motion.div>
          )}

          {/* Broadcast Loader */}
          {isBroadcasting && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <BroadcastLoader />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buyer Bid Notification */}
        <AnimatePresence>
          {buyerBid && (
            <motion.div
              key="bid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <BuyerBidNotification bid={buyerBid} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by Next.js 15 • Beckn Protocol • Vercel AI SDK</p>
        </div>
      </footer>
    </div>
  );
}
