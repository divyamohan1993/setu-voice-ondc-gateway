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
 * WCAG 2.1 Compliant: Allows user scaling for accessibility
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // WCAG 1.4.4: Allow zooming up to 500%
  userScalable: true, // WCAG compliance: users must be able to zoom
  themeColor: "#FFFFFF", // Official Government Light Theme
  colorScheme: "light",
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

        {/* Theme color for mobile browsers - Official Government White */}
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className="antialiased font-sans bg-white text-gray-900 overflow-hidden"
        style={{
          fontFamily: "var(--font-noto-sans), var(--font-noto-devanagari), system-ui, sans-serif"
        }}
      >
        {/* WCAG 2.4.1: Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#1A365D] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[#E07800]"
          tabIndex={0}
        >
          Skip to main content / मुख्य सामग्री पर जाएं
        </a>

        {/* WCAG: Main content landmark */}
        <main id="main-content" role="main" aria-label="Setu Voice Commerce">
          {children}
        </main>

        {/* WCAG: Live region for screen reader announcements */}
        <div
          id="aria-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* WCAG: Assertive announcements for urgent messages */}
        <div
          id="aria-alert-region"
          role="alert"
          aria-live="assertive"
          className="sr-only"
        />

        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #D1D5DB",
              color: "#1F2937",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }
          }}
        />
      </body>
    </html>
  );
}

