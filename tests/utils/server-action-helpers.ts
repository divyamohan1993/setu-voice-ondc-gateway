import { vi } from 'vitest';

/**
 * Helper utilities for testing Server Actions
 */

/**
 * Creates a mock successful response for Server Actions
 */
export function createSuccessResponse<T>(data: T) {
  return {
    success: true,
    ...data,
  };
}

/**
 * Creates a mock error response for Server Actions
 */
export function createErrorResponse(error: string) {
  return {
    success: false,
    error,
  };
}

/**
 * Mock implementation for translateVoiceAction
 */
export function mockTranslateVoiceAction(catalog: any) {
  return vi.fn().mockResolvedValue({
    success: true,
    catalog,
  });
}

/**
 * Mock implementation for saveCatalogAction
 */
export function mockSaveCatalogAction(catalogId: string) {
  return vi.fn().mockResolvedValue({
    success: true,
    catalogId,
  });
}

/**
 * Mock implementation for broadcastCatalogAction
 */
export function mockBroadcastCatalogAction(bid: any) {
  return vi.fn().mockResolvedValue({
    success: true,
    bid,
  });
}

/**
 * Mock implementation for getNetworkLogsAction
 */
export function mockGetNetworkLogsAction(logs: any[], totalPages: number = 1) {
  return vi.fn().mockResolvedValue({
    logs,
    totalPages,
  });
}

/**
 * Simulates a delay (useful for testing loading states)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock rejected promise for testing error handling
 */
export function mockRejectedAction(error: string) {
  return vi.fn().mockRejectedValue(new Error(error));
}
