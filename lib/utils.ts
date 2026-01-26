import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * This combines the conditional class handling of clsx with
 * the intelligent Tailwind class merging of tailwind-merge
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500", "px-4")
 * // Returns: "py-1 bg-blue-500 px-4" (px-4 overrides px-2)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
