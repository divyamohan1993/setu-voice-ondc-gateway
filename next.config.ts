import type { NextConfig } from "next";

/**
 * Next.js Configuration - Production Grade
 * 
 * Setu Voice-to-ONDC Gateway
 * 
 * This configuration is optimized for production deployment with:
 * - Standalone output for Docker/containerized deployment
 * - Optimized image handling
 * - Security headers
 * - Performance optimizations
 */
const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization configuration
  images: {
    // Enable modern image formats for better compression
    formats: ['image/webp', 'image/avif'],

    // Define image sizes for responsive loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Security settings for images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // Enable optimization
    unoptimized: false,
  },

  // Bundle optimization
  compiler: {
    // Remove console logs in production (keep errors and warnings)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // TypeScript strict mode
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },


  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(self)'
          }
        ],
      },
    ];
  },

  // Environment variables to be exposed to the client
  env: {
    // App version for tracking
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    // ONDC simulation mode indicator
    NEXT_PUBLIC_ONDC_SIMULATION: 'true',
    // Protocol version
    NEXT_PUBLIC_BECKN_VERSION: '1.2.0',
    // ONDC domain
    NEXT_PUBLIC_ONDC_DOMAIN: 'ONDC:AGR10',
  },

  // Disable telemetry
  experimental: {
    // Performance optimizations
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Power by header (remove for security)
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // React strict mode for better debugging
  reactStrictMode: true,
};

export default nextConfig;
