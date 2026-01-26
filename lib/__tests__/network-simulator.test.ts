/**
 * Network Simulator Tests
 * 
 * Tests for the network simulator module that generates mock buyer bids.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { simulateBroadcast, getBuyerPool, validateCatalogForBroadcast } from '../network-simulator';
import { prisma } from '../db';

// Mock the prisma client
vi.mock('../db', () => ({
  prisma: {
    catalog: {
      findUnique: vi.fn()
    },
    networkLog: {
      create: vi.fn()
    }
  }
}));

describe('Network Simulator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('simulateBroadcast', () => {
    it('should wait 8 seconds before generating a bid', async () => {
      const startTime = Date.now();
      
      // Mock catalog data
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      await simulateBroadcast('test-catalog-id');
      
      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Should take at least 8 seconds (8000ms)
      expect(elapsed).toBeGreaterThanOrEqual(7900); // Allow small margin
    }, 10000); // Set test timeout to 10 seconds

    it('should fetch catalog from database', async () => {
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      await simulateBroadcast('test-catalog-id');
      
      expect(prisma.catalog.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-catalog-id' }
      });
    }, 10000);

    it('should throw error if catalog not found', async () => {
      (prisma.catalog.findUnique as any).mockResolvedValue(null);
      
      await expect(simulateBroadcast('non-existent-id')).rejects.toThrow(
        'Catalog with ID non-existent-id not found'
      );
    }, 10000);

    it('should throw error if catalog price is invalid', async () => {
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 0, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      
      await expect(simulateBroadcast('test-catalog-id')).rejects.toThrow(
        'Invalid catalog price'
      );
    }, 10000);

    it('should select a random buyer from the pool', async () => {
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      const bid = await simulateBroadcast('test-catalog-id');
      
      const buyerPool = getBuyerPool();
      const buyerNames = buyerPool.map(b => b.name);
      
      expect(buyerNames).toContain(bid.buyerName);
    }, 10000);

    it('should calculate bid amount within 5-10% of catalog price', async () => {
      const catalogPrice = 100;
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: catalogPrice, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      const bid = await simulateBroadcast('test-catalog-id');
      
      // Bid should be between 95 and 105 (95% to 105% of 100)
      expect(bid.bidAmount).toBeGreaterThanOrEqual(95);
      expect(bid.bidAmount).toBeLessThanOrEqual(105);
    }, 10000);

    it('should create a NetworkLog entry for INCOMING_BID', async () => {
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      await simulateBroadcast('test-catalog-id');
      
      expect(prisma.networkLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'INCOMING_BID',
            payload: expect.objectContaining({
              buyerName: expect.any(String),
              bidAmount: expect.any(Number),
              catalogId: 'test-catalog-id',
              timestamp: expect.any(String)
            }),
            timestamp: expect.any(Date)
          })
        })
      );
    }, 10000);

    it('should return a BuyerBid object with all required fields', async () => {
      const mockCatalog = {
        id: 'test-catalog-id',
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      (prisma.catalog.findUnique as any).mockResolvedValue(mockCatalog);
      (prisma.networkLog.create as any).mockResolvedValue({});
      
      const bid = await simulateBroadcast('test-catalog-id');
      
      expect(bid).toHaveProperty('buyerName');
      expect(bid).toHaveProperty('bidAmount');
      expect(bid).toHaveProperty('timestamp');
      expect(bid).toHaveProperty('buyerLogo');
      
      expect(typeof bid.buyerName).toBe('string');
      expect(typeof bid.bidAmount).toBe('number');
      expect(bid.timestamp).toBeInstanceOf(Date);
      expect(typeof bid.buyerLogo).toBe('string');
    }, 10000);
  });

  describe('getBuyerPool', () => {
    it('should return an array of buyers', () => {
      const buyers = getBuyerPool();
      
      expect(Array.isArray(buyers)).toBe(true);
      expect(buyers.length).toBeGreaterThan(0);
    });

    it('should return buyers with name and logo properties', () => {
      const buyers = getBuyerPool();
      
      buyers.forEach(buyer => {
        expect(buyer).toHaveProperty('name');
        expect(buyer).toHaveProperty('logo');
        expect(typeof buyer.name).toBe('string');
        expect(typeof buyer.logo).toBe('string');
      });
    });

    it('should include expected buyer names', () => {
      const buyers = getBuyerPool();
      const buyerNames = buyers.map(b => b.name);
      
      expect(buyerNames).toContain('Reliance Fresh');
      expect(buyerNames).toContain('BigBasket');
      expect(buyerNames).toContain('Paytm Mall');
      expect(buyerNames).toContain('Flipkart Grocery');
    });
  });

  describe('validateCatalogForBroadcast', () => {
    it('should return true for valid catalog', () => {
      const validCatalog = {
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 100, currency: 'INR' }
        }
      };
      
      expect(validateCatalogForBroadcast(validCatalog)).toBe(true);
    });

    it('should return false for null catalog', () => {
      expect(validateCatalogForBroadcast(null)).toBe(false);
    });

    it('should return false for catalog without becknJson', () => {
      const invalidCatalog = { id: 'test' };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });

    it('should return false for catalog without price', () => {
      const invalidCatalog = {
        becknJson: {
          descriptor: { name: 'Test Product' }
        }
      };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });

    it('should return false for catalog with zero price', () => {
      const invalidCatalog = {
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: 0, currency: 'INR' }
        }
      };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });

    it('should return false for catalog with negative price', () => {
      const invalidCatalog = {
        becknJson: {
          descriptor: { name: 'Test Product' },
          price: { value: -10, currency: 'INR' }
        }
      };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });

    it('should return false for catalog without descriptor', () => {
      const invalidCatalog = {
        becknJson: {
          price: { value: 100, currency: 'INR' }
        }
      };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });

    it('should return false for catalog without descriptor name', () => {
      const invalidCatalog = {
        becknJson: {
          descriptor: {},
          price: { value: 100, currency: 'INR' }
        }
      };
      
      expect(validateCatalogForBroadcast(invalidCatalog)).toBe(false);
    });
  });
});
