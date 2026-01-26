"use client";

/**
 * Debug/Admin Page
 * 
 * Developer-focused interface for debugging and monitoring the system.
 * 
 * Features:
 * - Network log viewer with filtering and pagination
 * - Catalog list view with status indicators
 * - Farmer profile display
 * - Real-time log updates
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Database, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetworkLogViewer } from "@/components/NetworkLogViewer";
import { getCatalogsByFarmerAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import type { Catalog } from "@prisma/client";

export default function DebugPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  // Default farmer ID (from seed data)
  const FARMER_ID = "farmer-1";
  const FARMER_NAME = "Ramesh Kumar";
  const FARMER_LOCATION = "Nasik, Maharashtra";

  // Fetch catalogs
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setIsLoadingCatalogs(true);
        const result = await getCatalogsByFarmerAction(FARMER_ID);
        
        if (result.success && result.catalogs) {
          setCatalogs(result.catalogs);
        }
      } catch (error) {
        console.error("Failed to fetch catalogs:", error);
      } finally {
        setIsLoadingCatalogs(false);
      }
    };

    fetchCatalogs();
  }, []);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      DRAFT: { color: "bg-gray-500", label: "Draft" },
      BROADCASTED: { color: "bg-green-600", label: "Broadcasted" },
      SOLD: { color: "bg-blue-600", label: "Sold" }
    };

    const variant = variants[status] || variants.DRAFT;

    return (
      <Badge className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-green-400 font-mono">
              [DEBUG CONSOLE]
            </h1>
            <p className="text-sm text-slate-400">System Monitoring & Diagnostics</p>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 border-slate-700">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Farmer Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-400" />
                  Farmer Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-400">Name</p>
                    <p className="font-semibold">{FARMER_NAME}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="font-semibold">{FARMER_LOCATION}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Farmer ID</p>
                    <p className="font-mono text-xs text-green-400">{FARMER_ID}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Catalog Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-green-400" />
                  Catalog Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Total Catalogs</span>
                    <span className="font-bold text-xl">{catalogs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Broadcasted</span>
                    <span className="font-bold text-xl text-green-400">
                      {catalogs.filter(c => c.status === "BROADCASTED").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Draft</span>
                    <span className="font-bold text-xl text-gray-400">
                      {catalogs.filter(c => c.status === "DRAFT").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Database Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Database className="h-5 w-5 text-purple-400" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Engine</p>
                    <p className="font-semibold">PostgreSQL 16</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">ORM</p>
                    <p className="font-semibold">Prisma</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Catalog List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Catalog List</CardTitle>
              <CardDescription className="text-slate-400">
                All catalogs created by {FARMER_NAME}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCatalogs ? (
                <p className="text-center py-8 text-slate-400">Loading catalogs...</p>
              ) : catalogs.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No catalogs found</p>
              ) : (
                <div className="space-y-3">
                  {catalogs.map((catalog) => {
                    const becknData = catalog.becknJson as any;
                    return (
                      <Card key={catalog.id} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">
                                  {becknData.descriptor?.name || "Unknown Product"}
                                </h3>
                                {getStatusBadge(catalog.status)}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                <span>
                                  ₹{becknData.price?.value || 0} per {becknData.quantity?.unit || "unit"}
                                </span>
                                <span>
                                  {becknData.quantity?.available?.count || 0} {becknData.quantity?.unit || "units"}
                                </span>
                                {becknData.tags?.grade && (
                                  <Badge variant="outline" className="border-slate-600">
                                    Grade {becknData.tags.grade}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Created: {new Date(catalog.createdAt).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Network Log Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <NetworkLogViewer autoRefresh={true} refreshInterval={10000} />
        </motion.div>
      </main>
    </div>
  );
}
