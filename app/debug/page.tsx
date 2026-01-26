"use client";

/**
 * Debug/Admin Page
 * 
 * Developer-focused debug interface for viewing network logs,
 * catalog listings, and farmer profiles.
 */

import { useState, useEffect } from "react";
import { NetworkLogViewer } from "@/components/NetworkLogViewer";
import { getCatalogsByFarmerAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Database, FileJson, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Catalog } from "@prisma/client";

export default function DebugPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Default farmer ID (from seed data)
  const FARMER_ID = "farmer-1";

  /**
   * Fetch catalogs on mount
   */
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setIsLoading(true);
        const result = await getCatalogsByFarmerAction(FARMER_ID);
        
        if (result.success && result.catalogs) {
          setCatalogs(result.catalogs);
        }
      } catch (error) {
        console.error("Failed to fetch catalogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Debug Console</h1>
              <p className="text-sm text-gray-400">Network logs and system data</p>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Farmer Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Farmer Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Farmer ID</p>
                <p className="text-base text-gray-900 font-mono">{FARMER_ID}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Name</p>
                <p className="text-base text-gray-900">Ramesh Kumar</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Location</p>
                <p className="text-base text-gray-900">Nasik, Maharashtra</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Catalog List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Catalog Listings</h2>
            </div>
            
            {isLoading ? (
              <div className="py-8">
                <LoadingSpinner size="lg" text="Loading catalogs..." />
              </div>
            ) : catalogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No catalogs found</p>
                <p className="text-sm mt-2">Create a catalog from the home page</p>
              </div>
            ) : (
              <div className="space-y-4">
                {catalogs.map((catalog) => {
                  const becknData = catalog.becknJson as any;
                  const statusColor = 
                    catalog.status === "BROADCASTED" ? "bg-green-500" :
                    catalog.status === "SOLD" ? "bg-blue-500" :
                    "bg-gray-500";
                  
                  return (
                    <div
                      key={catalog.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {becknData.descriptor?.name || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-gray-600 font-mono">
                            ID: {catalog.id}
                          </p>
                        </div>
                        
                        <Badge className={`${statusColor} text-white`}>
                          {catalog.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-semibold">Price</p>
                          <p className="text-gray-900">
                            ₹{becknData.price?.value || 0} per {becknData.quantity?.unit || "unit"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold">Quantity</p>
                          <p className="text-gray-900">
                            {becknData.quantity?.available?.count || 0} {becknData.quantity?.unit || "units"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold">Grade</p>
                          <p className="text-gray-900">
                            {becknData.tags?.grade || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-semibold">Created</p>
                          <p className="text-gray-900">
                            {new Date(catalog.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Network Log Viewer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NetworkLogViewer 
            farmerId={FARMER_ID}
            limit={10}
            autoRefresh={true}
            refreshInterval={10000}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 bg-white">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Debug Console • Setu Voice-to-ONDC Gateway</p>
        </div>
      </footer>
    </div>
  );
}
