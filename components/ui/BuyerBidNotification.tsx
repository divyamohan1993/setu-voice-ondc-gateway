"use client";

/**
 * BuyerBidNotification Component
 * 
 * Displays buyer bid information in a visually appealing notification
 */

import { motion } from "framer-motion";
import { TrendingUp, Building2, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BuyerBid } from "@/lib/network-simulator";

export interface BuyerBidNotificationProps {
  bid: BuyerBid;
}

export function BuyerBidNotification({ bid }: BuyerBidNotificationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: 2
              }}
            >
              <TrendingUp className="h-12 w-12 text-green-600" />
            </motion.div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 hover:bg-green-700">
                  New Bid Received!
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span>{bid.buyerName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-2xl font-bold text-green-700 dark:text-green-400">
                <IndianRupee className="h-6 w-6" />
                <span>{bid.bidAmount.toFixed(2)}</span>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {new Date(bid.timestamp).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
