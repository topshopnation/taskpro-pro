
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
import { extractCustomData } from "./custom-data-extractor.ts";
import { updateSubscription, calculatePeriodEnd } from "./subscription-service.ts";

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
      const subscriptionData = await updateSubscription(userData);
      
      return createResponse({ 
        success: true, 
        message: "Subscription updated successfully",
        subscription_data: subscriptionData
      }, 200);
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
