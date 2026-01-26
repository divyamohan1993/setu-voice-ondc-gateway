/**
 * Network Simulator
 * 
 * This module simulates buyer network responses to broadcasted catalogs.
 * It generates mock buyer bids after a realistic delay to demonstrate
 * how the ONDC network would respond to farmer listings.
 */

import { prisma } from "./db";
import type { BecknCatalogItem } from "./beckn-schema";

/**
 * BuyerBid Interface
 * 
 * Represents a bid from a buyer in the network
 */
export interface BuyerBid {
  buyerName: string;
  bidAmount: number;
  timestamp: Date;
  buyerLogo: string;
}

/**
 * Buyer Interface
 * 
 * Represents a buyer in the network with name and logo
 */
interface Buyer {
  name: string;
  logo: string;
}

/**
 * BUYER_POOL
 * 
 * Pool of realistic buyer names and logos for simulation
 * Represents major ONDC-compliant buyer platforms in India
 */
const BUYER_POOL: Buyer[] = [
  { name: "Reliance Fresh", logo: "/logos/reliance.png" },
  { name: "BigBasket", logo: "/logos/bigbasket.png" },
  { name: "Paytm Mall", logo: "/logos/paytm.png" },
  { name: "Flipkart Grocery", logo: "/logos/flipkart.png" }
];

/**
 * simulateBroadcast
 * 
 * Simulates a buyer network response to a broadcasted catalog.
 * 
 * Flow:
 * 1. Wait 8 seconds (simulating network latency)
 * 2. Fetch catalog details from database
 * 3. Generate a mock buyer bid
 * 4. Log the bid to NetworkLog
 * 5. Return bid data for UI notification
 * 
 * @param catalogId - The ID of the catalog being broadcasted
 * @returns Promise resolving to BuyerBid
 * @throws Error if catalog not found or database operation fails
 */
export async function simulateBroadcast(catalogId: string): Promise<BuyerBid> {
  console.log(`🌐 Starting network simulation for catalog ${catalogId}`);
  
  // Wait 8 seconds to simulate network latency
  console.log("⏳ Waiting 8 seconds for network response...");
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  // Fetch catalog details from database
  const catalog = await prisma.catalog.findUnique({
    where: { id: catalogId }
  });
  
  if (!catalog) {
    throw new Error(`Catalog ${catalogId} not found`);
  }
  
  // Parse the Beckn JSON to get the price
  const becknData = catalog.becknJson as BecknCatalogItem;
  const catalogPrice = becknData.price.value;
  
  // Select a random buyer from the pool
  const selectedBuyer = BUYER_POOL[Math.floor(Math.random() * BUYER_POOL.length)];
  
  // Calculate bid amount (catalog price ± 5-10%)
  // Random variation between 0.90 and 1.05 of catalog price
  const variation = 0.90 + Math.random() * 0.15;
  const bidAmount = Math.round(catalogPrice * variation * 100) / 100; // Round to 2 decimal places
  
  console.log(`💰 ${selectedBuyer.name} bid: ₹${bidAmount} (catalog price: ₹${catalogPrice})`);
  
  // Create the bid object
  const bid: BuyerBid = {
    buyerName: selectedBuyer.name,
    bidAmount,
    timestamp: new Date(),
    buyerLogo: selectedBuyer.logo
  };
  
  // Log the bid to NetworkLog
  await prisma.networkLog.create({
    data: {
      type: "INCOMING_BID",
      payload: {
        buyerName: bid.buyerName,
        bidAmount: bid.bidAmount,
        catalogId: catalogId,
        timestamp: bid.timestamp.toISOString()
      },
      timestamp: bid.timestamp
    }
  });
  
  console.log("✓ Network simulation completed, bid logged");
  
  return bid;
}
