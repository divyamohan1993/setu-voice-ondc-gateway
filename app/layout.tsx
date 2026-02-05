import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/**
 * Modern Typography - Tech + Agriculture Fusion
 * Inter for body, Poppins for headings
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/**
 * SEO Metadata for AgriVox
 */
export const metadata: Metadata = {
  title: "AgriVox | Smart Agriculture Voice Platform",
  description: "Voice-powered smart agriculture platform. Access markets, get real-time prices, and manage your farm - all through voice in 12 Indian languages.",
  keywords: [
    "Smart Agriculture", "Voice AI", "Farmers", "ONDC", "Mandi Prices",
    "IoT Agriculture", "Farm Management", "India", "Gemini AI",
    "Digital Agriculture", "AgriTech", "Voice Commerce"
  ],
  authors: [{ name: "AgriVox Team" }],
  creator: "AgriVox - Smart Agriculture Platform",
  publisher: "AgriVox",
  robots: "index, follow",
  manifest: "/manifest.json",
  applicationName: "AgriVox",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AgriVox",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN", "mr_IN", "ta_IN", "te_IN"],
    url: "https://agrivox.in",
    title: "AgriVox | Smart Agriculture Voice Platform",
    description: "Voice-powered smart agriculture platform for Indian farmers.",
    siteName: "AgriVox",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgriVox - Smart Agriculture Voice Platform",
    description: "Empowering farmers with voice AI and real-time market access",
  },
};

/**
 * Viewport Configuration
 * WCAG 2.1 Compliant - Allows user scaling
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0D1117",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${poppins.variable} dark`}
    >
      <head>
        {/* Preload Fonts */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* PWA Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Theme */}
        <meta name="theme-color" content="#0D1117" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className="antialiased font-sans min-h-[100dvh] overflow-auto"
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif"
        }}
      >
        {/* WCAG 2.4.1: Skip Navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:outline-none"
          tabIndex={0}
        >
          Skip to main content
        </a>

        {/* Main Content */}
        <main id="main-content" role="main" aria-label="AgriVox Smart Agriculture">
          {children}
        </main>

        {/* Accessibility Live Regions */}
        <div
          id="aria-live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        <div
          id="aria-alert-region"
          role="alert"
          aria-live="assertive"
          className="sr-only"
        />

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: "rgba(22, 27, 34, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(48, 54, 61, 0.5)",
              color: "#F8FAFC",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }
          }}
        />
      </body>
    </html>
  );
}
