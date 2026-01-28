import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * Fonts optimized for Indian languages
 * Noto Sans for Latin, Noto Sans Devanagari for Hindi/Marathi
 */
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * Metadata for SEO and PWA
 */
export const metadata: Metadata = {
  title: "सेतु - बोलकर बेचें | Setu Voice Market",
  description: "बोलकर अपनी फसल बेचें। Voice-first marketplace for farmers. No reading or writing required. 12 भारतीय भाषाओं में उपलब्ध।",
  keywords: [
    "ONDC", "Beckn Protocol", "Voice Commerce", "Agriculture", "Farmers",
    "किसान", "मंडी", "फसल", "बोलकर बेचें", "Hindi", "Marathi", "Tamil", "Telugu"
  ],
  authors: [{ name: "Setu Team" }],
  creator: "Setu Voice-to-ONDC Gateway",
  publisher: "AI for Bharat",
  robots: "index, follow",
  manifest: "/manifest.json",
  applicationName: "Setu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "सेतु",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: ["en_IN", "mr_IN", "ta_IN", "te_IN"],
    url: "https://setu.ondc.org",
    title: "सेतु - बोलकर बेचें | Voice Market",
    description: "बोलकर अपनी फसल बेचें। Voice marketplace for Indian farmers.",
    siteName: "Setu",
  },
  twitter: {
    card: "summary_large_image",
    title: "सेतु - बोलकर बेचें",
    description: "Voice marketplace for Indian farmers",
  },
};

/**
 * Viewport settings for mobile optimization
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent zoom issues with voice UI
  themeColor: "#1a1a2e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoSansDevanagari.variable}`}
    >
      <head>
        {/* Preload critical fonts for Indian languages */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className="antialiased font-sans bg-[#1a1a2e] text-white overflow-hidden"
        style={{
          fontFamily: "var(--font-noto-sans), var(--font-noto-devanagari), system-ui, sans-serif"
        }}
      >
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "rgba(26, 26, 46, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white",
              backdropFilter: "blur(10px)",
            }
          }}
        />
      </body>
    </html>
  );
}
