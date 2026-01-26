/**
 * LoadingSkeleton Component
 * 
 * Provides skeleton loading states for various UI elements
 * Improves perceived performance during async operations
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text" | "card";
  animate?: boolean;
}

/**
 * Base skeleton component with shimmer animation
 */
export function LoadingSkeleton({ 
  className, 
  variant = "default", 
  animate = true 
}: LoadingSkeletonProps) {
  const baseClasses = "bg-muted animate-pulse";
  
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4",
    card: "rounded-lg"
  };

  const shimmerAnimation = animate ? {
    backgroundPosition: ["200% 0", "-200% 0"],
  } : {};

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animate && "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]",
        className
      )}
      animate={shimmerAnimation}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

/**
 * Skeleton for VisualVerifier component
 */
export function VisualVerifierSkeleton() {
  return (
    <div className="w-full max-w-2xl border-4 border-primary/20 shadow-2xl bg-gradient-to-br from-background to-muted/20 rounded-lg">
      <div className="p-8 md:p-12">
        <div className="flex flex-col items-center space-y-8">
          {/* Commodity Icon Skeleton */}
          <LoadingSkeleton 
            variant="circular" 
            className="w-32 h-32" 
          />
          
          {/* Product Name Skeleton */}
          <LoadingSkeleton 
            variant="text" 
            className="w-48 h-12" 
          />
          
          {/* Price Badge Skeleton */}
          <LoadingSkeleton 
            variant="default" 
            className="w-40 h-16 rounded-full" 
          />
          
          {/* Quantity Indicator Skeleton */}
          <LoadingSkeleton 
            variant="default" 
            className="w-56 h-16 rounded-full" 
          />
          
          {/* Quality Grade Skeleton */}
          <LoadingSkeleton 
            variant="default" 
            className="w-32 h-12 rounded-full" 
          />
          
          {/* Logistics Logo Skeleton */}
          <div className="flex flex-col items-center gap-3">
            <LoadingSkeleton 
              variant="circular" 
              className="w-16 h-16" 
            />
            <LoadingSkeleton 
              variant="text" 
              className="w-24 h-6" 
            />
          </div>
          
          {/* Broadcast Button Skeleton */}
          <LoadingSkeleton 
            variant="circular" 
            className="w-32 h-32" 
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for NetworkLogViewer component
 */
export function NetworkLogSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <LoadingSkeleton variant="default" className="w-32 h-6 rounded-full" />
            <LoadingSkeleton variant="text" className="w-24 h-4" />
          </div>
          <LoadingSkeleton variant="text" className="w-full h-4 mb-2" />
          <LoadingSkeleton variant="text" className="w-3/4 h-4" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for VoiceInjector dropdown
 */
export function VoiceInjectorSkeleton() {
  return (
    <div className="w-full max-w-md">
      <LoadingSkeleton variant="default" className="w-full h-14 rounded-lg" />
    </div>
  );
}

/**
 * Generic card skeleton
 */
export function CardSkeleton({ 
  lines = 3, 
  showHeader = true 
}: { 
  lines?: number; 
  showHeader?: boolean; 
}) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      {showHeader && (
        <LoadingSkeleton variant="text" className="w-1/3 h-6" />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <LoadingSkeleton 
            key={i}
            variant="text" 
            className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </div>
    </div>
  );
}