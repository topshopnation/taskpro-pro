
import { logger } from "./logger.ts";

export type UserData = {
  user_id: string;
  plan_type: string;
};

/**
 * Processes custom data from PayPal webhook
 * Either parses the JSON data from real requests or creates mock data for simulator
 */
export async function processCustomData(
  customData: string | null, 
  isSimulator: boolean
): Promise<UserData> {
  logger.info("Custom data from PayPal:", customData);
  
  // For simulator requests or when custom data is missing, create mock data for testing
  if (isSimulator || !customData) {
    logger.info("Using test data - either simulator detected or no custom data found");
    // Generate a test user ID for development/testing
    const mockUserData = {
      user_id: "test-user-id-from-simulator",
      plan_type: "monthly"
    };
    logger.info("Created mock user data:", mockUserData);
    return mockUserData;
  }
  
  // Parse the custom data from real request
  // Format should be: {"user_id":"some-uuid","plan_type":"monthly|yearly"}
  try {
    const userData = JSON.parse(customData);
    logger.info("Successfully parsed custom data:", userData);
    
    // Validate the parsed data
    validateUserData(userData);
    
    return userData;
  } catch (e) {
    logger.error("Failed to parse custom data:", customData, e);
    throw new Error("Invalid custom data format");
  }
}

/**
 * Validates that the user data contains the required fields
 */
function validateUserData(userData: any): asserts userData is UserData {
  if (!userData.user_id || !userData.plan_type) {
    logger.error("Missing user_id or plan_type in parsed data:", userData);
    throw new Error("Missing user_id or plan_type");
  }
  
  if (userData.plan_type !== "monthly" && userData.plan_type !== "yearly") {
    logger.error("Invalid plan_type in parsed data:", userData);
    throw new Error("Invalid plan_type, must be 'monthly' or 'yearly'");
  }
}
