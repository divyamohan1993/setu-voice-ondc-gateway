import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable telemetry
  experimental: {
    // Add any experimental features here if needed
  },
};

export default nextConfig;
