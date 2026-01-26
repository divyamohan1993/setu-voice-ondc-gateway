"use client";

/**
 * NetworkLogViewer Component
 * 
 * Displays raw JSON traffic for debugging and transparency.
 * Shows network events in chronological order with color coding,
 * expandable entries, JSON syntax highlighting, filtering, and pagination.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Send,
  Inbox
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNetworkLogsAction } from "@/app/actions";
import type { NetworkLog } from "@prisma/client";

/**
 * NetworkLogViewerProps
 */
export interface NetworkLogViewerProps {
  farmerId?: string;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Format JSON with syntax highlighting
 */
function JsonDisplay({ data }: { data: any }) {
  const jsonString = JSON.stringify(data, null, 2);
  
  return (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
      <code>{jsonString}</code>
    </pre>
  );
}

/**
 * Log Entry Component
 */
function LogEntry({ log, isExpanded, onToggle }: { 
  log: NetworkLog; 
  isExpanded: boolean; 
  onToggle: () => void;
}) {
  const isOutgoing = log.type === "OUTGOING_CATALOG";
  const timestamp = new Date(log.timestamp).toLocaleString();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-2 rounded-xl overflow-hidden ${
        isOutgoing 
          ? "border-green-200 bg-green-50" 
          : "border-blue-200 bg-blue-50"
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-all duration-75 hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${
            isOutgoing ? "bg-green-500" : "bg-blue-500"
          }`}>
            {isOutgoing ? (
              <Send className="w-5 h-5 text-white" />
            ) : (
              <Inbox className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <Badge className={`${
                isOutgoing 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}>
                {log.type}
              </Badge>
              <span className="text-sm text-gray-600">{timestamp}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">ID: {log.id}</p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-6 h-6 text-gray-600" />
        ) : (
          <ChevronDown className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t-2 border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Payload:
              </h4>
              <JsonDisplay data={log.payload} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * NetworkLogViewer Component
 */
export function NetworkLogViewer({ 
  farmerId, 
  limit = 10,
  autoRefresh = false,
  refreshInterval = 5000
}: NetworkLogViewerProps) {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch logs from server
   */
  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getNetworkLogsAction(filter, currentPage, limit);
      
      if (result.success && result.logs) {
        setLogs(result.logs);
        setTotalPages(result.totalPages || 1);
      } else {
        setError(result.error || "Failed to fetch logs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch logs on mount and when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [filter, currentPage]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchLogs, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, filter, currentPage]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle page navigation
   */
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Toggle log expansion
   */
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Network Log Viewer
            </h2>
            <p className="text-gray-600 mt-1">
              View raw JSON traffic for debugging
            </p>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Events</SelectItem>
                <SelectItem value="OUTGOING_CATALOG">Outgoing Catalogs</SelectItem>
                <SelectItem value="INCOMING_BID">Incoming Bids</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading logs...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold text-red-900">Error Loading Logs</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logs List */}
        {!isLoading && !error && (
          <>
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No logs found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Broadcast a catalog to see network events
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <LogEntry
                    key={log.id}
                    log={log}
                    isExpanded={expandedLogId === log.id}
                    onToggle={() => toggleLogExpansion(log.id)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t-2 border-gray-200">
                <Button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <Button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
