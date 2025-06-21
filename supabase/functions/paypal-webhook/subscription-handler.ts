
import { getSupabaseClient } from "./supabase-client.ts";
import { createResponse } from "./response.ts";
import { logger } from "./logger.ts";
import { 
  ValidationError,
  PaymentProcessingError, 
  DatabaseError,
  validateRequiredFields 
} from "./error-utils.ts";

/**
 * Handles PayPal subscription events (renewals, cancellations, etc.)
 */
export async function handleSubscriptionEvent(requestData: any, isSimulator: boolean) {
  try {
    logger.section("SUBSCRIPTION EVENT", requestData);
    
    validateRequiredFields(requestData, ['event_type', 'resource']);
    
    const subscriptionData = requestData.resource;
    const eventType = requestData.event_type;
    
    logger.info("Processing subscription event:", eventType);
    logger.info("Subscription data:", subscriptionData);
    
    // Extract subscription ID and custom data
    const subscriptionId = subscriptionData.id;
    const customData = JSON.parse(subscriptionData.custom_id || '{}');
    const userId = customData.userId;
    const planType = customData.planType || 'monthly';
    
    if (!userId) {
      throw new ValidationError("Missing user ID in subscription custom data");
    }
    
    // Handle different subscription events
    let subscriptionStatus;
    let shouldUpdateDatabase = true;
    
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        subscriptionStatus = 'active';
        logger.info("Subscription activated");
        break;
        
      case 'BILLING.SUBSCRIPTION.RENEWED':
        subscriptionStatus = 'active';
        logger.info("Subscription renewed");
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        subscriptionStatus = 'canceled';
        logger.info("Subscription cancelled");
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        subscriptionStatus = 'expired';
        logger.info("Subscription suspended");
        break;
        
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        subscriptionStatus = 'expired';
        logger.info("Subscription expired");
        break;
        
      default:
        logger.info("Unhandled subscription event type:", eventType);
        shouldUpdateDatabase = false;
    }
    
    // If this is a simulator or test request, return success without database changes
    if (isSimulator || userId === "test-user-id-from-simulator") {
      logger.info("SIMULATOR/TEST MODE: Would update subscription with:", {
        userId,
        planType,
        status: subscriptionStatus,
        subscriptionId,
        eventType
      });
      
      return createResponse({ 
        success: true, 
        test_mode: true,
        message: "Test subscription event processed successfully - no database changes made" 
      }, 200);
    }
    
    // Update subscription in database for real events
    if (shouldUpdateDatabase && subscriptionStatus) {
      try {
        await updateSubscriptionStatus(userId, subscriptionStatus, planType, subscriptionId, eventType);
        
        return createResponse({ 
          success: true, 
          message: "Subscription updated successfully",
          event_type: eventType,
          subscription_status: subscriptionStatus
        }, 200);
      } catch (error) {
        if (error instanceof DatabaseError) {
          throw error;
        }
        throw new DatabaseError(`Failed to update subscription: ${error.message}`);
      }
    }
    
    return createResponse({ 
      success: true, 
      message: "Subscription event acknowledged",
      event_type: eventType
    }, 200);
    
  } catch (error) {
    logger.error("Error in handleSubscriptionEvent:", error);
    throw error;
  }
}

/**
 * Updates subscription status in the database
 */
async function updateSubscriptionStatus(
  userId: string, 
  status: string, 
  planType: string, 
  subscriptionId: string,
  eventType: string
) {
  const supabase = getSupabaseClient();
  
  logger.info("Updating subscription status:", { userId, status, planType, subscriptionId, eventType });
  
  const currentDate = new Date();
  let periodEnd = new Date(currentDate);
  
  // Calculate next billing period for active/renewed subscriptions
  if (status === 'active') {
    if (planType === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
  }
  
  const updateData = {
    status,
    paypal_subscription_id: subscriptionId,
    current_period_start: currentDate.toISOString(),
    current_period_end: status === 'active' ? periodEnd.toISOString() : null,
    updated_at: currentDate.toISOString(),
  };
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('user_id', userId)
    .select();
    
  if (error) {
    logger.error("Error updating subscription:", error);
    throw new DatabaseError(`Failed to update subscription: ${error.message}`);
  }
  
  logger.info("Subscription updated successfully:", data);
  return data;
}
