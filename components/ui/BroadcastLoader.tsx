/**
 * BroadcastLoader Component
 * 
 * An animated loader specifically for broadcast operations.
 * Shows a pulsing animation with network-related visuals.
 */

import { motion } from "framer-motion";
import { Radio, Loader2 } from "lucide-react";

export interface BroadcastLoaderProps {
  message?: string;
}

export function BroadcastLoader({ message = "Broadcasting to network..." }: BroadcastLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated Radio Waves */}
      <div className="relative mb-6">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-blue-400 rounded-full"
        />
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute inset-0 bg-purple-400 rounded-full"
        />
        
        <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-full">
          <Radio className="w-12 h-12 text-white" />
        </div>
      </div>

      {/* Loading Spinner and Text */}
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-lg font-semibold text-gray-900">
          {message}
        </p>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        Please wait while we connect to the ONDC network
      </p>
    </div>
  );
}
