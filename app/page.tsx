"use client";

/**
 * Home Page - Setu Voice-to-ONDC Gateway
 * 
 * Steve Jobs-inspired single-button interface.
 * Voice-first design for illiterate farmers.
 * 
 * Features:
 * - One giant button to start
 * - Support for 12 Indian languages
 * - No reading or writing required
 * - Works on cheapest smartphones
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
