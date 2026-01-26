/**
 * Server Actions Tests
 * Phase 10.5: Server Action Tests
 * 
 * Tests for all server-side actions including translation,
 * catalog management, broadcast, and network logs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  translateVoiceAction,
  saveCatalogAction,
  broadcastCatalogAction,
  getNetworkLogsAction
} from './actions';
import { SAMPLE_ONION_CATALOG } from '@/tests/fixtures/beckn-catalog';
import {
  MOCK_FARMER,
  MOCK_CATALOG_DRAFT,
  MOCK_CATALOG_BROADCASTED,
  M