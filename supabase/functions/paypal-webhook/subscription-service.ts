
import { getSupabaseClient } from "./supabase-client.ts";
import { logger } from "./logger.ts";
import { ValidationError, DatabaseError } from "./error-utils.ts";

/**
 * Calculates the period end date based on the plan type
 */
export function calculatePeriodEnd(planType: string): Date {
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

/**
 * Updates the subscription in the database
 */
export async function updateSubscription(userData: { user_id: string; plan_type: string }) {
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
    return {
      user_id,
      plan_type,
      status: "active",
      current_period_start: currentDate.toISOString(),
      current_period_end: periodEnd.toISOString(),
    };
  } catch (error) {
    logger.error("Error in updateSubscription:", error);
    throw error instanceof DatabaseError 
      ? error 
      : new DatabaseError(`Database operation failed: ${error.message}`);
  }
}
