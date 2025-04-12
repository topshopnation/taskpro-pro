
import { logger } from "./logger.ts";
import { ValidationError } from "./error-utils.ts";

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
    let userData: any;
    try {
      userData = JSON.parse(customData);
    } catch (e) {
      throw new ValidationError(`Invalid JSON format in custom data: ${customData}`);
    }
    
    logger.info("Successfully parsed custom data:", userData);
    
    // Validate the parsed data
    validateUserData(userData);
    
    return userData;
  } catch (e) {
    logger.error("Failed to process custom data:", customData, e);
    throw e instanceof ValidationError ? e : new ValidationError(`Invalid custom data format: ${e.message}`);
  }
}

/**
 * Validates that the user data contains the required fields
 */
function validateUserData(userData: any): asserts userData is UserData {
  if (!userData) {
    throw new ValidationError("User data is null or undefined");
  }
  
  if (typeof userData !== 'object') {
    throw new ValidationError(`Expected user data to be an object, got ${typeof userData}`);
  }
  
  if (!userData.user_id) {
    throw new ValidationError("Missing user_id in custom data");
  }
  
  if (typeof userData.user_id !== 'string') {
    throw new ValidationError(`Expected user_id to be a string, got ${typeof userData.user_id}`);
  }
  
  if (!userData.plan_type) {
    throw new ValidationError("Missing plan_type in custom data");
  }
  
  if (userData.plan_type !== "monthly" && userData.plan_type !== "yearly") {
    throw new ValidationError(`Invalid plan_type: ${userData.plan_type}, must be 'monthly' or 'yearly'`);
  }
}
