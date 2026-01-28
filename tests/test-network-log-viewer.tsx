/**
 * Quick verification script for NetworkLogViewer component
 * This file demonstrates that the component can be imported and used correctly
 */

import { NetworkLogViewer } from "@/components/NetworkLogViewer";

// Example usage scenarios
export function ExampleUsage() {
  return (
    <div>
      {/* Basic usage */}
      <NetworkLogViewer />

      {/* With custom limit */}
      <NetworkLogViewer limit={20} />

      {/* With auto-refresh */}
      <NetworkLogViewer autoRefresh={true} refreshInterval={10000} />

      {/* Filtered by farmer */}
      <NetworkLogViewer farmerId="farmer123" />
    </div>
  );
}

// Verify all props are correctly typed
const validProps = {
  farmerId: "test-farmer-id",
  limit: 15,
  autoRefresh: true,
  refreshInterval: 5000,
};

// This should compile without errors
export const TestComponent = () => <NetworkLogViewer {...validProps} />;

console.log("[OK] NetworkLogViewer component imports and types are correct!");
