"use client";

/**
 * AgriVox - Smart Agriculture Voice Platform
 * 
 * A modern voice-first interface for farmers:
 * - Real-time market access through voice
 * - Multi-language support (12+ Indian languages)
 * - IoT-ready architecture
 * - AI-powered price recommendations
 */

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load the main interface
const AgriVoxInterface = dynamic(
  () => import("@/components/AgriVoxInterface").then((mod) => ({ default: mod.AgriVoxInterface })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <LoadingSpinner size="lg" text="Initializing AgriVox..." />
      </div>
    ),
    ssr: false,
  }
);

export default function Home() {
  return <AgriVoxInterface />;
}
