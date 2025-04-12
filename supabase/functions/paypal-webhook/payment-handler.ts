
import { getSupabaseClient } from "./supabase-client.ts";
import { createResponse } from "./response.ts";
import { logger } from "./logger.ts";
import { processCustomData } from "./user-data.ts";

/**
 * Handles payment and subscription events from PayPal
 */
export async function handlePaymentEvent(requestData: any, isSimulator: boolean) {
  // Extract relevant data from the webhook
  const paymentData = requestData.resource;
  logger.section("PAYMENT DATA", paymentData);
  
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
  const userData = await processCustomData(customData, isSimulator);
  
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
  return await updateSubscription(userData);
}

/**
 * Extracts custom data from various possible locations in the PayPal webhook data
 */
function extractCustomData(paymentData: any, requestData: any): string | null {
  // Try all possible locations where custom data might be found
  return paymentData?.custom_id || 
         paymentData?.custom || 
         requestData?.custom_id || 
         requestData?.custom ||
         paymentData?.purchase_units?.[0]?.custom_id ||
         paymentData?.purchase_units?.[0]?.custom;
}

/**
 * Updates the subscription in the database
 */
async function updateSubscription(userData: { user_id: string; plan_type: string }) {
  const { user_id, plan_type } = userData;
  logger.info("Updating subscription in database for user:", user_id);
  
  const currentDate = new Date();
  const periodEnd = calculatePeriodEnd(plan_type);

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: currentDate.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: currentDate.toISOString(),
      })
      .eq("user_id", user_id);

    if (error) {
      logger.error("Error updating subscription:", error);
      throw new Error("Failed to update subscription");
    }

    logger.info("Subscription updated successfully for user:", user_id);
    return createResponse({ success: true }, 200);
  } catch (error) {
    logger.error("Error in updateSubscription:", error);
    throw error;
  }
}

/**
 * Calculates the period end date based on the plan type
 */
function calculatePeriodEnd(planType: string): Date {
  const periodEnd = new Date();
  
  if (planType === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  return periodEnd;
}
