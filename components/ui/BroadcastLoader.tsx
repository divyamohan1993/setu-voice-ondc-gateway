"use client";

/**
 * BroadcastLoader Component
 * 
 * Animated loader for broadcast operations with network simulation
 */

import { motion } from "framer-motion";
import { Radio, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface BroadcastLoaderProps {
  message?: string;
}

export function BroadcastLoader({ message = "Broadcasting to buyer network..." }: BroadcastLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="border-2 border-primary/50 bg-primary/5">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Radio className="h-16 w-16 text-primary" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Radio className="h-16 w-16 text-primary" />
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-lg font-semibold">{message}</p>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Simulating network latency (8 seconds)...
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
