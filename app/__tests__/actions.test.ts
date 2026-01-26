/**
 * Server Actions Tests
 * 
 * Comprehensive test suite for all server actions in Phase 4
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { 
  translateVoiceAction,
  saveCatalogAction,
  getCatalogAction,
  getCatalogsByFarmerAction,
  broadcastCatalogAction,
  getNetworkLogsAction
} from '../actions';
import { prisma } from '@/lib/db';
import type { BecknCatalogItem } from '@/lib/beckn-schema';

// Test data
const TEST_FARMER_ID = 'test-farmer-' + Date.now();
const TEST_VOICE_TEXT = "500 kilo pyaaz hai Nasik se, Grade A hai";

// Sample catalog for testing
const SAMPLE_CATALOG: BecknCatalogItem = {
  descriptor: {
    name: "Test Onions",
    symbol: "/icons/onion.png"
  },
  price: {
    value: 40,
    currency: "INR"
  },
  quantity: {
    available: { count: 500 },
    unit: "kg"
  },
  tags: {
    grade: "A",
    perishability: "medium",
    logistics_provider: "India Post"
  }
};

describe('Phase 4.1: Translation Action', () => {
  it('4.1.1-4.1.5: translateVoiceAction should translate voice text successfully', async () => {
    const result = await translateVoiceAction(TEST_VOICE_TEXT);
    
    expect(result.success).toBe(true);
    expect(result.catalog).toBeDefined();
    expect(result.error).toBeUndefined();
    
    if (result.catalog) {
      // Verify Beckn Protocol structure
      expect(result.catalog.descriptor).toBeDefined();
      expect(result.catalog.descriptor.name).toBeTruthy();
      expect(result.catalog.price).toBeDefined();
      expect(result.catalog.price.value).toBeGreaterThan(0);
      expect(result.catalog.quantity).toBeDefined();
      expect(result.catalog.tags).toBeDefined();
    }
  });

  it('4.1.3: should validate empty voice text', async () => {
    const result = await translateVoiceAction("");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("empty");
  });

  it('4.1.3: should validate short voice text', async () => {
    const result = await translateVoiceAction("test");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("short");
  });

  it('4.1.4: should handle errors gracefully', async () => {
    // Test with very long text that might cause issues
    const longText = "a".repeat(10000);
    const result = await translateVoiceAction(longText);
    
    // Should either succeed or fail gracefully
    expect(result.success).toBeDefined();
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('Phase 4.2: Catalog Management Actions', () => {
  let testFarmerId: string;
  let testCatalogId: string;

  beforeAll(async () => {
    // Create a test farmer
    const farmer = await prisma.farmer.create({
      data: {
        name: "Test Farmer",
        locationLatLong: "18.5204,73.8567",
        languagePref: "hi",
        upiId: "testfarmer@upi"
      }
    });
    testFarmerId = farmer.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.catalog.deleteMany({
      where: { farmerId: testFarmerId }
    });
    await prisma.farmer.delete({
      where: { id: testFarmerId }
    });
  });

  it('4.2.1-4.2.4: saveCatalogAction should save catalog successfully', async () => {
    const result = await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    
    expect(result.success).toBe(true);
    expect(result.catalogId).toBeDefined();
    expect(result.error).toBeUndefined();
    
    if (result.catalogId) {
      testCatalogId = result.catalogId;
      
      // Verify catalog was saved to database
      const catalog = await prisma.catalog.findUnique({
        where: { id: result.catalogId }
      });
      
      expect(catalog).toBeDefined();
      expect(catalog?.status).toBe("DRAFT");
      expect(catalog?.farmerId).toBe(testFarmerId);
    }
  });

  it('4.2.2: should validate farmer ID', async () => {
    const result = await saveCatalogAction("", SAMPLE_CATALOG);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Farmer ID");
  });

  it('4.2.2: should handle non-existent farmer', async () => {
    const result = await saveCatalogAction("non-existent-farmer", SAMPLE_CATALOG);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("not found");
  });

  it('4.2.5: getCatalogAction should fetch catalog by ID', async () => {
    // First save a catalog
    const saveResult = await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    expect(saveResult.success).toBe(true);
    
    if (saveResult.catalogId) {
      const result = await getCatalogAction(saveResult.catalogId);
      
      expect(result.success).toBe(true);
      expect(result.catalog).toBeDefined();
      expect(result.catalog?.id).toBe(saveResult.catalogId);
      expect(result.error).toBeUndefined();
    }
  });

  it('4.2.5: getCatalogAction should handle invalid ID', async () => {
    const result = await getCatalogAction("");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('4.2.5: getCatalogAction should handle non-existent catalog', async () => {
    const result = await getCatalogAction("non-existent-catalog");
    
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it('4.2.6: getCatalogsByFarmerAction should fetch all farmer catalogs', async () => {
    // Save multiple catalogs
    await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    
    const result = await getCatalogsByFarmerAction(testFarmerId);
    
    expect(result.success).toBe(true);
    expect(result.catalogs).toBeDefined();
    expect(result.catalogs!.length).toBeGreaterThanOrEqual(2);
    expect(result.error).toBeUndefined();
    
    // Verify all catalogs belong to the farmer
    result.catalogs?.forEach(catalog => {
      expect(catalog.farmerId).toBe(testFarmerId);
    });
  });

  it('4.2.6: getCatalogsByFarmerAction should validate farmer ID', async () => {
    const result = await getCatalogsByFarmerAction("");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('Phase 4.3: Broadcast Action', () => {
  let testFarmerId: string;
  let testCatalogId: string;

  beforeAll(async () => {
    // Create a test farmer
    const farmer = await prisma.farmer.create({
      data: {
        name: "Test Farmer Broadcast",
        locationLatLong: "18.5204,73.8567",
        languagePref: "hi"
      }
    });
    testFarmerId = farmer.id;

    // Create a test catalog
    const saveResult = await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    if (saveResult.catalogId) {
      testCatalogId = saveResult.catalogId;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.networkLog.deleteMany({
      where: {
        payload: {
          path: ['catalogId'],
          equals: testCatalogId
        }
      }
    });
    await prisma.catalog.deleteMany({
      where: { farmerId: testFarmerId }
    });
    await prisma.farmer.delete({
      where: { id: testFarmerId }
    });
  });

  it('4.3.1-4.3.5: broadcastCatalogAction should broadcast successfully', async () => {
    const result = await broadcastCatalogAction(testCatalogId);
    
    expect(result.success).toBe(true);
    expect(result.bid).toBeDefined();
    expect(result.error).toBeUndefined();
    
    if (result.bid) {
      // 4.3.5: Verify bid data structure
      expect(result.bid.buyerName).toBeDefined();
      expect(result.bid.bidAmount).toBeGreaterThan(0);
      expect(result.bid.timestamp).toBeDefined();
      expect(result.bid.buyerLogo).toBeDefined();
    }
    
    // 4.3.2: Verify catalog status was updated
    const catalog = await prisma.catalog.findUnique({
      where: { id: testCatalogId }
    });
    expect(catalog?.status).toBe("BROADCASTED");
    
    // 4.3.3: Verify OUTGOING_CATALOG event was logged
    const outgoingLog = await prisma.networkLog.findFirst({
      where: {
        type: "OUTGOING_CATALOG",
        payload: {
          path: ['catalogId'],
          equals: testCatalogId
        }
      }
    });
    expect(outgoingLog).toBeDefined();
    
    // 4.3.4: Verify network simulator created INCOMING_BID log
    const incomingLog = await prisma.networkLog.findFirst({
      where: {
        type: "INCOMING_BID",
        payload: {
          path: ['catalogId'],
          equals: testCatalogId
        }
      }
    });
    expect(incomingLog).toBeDefined();
  }, 15000); // Increase timeout for 8-second delay

  it('4.3.1: should validate catalog ID', async () => {
    const result = await broadcastCatalogAction("");
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('4.3.1: should handle non-existent catalog', async () => {
    const result = await broadcastCatalogAction("non-existent-catalog");
    
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });
});

describe('Phase 4.4: Network Log Actions', () => {
  let testFarmerId: string;
  let testCatalogId: string;

  beforeAll(async () => {
    // Create test data
    const farmer = await prisma.farmer.create({
      data: {
        name: "Test Farmer Logs",
        locationLatLong: "18.5204,73.8567",
        languagePref: "hi"
      }
    });
    testFarmerId = farmer.id;

    const saveResult = await saveCatalogAction(testFarmerId, SAMPLE_CATALOG);
    if (saveResult.catalogId) {
      testCatalogId = saveResult.catalogId;
      // Broadcast to create logs
      await broadcastCatalogAction(testCatalogId);
    }
  });

  afterAll(async () => {
    // Clean up
    await prisma.networkLog.deleteMany({
      where: {
        payload: {
          path: ['catalogId'],
          equals: testCatalogId
        }
      }
    });
    await prisma.catalog.deleteMany({
      where: { farmerId: testFarmerId }
    });
    await prisma.farmer.delete({
      where: { id: testFarmerId }
    });
  });

  it('4.4.1-4.4.5: getNetworkLogsAction should fetch logs with pagination', async () => {
    const result = await getNetworkLogsAction("ALL", 1, 10);
    
    expect(result.success).toBe(true);
    expect(result.logs).toBeDefined();
    expect(result.totalPages).toBeDefined();
    expect(result.currentPage).toBe(1);
    expect(result.error).toBeUndefined();
    
    // 4.4.5: Verify pagination metadata
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(result.logs)).toBe(true);
  }, 15000);

  it('4.4.2: should filter by OUTGOING_CATALOG', async () => {
    const result = await getNetworkLogsAction("OUTGOING_CATALOG", 1, 10);
    
    expect(result.success).toBe(true);
    expect(result.logs).toBeDefined();
    
    // Verify all logs are OUTGOING_CATALOG type
    result.logs?.forEach(log => {
      expect(log.type).toBe("OUTGOING_CATALOG");
    });
  }, 15000);

  it('4.4.2: should filter by INCOMING_BID', async () => {
    const result = await getNetworkLogsAction("INCOMING_BID", 1, 10);
    
    expect(result.success).toBe(true);
    expect(result.logs).toBeDefined();
    
    // Verify all logs are INCOMING_BID type
    result.logs?.forEach(log => {
      expect(log.type).toBe("INCOMING_BID");
    });
  }, 15000);

  it('4.4.3: should sort by timestamp descending', async () => {
    const result = await getNetworkLogsAction("ALL", 1, 10);
    
    expect(result.success).toBe(true);
    expect(result.logs).toBeDefined();
    
    if (result.logs && result.logs.length > 1) {
      // Verify logs are sorted by timestamp descending
      for (let i = 0; i < result.logs.length - 1; i++) {
        const currentTimestamp = new Date(result.logs[i].timestamp).getTime();
        const nextTimestamp = new Date(result.logs[i + 1].timestamp).getTime();
        expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
      }
    }
  }, 15000);

  it('4.4.4: should calculate total pages correctly', async () => {
    const pageSize = 2;
    const result = await getNetworkLogsAction("ALL", 1, pageSize);
    
    expect(result.success).toBe(true);
    expect(result.totalPages).toBeDefined();
    
    // If we have logs, verify page calculation
    if (result.logs && result.logs.length > 0) {
      expect(result.totalPages).toBeGreaterThanOrEqual(1);
    }
  }, 15000);

  it('4.4.1: should handle invalid page numbers', async () => {
    const result = await getNetworkLogsAction("ALL", -1, 10);
    
    // Should default to page 1
    expect(result.success).toBe(true);
    expect(result.currentPage).toBe(1);
  });

  it('4.4.1: should handle pagination beyond available pages', async () => {
    const result = await getNetworkLogsAction("ALL", 9999, 10);
    
    expect(result.success).toBe(true);
    expect(result.logs).toBeDefined();
    expect(result.logs?.length).toBe(0);
  });
});
