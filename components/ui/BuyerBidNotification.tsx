/**
 * BuyerBidNotification Component
 * 
 * Displays a buyer bid notification with high contrast colors
 * and clear visual indicators. Shows buyer name, bid amount, and timestamp.
 */

import { motion } from "framer-motion";
import { CheckCircle2, IndianRupee, Clock, Building2 } from "lucide-react";
import { Badge } from "./badge";
import type { BuyerBid } from "@/lib/network-simulator";

export interface BuyerBidNotificationProps {
  bid: BuyerBid;
  onDismiss?: () => void;
}

export function BuyerBidNotification({ bid, onDismiss }: BuyerBidNotificationProps) {
  const timestamp = new Date(bid.timestamp).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-300 rounded-2xl p-6 shadow-2xl max-w-md"
    >
      {/* Success Icon */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="bg-green-500 p-3 rounded-full"
        >
          <CheckCircle2 className="w-8 h-8 text-white" />
        </motion.div>
        
        <div>
          <h3 className="text-2xl font-bold text-green-900">
            Bid Received!
          </h3>
          <p className="text-green-700 text-sm">
            A buyer is interested in your listing
          </p>
        </div>
      </div>

      {/* Buyer Information */}
      <div className="space-y-3 mb-4">
        {/* Buyer Name */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-green-200">
          <Building2 className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-xs text-gray-600 font-semibold">Buyer</p>
            <p className="text-lg font-bold text-gray-900">{bid.buyerName}</p>
          </div>
        </div>

        {/* Bid Amount */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-green-200">
          <IndianRupee className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-xs text-gray-600 font-semibold">Bid Amount</p>
            <p className="text-2xl font-bold text-green-700">
              {bid.bidAmount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-4 border-2 border-green-200">
          <Clock className="w-6 h-6 text-green-600" />
          <div>
            <p className="text-xs text-gray-600 font-semibold">Received At</p>
            <p className="text-sm font-medium text-gray-900">{timestamp}</p>
          </div>
        </div>
      </div>

      {/* Success Badge */}
      <div className="flex justify-center">
        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 text-sm font-bold">
           Broadcast Successful
        </Badge>
      </div>
    </motion.div>
  );
}
