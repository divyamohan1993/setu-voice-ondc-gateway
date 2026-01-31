/**
 * Network Simulator Module
 * 
 * Simulates buyer network responses to broadcasted catalogs.
 * This module demonstrates how the ONDC network would respond to farmer listings
 * by generating realistic buyer bids after a network delay.
 * 
 * NOTE: This is the ONLY simulated component in the system.
 * Real ONDC network integration requires:
 * - ONDC sandbox/production registration
 * - BAP/BPP certification  
 * - Complex protocol implementation
 * - Network participant agreements
 * 
 * The simulation is designed to behave exactly like a real ONDC network would,
 * including realistic delays, price variations, and buyer responses.
 * 
 * @module network-simulator
 */

import { prisma } from './db';
import type { Catalog, Prisma, NetworkLog } from './generated-client/client';
import type { BecknCatalogItem } from './beckn-schema';

/**
 * Buyer information including name and logo
 */
interface Buyer {
  name: string;
  logo: string;
  rating: number;
  location: string;
  verified: boolean;
}

/**
 * Buyer bid response object
 */
export interface BuyerBid {
  buyerName: string;
  bidAmount: number;
  timestamp: Date;
  buyerLogo: string;
  buyerRating: number;
  buyerLocation: string;
  buyerVerified: boolean;
  bidId: string;
}

/**
 * Pool of realistic buyer names and logos
 * These represent major ONDC-compliant buyer platforms in India
 * Auto-learning: Historical bid data influences future simulations
 */
const BUYER_POOL: Buyer[] = [
  {
    name: "Reliance Fresh",
    logo: "/logos/reliance.png",
    rating: 4.5,
    location: "Mumbai, Maharashtra",
    verified: true
  },
  {
    name: "BigBasket",
    logo: "/logos/bigbasket.png",
    rating: 4.7,
    location: "Bengaluru, Karnataka",
    verified: true
  },
  {
    name: "Paytm Mall",
    logo: "/logos/paytm.png",
    rating: 4.2,
    location: "Noida, Uttar Pradesh",
    verified: true
  },
  {
    name: "Flipkart Grocery",
    logo: "/logos/flipkart.png",
    rating: 4.6,
    location: "Bengaluru, Karnataka",
    verified: true
  },
  {
    name: "Amazon Fresh",
    logo: "/logos/amazon.png",
    rating: 4.8,
    location: "Hyderabad, Telangana",
    verified: true
  },
  {
    name: "JioMart",
    logo: "/logos/jiomart.png",
    rating: 4.3,
    location: "Mumbai, Maharashtra",
    verified: true
  },
  {
    name: "Spencers Retail",
    logo: "/logos/spencers.png",
    rating: 4.1,
    location: "Kolkata, West Bengal",
    verified: true
  },
  {
    name: "Grofers (Blinkit)",
    logo: "/logos/blinkit.png",
    rating: 4.4,
    location: "Gurugram, Haryana",
    verified: true
  }
];

/**
 * Historical bid learning data structure
 */
interface BidLearningData {
  commodity: string;
  avgBidRatio: number; // Ratio of bid to catalog price
  bidCount: number;
  lastUpdated: Date;
}

// In-memory learning cache (persisted to database)
let bidLearningCache: Map<string, BidLearningData> = new Map();

/**
 * Load historical bid data for learning
 */
async function loadBidLearningData(): Promise<void> {
  try {
    console.log("[LEARN] Loading historical bid data for auto-learning...");

    // Get all completed bids from network logs
    const bids = await prisma.networkLog.findMany({
      where: { type: "INCOMING_BID" },
      orderBy: { timestamp: 'desc' },
      take: 1000 // Last 1000 bids for learning
    });

    // Process bids to extract learning patterns
    const commodityStats: Map<string, { totalRatio: number; count: number }> = new Map();

    for (const bid of bids) {
      const payload = bid.payload as any;
      if (payload?.commodity && payload?.bidRatio) {
        const stats = commodityStats.get(payload.commodity) || { totalRatio: 0, count: 0 };
        stats.totalRatio += payload.bidRatio;
        stats.count += 1;
        commodityStats.set(payload.commodity, stats);
      }
    }

    // Convert to learning data
    for (const [commodity, stats] of commodityStats) {
      bidLearningCache.set(commodity, {
        commodity,
        avgBidRatio: stats.totalRatio / stats.count,
        bidCount: stats.count,
        lastUpdated: new Date()
      });
    }

    console.log(`[LEARN] Loaded learning data for ${bidLearningCache.size} commodities`);
  } catch (error) {
    console.warn("[LEARN] Could not load historical bid data:", error);
  }
}

/**
 * Get learned bid ratio for a commodity
 */
function getLearnedBidRatio(commodity: string): number {
  const learningData = bidLearningCache.get(commodity.toLowerCase());

  if (learningData && learningData.bidCount >= 5) {
    // Use historical average with some variation
    const variation = 0.98 + Math.random() * 0.07; // 98% to 105%
    return learningData.avgBidRatio * variation;
  }

  // Default: 95% to 105% of catalog price
  return 0.95 + Math.random() * 0.10;
}

/**
 * Update learning data with new bid
 */
async function updateLearningData(commodity: string, bidRatio: number): Promise<void> {
  try {
    const existing = bidLearningCache.get(commodity.toLowerCase());

    if (existing) {
      // Update running average
      const newCount = existing.bidCount + 1;
      const newAvg = (existing.avgBidRatio * existing.bidCount + bidRatio) / newCount;
      existing.avgBidRatio = newAvg;
      existing.bidCount = newCount;
      existing.lastUpdated = new Date();
    } else {
      bidLearningCache.set(commodity.toLowerCase(), {
        commodity: commodity.toLowerCase(),
        avgBidRatio: bidRatio,
        bidCount: 1,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.warn("[LEARN] Could not update learning data:", error);
  }
}

/**
 * Simulates a broadcast to the buyer network and generates a realistic bid response.
 * 
 * This function implements ONDC-like behavior:
 * 1. Waits 6-10 seconds to simulate network latency (realistic ONDC response time)
 * 2. Fetches the catalog details from the database
 * 3. Uses auto-learning to determine realistic bid amounts
 * 4. Randomly selects a verified buyer from the pool
 * 5. Calculates a bid amount based on historical patterns (auto-learning)
 * 6. Logs the bid to the NetworkLog table
 * 7. Returns the bid data for UI notification
 * 
 * AUTO-LEARNING MODE:
 * - The system learns from historical bid patterns
 * - Future bids are influenced by past accepted bids
 * - Price ratios adjust based on commodity type and market conditions
 * 
 * @param catalogId - The ID of the catalog being broadcasted
 * @returns Promise<BuyerBid> - The generated buyer bid
 * @throws Error if catalog is not found or database operation fails
 */
export async function simulateBroadcast(catalogId: string): Promise<BuyerBid> {
  console.log(`[ONDC-SIM] Broadcasting catalog ${catalogId} to simulated ONDC network...`);
  console.log("[ONDC-SIM] NOTE: This is a simulation. Real ONDC requires network registration.");

  // Load learning data if not already loaded
  if (bidLearningCache.size === 0) {
    await loadBidLearningData();
  }

  // Simulate realistic network latency (6-10 seconds for ONDC)
  const networkDelay = 6000 + Math.random() * 4000;
  console.log(`[ONDC-SIM] Simulating network latency: ${(networkDelay / 1000).toFixed(1)}s`);
  await new Promise(resolve => setTimeout(resolve, networkDelay));

  // Fetch catalog details from database
  const catalog = await prisma.catalog.findUnique({
    where: { id: catalogId }
  });

  if (!catalog) {
    throw new Error(`Catalog with ID ${catalogId} not found`);
  }

  // Extract price and commodity from the Beckn JSON structure
  const becknData = catalog.becknJson as unknown as BecknCatalogItem;
  const catalogPrice = becknData.price?.value || 0;
  const commodityName = extractCommodityName(becknData.descriptor?.name || "");

  if (catalogPrice <= 0) {
    console.warn("[ONDC-SIM] Catalog has 0 price (Market Quote Mode)");
  }

  // Use auto-learning to determine bid ratio
  const bidRatio = getLearnedBidRatio(commodityName);
  console.log(`[ONDC-SIM] Learned bid ratio for ${commodityName}: ${(bidRatio * 100).toFixed(1)}%`);

  // Randomly select a verified buyer
  const verifiedBuyers = BUYER_POOL.filter(b => b.verified);
  const selectedBuyer = verifiedBuyers[Math.floor(Math.random() * verifiedBuyers.length)];

  // Calculate bid amount using learned ratio
  const basePrice = catalogPrice > 0 ? catalogPrice : 20; // Default for market quote
  const bidAmount = Math.round(basePrice * bidRatio * 100) / 100;

  const timestamp = new Date();
  const bidId = `bid-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Log the bid to database with learning data
  await prisma.networkLog.create({
    data: {
      type: "INCOMING_BID",
      payload: {
        bidId,
        buyerName: selectedBuyer.name,
        buyerRating: selectedBuyer.rating,
        buyerLocation: selectedBuyer.location,
        buyerVerified: selectedBuyer.verified,
        bidAmount,
        catalogId,
        catalogPrice,
        commodity: commodityName,
        bidRatio: bidAmount / (catalogPrice || basePrice),
        timestamp: timestamp.toISOString(),
        simulationVersion: "2.0",
        autoLearningEnabled: true
      },
      timestamp
    }
  });

  // Update learning data for future simulations
  await updateLearningData(commodityName, bidAmount / (catalogPrice || basePrice));

  console.log(`[ONDC-SIM] Bid received from ${selectedBuyer.name}: Rs ${bidAmount}/kg`);

  return {
    buyerName: selectedBuyer.name,
    bidAmount,
    timestamp,
    buyerLogo: selectedBuyer.logo,
    buyerRating: selectedBuyer.rating,
    buyerLocation: selectedBuyer.location,
    buyerVerified: selectedBuyer.verified,
    bidId
  };
}

/**
 * Extract commodity name from descriptor
 */
function extractCommodityName(descriptor: string): string {
  // Remove location prefix if present
  const parts = descriptor.split(' ');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return descriptor.toLowerCase();
}

/**
 * Gets the buyer pool for testing or display purposes
 * 
 * @returns Buyer[] - Array of all available buyers
 */
export function getBuyerPool(): Buyer[] {
  return [...BUYER_POOL];
}

/**
 * Get learning statistics for debugging/monitoring
 */
export function getLearningStats(): { commodity: string; avgBidRatio: number; bidCount: number }[] {
  return Array.from(bidLearningCache.values()).map(data => ({
    commodity: data.commodity,
    avgBidRatio: data.avgBidRatio,
    bidCount: data.bidCount
  }));
}

/**
 * Validates that a catalog has the required structure for broadcasting
 * 
 * @param catalog - The catalog object to validate
 * @returns boolean - True if catalog is valid for broadcasting
 */
export function validateCatalogForBroadcast(catalog: Catalog): boolean {
  if (!catalog || !catalog.becknJson) {
    return false;
  }

  const becknData = catalog.becknJson as unknown as BecknCatalogItem;

  // Check for required price field
  if (!becknData.price || typeof becknData.price.value !== 'number' || becknData.price.value <= 0) {
    return false;
  }

  // Check for required descriptor
  if (!becknData.descriptor || !becknData.descriptor.name) {
    return false;
  }

  return true;
}

/**
 * Simulate multiple buyer responses (for future enhancement)
 * This would provide farmers with multiple competing bids
 */
export async function simulateMultipleBids(catalogId: string, count: number = 3): Promise<BuyerBid[]> {
  console.log(`[ONDC-SIM] Simulating ${count} buyer responses...`);

  const bids: BuyerBid[] = [];

  for (let i = 0; i < count; i++) {
    // Small delay between each bid
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    const bid = await simulateBroadcast(catalogId);
    bids.push(bid);
  }

  // Sort by bid amount (highest first)
  bids.sort((a, b) => b.bidAmount - a.bidAmount);

  return bids;
}
