/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size and color.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-blue-600", className)} />
      {text && (
        <span className="text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
}
