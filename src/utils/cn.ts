import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names and resolves Tailwind conflicts, so a variant's default
 * can always be overridden by a caller's `className` instead of the two
 * fighting over specificity.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
