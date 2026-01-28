import { vi } from 'vitest';
import { PrismaClient } from '@/lib/generated-client/client';

/**
 * Mock Prisma client for testing database operations
 */

export type MockPrismaClient = {
  farmer: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  catalog: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  networkLog: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  $disconnect: ReturnType<typeof vi.fn>;
};

/**
 * Creates a mock Prisma client with all methods stubbed
 */
export function createMockPrismaClient(): MockPrismaClient {
  return {
    farmer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    catalog: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    networkLog: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  };
}

/**
 * Helper to mock Prisma module
 */
export function mockPrismaModule(mockClient: MockPrismaClient) {
  vi.mock('@/lib/db', () => ({
    prisma: mockClient,
  }));
}
