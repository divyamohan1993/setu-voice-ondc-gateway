"use server";

/**
 * Server Actions
 * 
 * This file contains all server-side actions for the Setu Voice-to-ONDC Gateway.
 * All functions are Server Actions that can be called from client components.
 * 
 * Actions include:
 * - Voice translation
 * - Catalog management (save, fetch)
 * - Broadcast operations
 * - Network log retrieval
 */

import { translateVoiceToJsonWithFallback } from "@/lib/translation-agent";
import { prisma, handleDatabaseError } from "@/lib/db";
import { simulateBroadcast, type BuyerBid } from "@/lib/network-simulator";
import type { BecknCatalogItem } from "@/lib/beckn-schema";
import type { Catalog, NetworkLog, NetworkLogType, Prisma } from "@/lib/generated-client/client";

// ============================================================================
// Phase 4.1: Translation Action
// ============================================================================

/**
 * TranslateVoiceResult
 * 
 * Result type for translateVoiceAction
 */
export interface TranslateVoiceResult {
  success: boolean;
  catalog?: BecknCatalogItem;
  error?: string;
}

/**
 * translateVoiceAction
 * 
 * Translates voice text to Beckn Protocol JSON using AI.
 * 
 * @param voiceText - The raw voice input text
 * @returns Promise resolving to TranslateVoiceResult
 */
export async function translateVoiceAction(voiceText: string): Promise<TranslateVoiceResult> {
  try {
    // Input validation
    if (!voiceText || voiceText.trim().length === 0) {
      return {
        success: false,
        error: "Voice text cannot be empty"
      };
    }

    if (voiceText.trim().length < 10) {
      return {
        success: false,
        error: "Voice text is too short. Please provide more details."
      };
    }

    console.log(" Translating voice input:", voiceText);

    // Call translation agent with fallback
    const catalog = await translateVoiceToJsonWithFallback(voiceText);

    console.log("[OK] Translation successful");

    return {
      success: true,
      catalog
    };

  } catch (error) {
    console.error("[X] Translation action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Translation failed"
    };
  }
}

// ============================================================================
// Phase 4.2: Catalog Management Actions
// ============================================================================

/**
 * SaveCatalogResult
 * 
 * Result type for saveCatalogAction
 */
export interface SaveCatalogResult {
  success: boolean;
  catalogId?: string;
  error?: string;
}

/**
 * saveCatalogAction
 * 
 * Persists a catalog to the database with DRAFT status.
 * 
 * @param farmerId - The ID of the farmer creating the catalog
 * @param catalog - The Beckn Protocol catalog item
 * @returns Promise resolving to SaveCatalogResult
 */
export async function saveCatalogAction(
  farmerId: string,
  catalog: BecknCatalogItem
): Promise<SaveCatalogResult> {
  try {
    // Farmer ID validation
    if (!farmerId || farmerId.trim().length === 0) {
      return {
        success: false,
        error: "Farmer ID is required"
      };
    }

    // Verify farmer exists
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId }
    });

    if (!farmer) {
      return {
        success: false,
        error: "Farmer not found"
      };
    }

    console.log(` Saving catalog for farmer ${farmerId}`);

    // Create catalog in database
    const result = await prisma.catalog.create({
      data: {
        farmerId,
        becknJson: catalog as Prisma.InputJsonValue, // Prisma Json type
        status: "DRAFT"
      }
    });

    console.log(`[OK] Catalog saved with ID: ${result.id}`);

    return {
      success: true,
      catalogId: result.id
    };

  } catch (error) {
    console.error("[X] Save catalog action failed:", error);

    // Handle database-specific errors
    const errorMessage = handleDatabaseError(error);

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * GetCatalogResult
 * 
 * Result type for getCatalogAction
 */
export interface GetCatalogResult {
  success: boolean;
  catalog?: Catalog;
  error?: string;
}

/**
 * getCatalogAction
 * 
 * Fetches a catalog by ID.
 * 
 * @param catalogId - The ID of the catalog to fetch
 * @returns Promise resolving to GetCatalogResult
 */
export async function getCatalogAction(catalogId: string): Promise<GetCatalogResult> {
  try {
    if (!catalogId || catalogId.trim().length === 0) {
      return {
        success: false,
        error: "Catalog ID is required"
      };
    }

    console.log(` Fetching catalog ${catalogId}`);

    const catalog = await prisma.catalog.findUnique({
      where: { id: catalogId }
    });

    if (!catalog) {
      return {
        success: false,
        error: "Catalog not found"
      };
    }

    console.log(`[OK] Catalog fetched: ${catalog.id}`);

    return {
      success: true,
      catalog
    };

  } catch (error) {
    console.error("[X] Get catalog action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch catalog"
    };
  }
}

/**
 * GetCatalogsByFarmerResult
 * 
 * Result type for getCatalogsByFarmerAction
 */
export interface GetCatalogsByFarmerResult {
  success: boolean;
  catalogs?: Catalog[];
  error?: string;
}

/**
 * getCatalogsByFarmerAction
 * 
 * Fetches all catalogs for a specific farmer.
 * 
 * @param farmerId - The ID of the farmer
 * @returns Promise resolving to GetCatalogsByFarmerResult
 */
export async function getCatalogsByFarmerAction(
  farmerId: string
): Promise<GetCatalogsByFarmerResult> {
  try {
    if (!farmerId || farmerId.trim().length === 0) {
      return {
        success: false,
        error: "Farmer ID is required"
      };
    }

    console.log(` Fetching catalogs for farmer ${farmerId}`);

    const catalogs = await prisma.catalog.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" }
    });

    console.log(`[OK] Found ${catalogs.length} catalogs for farmer ${farmerId}`);

    return {
      success: true,
      catalogs
    };

  } catch (error) {
    console.error("[X] Get catalogs by farmer action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch catalogs"
    };
  }
}

// ============================================================================
// Phase 4.3: Broadcast Action
// ============================================================================

/**
 * BroadcastCatalogResult
 * 
 * Result type for broadcastCatalogAction
 */
export interface BroadcastCatalogResult {
  success: boolean;
  bid?: BuyerBid;
  error?: string;
}

/**
 * broadcastCatalogAction
 * 
 * Broadcasts a catalog to the network and triggers simulation.
 * 
 * Flow:
 * 1. Update catalog status to BROADCASTED
 * 2. Log OUTGOING_CATALOG event to NetworkLog
 * 3. Trigger network simulator
 * 4. Return broadcast result with bid data
 * 
 * @param catalogId - The ID of the catalog to broadcast
 * @returns Promise resolving to BroadcastCatalogResult
 */
export async function broadcastCatalogAction(
  catalogId: string
): Promise<BroadcastCatalogResult> {
  try {
    if (!catalogId || catalogId.trim().length === 0) {
      return {
        success: false,
        error: "Catalog ID is required"
      };
    }

    console.log(` Broadcasting catalog ${catalogId}`);

    // Fetch the catalog
    const catalog = await prisma.catalog.findUnique({
      where: { id: catalogId }
    });

    if (!catalog) {
      return {
        success: false,
        error: "Catalog not found"
      };
    }

    // Update catalog status to BROADCASTED
    await prisma.catalog.update({
      where: { id: catalogId },
      data: { status: "BROADCASTED" }
    });

    console.log("[OK] Catalog status updated to BROADCASTED");

    // Log OUTGOING_CATALOG event to NetworkLog
    await prisma.networkLog.create({
      data: {
        type: "OUTGOING_CATALOG",
        payload: {
          catalogId: catalog.id,
          farmerId: catalog.farmerId,
          becknJson: catalog.becknJson,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date()
      }
    });

    console.log("[OK] OUTGOING_CATALOG event logged");

    // Trigger network simulator
    const bid = await simulateBroadcast(catalogId);

    console.log("[OK] Broadcast completed successfully");

    return {
      success: true,
      bid
    };

  } catch (error) {
    console.error("[X] Broadcast catalog action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Broadcast failed"
    };
  }
}

// ============================================================================
// Phase 4.4: Network Log Actions
// ============================================================================

/**
 * GetNetworkLogsResult
 * 
 * Result type for getNetworkLogsAction
 */
export interface GetNetworkLogsResult {
  success: boolean;
  logs?: NetworkLog[];
  totalPages?: number;
  currentPage?: number;
  error?: string;
}

/**
 * getNetworkLogsAction
 * 
 * Fetches network logs with pagination and filtering.
 * 
 * @param filter - Optional filter for log type ("ALL", "OUTGOING_CATALOG", "INCOMING_BID")
 * @param page - Page number (1-indexed, defaults to 1)
 * @param pageSize - Number of logs per page (defaults to 10)
 * @returns Promise resolving to GetNetworkLogsResult
 */
export async function getNetworkLogsAction(
  filter?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<GetNetworkLogsResult> {
  try {
    console.log(` Fetching network logs (filter: ${filter || "ALL"}, page: ${page})`);

    // Validate page number
    if (page < 1) {
      page = 1;
    }

    // Build where clause based on filter
    const where: { type?: NetworkLogType } = {};

    if (filter && filter !== "ALL") {
      if (filter === "OUTGOING_CATALOG" || filter === "INCOMING_BID") {
        where.type = filter as NetworkLogType;
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Fetch logs with pagination and sorting
    const [logs, totalCount] = await Promise.all([
      prisma.networkLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: pageSize
      }),
      prisma.networkLog.count({ where })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    console.log(`[OK] Found ${logs.length} logs (total: ${totalCount}, pages: ${totalPages})`);

    return {
      success: true,
      logs,
      totalPages,
      currentPage: page
    };

  } catch (error) {
    console.error("[X] Get network logs action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch network logs"
    };
  }
}
