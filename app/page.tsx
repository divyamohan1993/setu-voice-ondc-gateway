"use client";

/**
 * Home Page - Setu Voice-to-ONDC Gateway
 * 
 * Formal, futuristic voice-first interface for farmers.
 * "Farmer is King" - Empowering users with direct market access.
 * 
 * Features:
 * - Intuitive voice interaction
 * - Support for 12 Indian languages
 * - Context-aware "Farmer First" design
 * - Works on all smartphones
 */

import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load the main component for faster initial load
const SetuVoice = dynamic(
  () => import("@/components/SetuVoice").then((mod) => ({ default: mod.SetuVoice })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <LoadingSpinner />
      </div>
    ),
    ssr: false, // Disable SSR for speech APIs
  }
);

export default function Home() {
  return <SetuVoice />;
}
