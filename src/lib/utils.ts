import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export from utils folder
export { logger } from './utils/logger';
export { formatCurrency, formatPhoneNumber, safeJsonParse } from './utils/index';

// shadcn utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
