
import { logger } from "./logger.ts";

/**
 * Extracts custom data from various possible locations in the PayPal webhook data
 */
export function extractCustomData(paymentData: any, requestData: any): string | null {
  // Try all possible locations where custom data might be found
  const possibleLocations = [
    paymentData?.custom_id, 
    paymentData?.custom, 
    requestData?.custom_id, 
    requestData?.custom,
    paymentData?.purchase_units?.[0]?.custom_id,
    paymentData?.purchase_units?.[0]?.custom
  ];
  
  // Log all potential locations for debugging
  logger.info("Checking possible custom data locations:", 
    possibleLocations.map((val, idx) => `Location ${idx}: ${val || "undefined"}`));
  
  // Return the first valid location
  return possibleLocations.find(location => location !== undefined && location !== null) || null;
}
