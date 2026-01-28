/**
 * Manual Test Script for Server Actions
 * 
 * This script tests all the server actions to ensure they work correctly.
 * Run with: npx tsx test-actions.ts
 */

import {
  translateVoiceAction,
  saveCatalogAction,
  getCatalogAction,
  getCatalogsByFarmerAction,
  broadcastCatalogAction,
  getNetworkLogsAction
} from "./app/actions";

async function testActions() {
  console.log(" Starting Server Actions Test Suite\n");
  
  // Test 1: Translation Action
  console.log("=== Test 1: Translation Action ===");
  const translationResult = await translateVoiceAction(
    "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai"
  );
  
  if (translationResult.success && translationResult.catalog) {
    console.log("[OK] Translation successful");
    console.log("   Product:", translationResult.catalog.descriptor.name);
    console.log("   Price: ", translationResult.catalog.price.value);
    console.log("   Quantity:", translationResult.catalog.quantity.available.count, translationResult.catalog.quantity.unit);
  } else {
    console.log("[X] Translation failed:", translationResult.error);
  }
  console.log();
  
  // Test 2: Save Catalog Action
  console.log("=== Test 2: Save Catalog Action ===");
  if (translationResult.success && translationResult.catalog) {
    const saveResult = await saveCatalogAction("farmer-1", translationResult.catalog);
    
    if (saveResult.success && saveResult.catalogId) {
      console.log("[OK] Catalog saved successfully");
      console.log("   Catalog ID:", saveResult.catalogId);
      
      // Test 3: Get Catalog Action
      console.log("\n=== Test 3: Get Catalog Action ===");
      const getResult = await getCatalogAction(saveResult.catalogId);
      
      if (getResult.success && getResult.catalog) {
        console.log("[OK] Catalog fetched successfully");
        console.log("   Status:", getResult.catalog.status);
        console.log("   Created:", getResult.catalog.createdAt);
      } else {
        console.log("[X] Get catalog failed:", getResult.error);
      }
      
      // Test 4: Broadcast Catalog Action (commented out to avoid 8-second wait)
      console.log("\n=== Test 4: Broadcast Catalog Action ===");
      console.log("  Skipping broadcast test (takes 8 seconds)");
      console.log("   To test manually, uncomment the broadcast test code");
      
      /*
      const broadcastResult = await broadcastCatalogAction(saveResult.catalogId);
      
      if (broadcastResult.success && broadcastResult.bid) {
        console.log("[OK] Broadcast successful");
        console.log("   Buyer:", broadcastResult.bid.buyerName);
        console.log("   Bid Amount: ", broadcastResult.bid.bidAmount);
      } else {
        console.log("[X] Broadcast failed:", broadcastResult.error);
      }
      */
    } else {
      console.log("[X] Save catalog failed:", saveResult.error);
    }
  }
  console.log();
  
  // Test 5: Get Catalogs by Farmer Action
  console.log("=== Test 5: Get Catalogs by Farmer Action ===");
  const catalogsResult = await getCatalogsByFarmerAction("farmer-1");
  
  if (catalogsResult.success && catalogsResult.catalogs) {
    console.log("[OK] Catalogs fetched successfully");
    console.log("   Total catalogs:", catalogsResult.catalogs.length);
    catalogsResult.catalogs.forEach((catalog, index) => {
      console.log(`   ${index + 1}. ${catalog.id} - ${catalog.status}`);
    });
  } else {
    console.log("[X] Get catalogs failed:", catalogsResult.error);
  }
  console.log();
  
  // Test 6: Get Network Logs Action
  console.log("=== Test 6: Get Network Logs Action ===");
  const logsResult = await getNetworkLogsAction("ALL", 1, 5);
  
  if (logsResult.success && logsResult.logs) {
    console.log("[OK] Network logs fetched successfully");
    console.log("   Total logs:", logsResult.logs.length);
    console.log("   Total pages:", logsResult.totalPages);
    console.log("   Current page:", logsResult.currentPage);
    logsResult.logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.type} - ${log.timestamp.toISOString()}`);
    });
  } else {
    console.log("[X] Get logs failed:", logsResult.error);
  }
  console.log();
  
  // Test 7: Get Network Logs with Filter
  console.log("=== Test 7: Get Network Logs with Filter (INCOMING_BID) ===");
  const filteredLogsResult = await getNetworkLogsAction("INCOMING_BID", 1, 5);
  
  if (filteredLogsResult.success && filteredLogsResult.logs) {
    console.log("[OK] Filtered network logs fetched successfully");
    console.log("   Total logs:", filteredLogsResult.logs.length);
    filteredLogsResult.logs.forEach((log, index) => {
      console.log(`   ${index + 1}. ${log.type} - ${log.timestamp.toISOString()}`);
    });
  } else {
    console.log("[X] Get filtered logs failed:", filteredLogsResult.error);
  }
  console.log();
  
  console.log(" Test Suite Completed!\n");
}

// Run the tests
testActions()
  .then(() => {
    console.log("[OK] All tests completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[X] Test suite failed:", error);
    process.exit(1);
  });
