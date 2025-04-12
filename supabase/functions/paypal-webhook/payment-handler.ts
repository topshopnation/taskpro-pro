
import { getSupabaseClient } from "./supabase-client.ts";
import { createResponse } from "./response.ts";
import { logger } from "./logger.ts";
import { processCustomData } from "./user-data.ts";
import { 
  ValidationError,
  PaymentProcessingError, 
  DatabaseError,
  validateRequiredFields 
} from "./error-utils.ts";

/**
 * Handles payment and subscription events from PayPal
 */
export async function handlePaymentEvent(requestData: any, isSimulator: boolean) {
  try {
    // Validate the requestData structure
    validateRequiredFields(requestData, ['event_type', 'resource']);
    
    // Extract relevant data from the webhook
    const paymentData = requestData.resource;
    logger.section("PAYMENT DATA", paymentData);
    
    // Validate payment data
    if (!paymentData) {
      throw new ValidationError("Missing payment resource data");
    }
    
    // Additional validation of payment state
    if (paymentData.state && paymentData.state !== "completed" && paymentData.state !== "approved") {
      logger.warn(`Payment not in completed state. Current state: ${paymentData.state}`);
    }
    
    // Check if this is a subscription payment
    const billingAgreementId = paymentData?.billing_agreement_id;
    const isSubscription = !!billingAgreementId;
    
    if (!isSubscription && !isSimulator) {
      logger.info("Not a subscription payment, but will process anyway for testing");
    } else {
      logger.info("Processing subscription with billing agreement:", billingAgreementId || "SIMULATOR_TEST");
    }

    // Extract and process custom data containing user ID and plan type
    const customData = extractCustomData(paymentData, requestData);
    
    // Add detailed logging for custom data extraction
    logger.info("Extracted custom data:", customData);
    
    let userData;
    try {
      userData = await processCustomData(customData, isSimulator);
    } catch (error) {
      throw new PaymentProcessingError(`Failed to process custom data: ${error.message}`);
    }
    
    // If this is a simulator or test request, return success without database changes
    if (isSimulator || userData.user_id === "test-user-id-from-simulator") {
      logger.info("SIMULATOR/TEST MODE: Would update subscription with the following data:", {
        ...userData,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: calculatePeriodEnd(userData.plan_type).toISOString(),
      });
      
      return createResponse({ 
        success: true, 
        test_mode: true,
        message: "Test processed successfully - no database changes made" 
      }, 200);
    }

    // Update the subscription in the database for real requests
    try {
      return await updateSubscription(userData);
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update subscription: ${error.message}`);
    }
  } catch (error) {
    logger.error("Error in handlePaymentEvent:", error);
    throw error;
  }
}

/**
 * Extracts custom data from various possible locations in the PayPal webhook data
 */
function extractCustomData(paymentData: any, requestData: any): string | null {
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

/**
 * Updates the subscription in the database
 */
async function updateSubscription(userData: { user_id: string; plan_type: string }) {
  const { user_id, plan_type } = userData;
  
  if (!user_id) {
    throw new ValidationError("Missing user_id for subscription update");
  }
  
  logger.info("Updating subscription in database for user:", user_id);
  
  const currentDate = new Date();
  const periodEnd = calculatePeriodEnd(plan_type);

  try {
    const supabase = getSupabaseClient();
    
    // First, check if the subscription exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();
      
    if (checkError) {
      logger.error("Error checking existing subscription:", checkError);
      throw new DatabaseError(`Failed to check existing subscription: ${checkError.message}`);
    }
    
    let result;
    
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          plan_type: plan_type,
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: currentDate.toISOString(),
        })
        .eq("user_id", user_id);

      if (error) {
        logger.error("Error updating subscription:", error);
        throw new DatabaseError(`Failed to update subscription: ${error.message}`);
      }
      result = data;
    } else {
      // Create new subscription if it doesn't exist
      logger.info("No existing subscription found, creating new one for user:", user_id);
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user_id,
          status: "active",
          plan_type: plan_type,
          current_period_start: currentDate.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });
        
      if (error) {
        logger.error("Error creating new subscription:", error);
        throw new DatabaseError(`Failed to create subscription: ${error.message}`);
      }
      result = data;
    }

    logger.info("Subscription updated/created successfully for user:", user_id);
    return createResponse({ 
      success: true, 
      message: "Subscription updated successfully",
      subscription_data: {
        user_id,
        plan_type,
        status: "active",
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
      }
    }, 200);
  } catch (error) {
    logger.error("Error in updateSubscription:", error);
    throw error instanceof DatabaseError 
      ? error 
      : new DatabaseError(`Database operation failed: ${error.message}`);
  }
}

/**
 * Calculates the period end date based on the plan type
 */
function calculatePeriodEnd(planType: string): Date {
  if (!planType || (planType !== "monthly" && planType !== "yearly")) {
    throw new ValidationError(`Invalid plan type: ${planType}`);
  }
  
  const periodEnd = new Date();
  
  if (planType === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  return periodEnd;
}
