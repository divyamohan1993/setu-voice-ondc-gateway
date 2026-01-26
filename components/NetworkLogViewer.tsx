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
