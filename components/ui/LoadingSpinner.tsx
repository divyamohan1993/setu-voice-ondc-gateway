/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size and color.
 * WCAG 2.1 Compliant: Includes proper ARIA attributes for screen readers.
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

export function LoadingSpinner({
  size = "md",
  className,
  text,
  ariaLabel = "Loading, please wait"
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className={cn(sizeClasses[size], "animate-spin text-primary", className)}
        aria-hidden="true"
      />
      {text ? (
        <span className="text-gray-600 font-medium">{text}</span>
      ) : (
        <span className="sr-only">{ariaLabel}</span>
      )}
    </div>
  );
}

