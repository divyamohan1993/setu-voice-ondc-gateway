import { Farmer, Catalog, NetworkLog, CatalogStatus, NetworkLogType } from '@prisma/client';
import { SAMPLE_ONION_CATALOG, SAMPLE_MANGO_CATALOG } from './beckn-catalog';

/**
 * Mock database entities for testing
 */

export const MOCK_FARMER: Farmer = {
  id: 'farmer-1',
  name: 'Ramesh Kumar',
  locationLatLong: '19.9975,73.7898',
  languagePref: 'hi',
  upiId: 'ramesh@paytm',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

export const MOCK_CATALOG_DRAFT: Catalog = {
  id: 'catalog-1',
  farmerId: 'farmer-1',
  becknJson: SAMPLE_ONION_CATALOG as any,
  status: CatalogStatus.DRAFT,
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
};

export const MOCK_CATALOG_BROADCASTED: Catalog = {
  id: 'catalog-2',
  farmerId: 'farmer-1',
  becknJson: SAMPLE_MANGO_CATALOG as any,
  status: CatalogStatus.BROADCASTED,
  createdAt: new Date('2024-01-01T11:00:00Z'),
  updatedAt: new Date('2024-01-01T11:00:00Z'),
};

export const MOCK_NETWORK_LOG_OUTGOING: NetworkLog = {
  id: 'log-1',
  type: NetworkLogType.OUTGOING_CATALOG,
  payload: {
    catalogId: 'catalog-2',
    catalog: SAMPLE_MANGO_CATALOG,
  } as any,
  timestamp: new Date('2024-01-01T11:00:00Z'),
};

export const MOCK_NETWORK_LOG_INCOMING: NetworkLog = {
  id: 'log-2',
  type: NetworkLogType.INCOMING_BID,
  payload: {
    buyerName: 'BigBasket',
    bidAmount: 115,
    catalogId: 'catalog-2',
  } as any,
  timestamp: new Date('2024-01-01T11:00:08Z'),
};

export const MOCK_BUYER_BID = {
  buyerName: 'Reliance Fresh',
  bidAmount: 118,
  timestamp: new Date('2024-01-01T12:00:00Z'),
  buyerLogo: '/logos/reliance.png',
};

/**
 * Factory functions for creating test data
 */

export function createMockFarmer(overrides: Partial<Farmer> = {}): Farmer {
  return {
    ...MOCK_FARMER,
    ...overrides,
  };
}

export function createMockCatalog(overrides: Partial<Catalog> = {}): Catalog {
  return {
    ...MOCK_CATALOG_DRAFT,
    ...overrides,
  };
}

export function createMockNetworkLog(overrides: Partial<NetworkLog> = {}): NetworkLog {
  return {
    ...MOCK_NETWORK_LOG_OUTGOING,
    ...overrides,
  };
}
