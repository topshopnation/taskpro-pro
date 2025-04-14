import { toast } from "sonner";
import { SubscriptionUpdate } from "@/contexts/subscription/types";

// Payment mode for testing vs production
const PAYMENT_MODE: "production" | "test" = "test"; // Set to "test" for testing payments

// Test mode PayPal links - these just redirect back to the app for testing
const TEST_LINKS = {
  monthly: "https://www.paypal.com/sdk/js?client-id=test",
  yearly: "https://www.paypal.com/sdk/js?client-id=test"
};

// Production PayPal subscription links
const PRODUCTION_LINKS = {
  monthly: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-65H54700W12667836M7423DA",
  yearly: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-80L22294MH2379142M7422KA"
};

// Check if user can renew (within 14 days of expiry or already expired)
export function canRenewSubscription(subscription: any): boolean {
  if (!subscription?.current_period_end) return true;
  
  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 14;
}

export function createPaymentUrl(
  planType: "monthly" | "yearly", 
  userId: string | undefined
): string {
  if (!userId) {
    toast.error("User ID is missing. Please sign in again.");
    return "";
  }
  
  // Create custom data for PayPal to pass back in webhooks
  const customData = JSON.stringify({
    user_id: userId,
    plan_type: planType
  });
  
  // Encode the custom data for URL safety
  const encodedCustomData = encodeURIComponent(customData);
  
  let paymentUrl = "";
  
  // Select correct PayPal link based on mode and plan type
  if (PAYMENT_MODE === "test") {
    paymentUrl = TEST_LINKS[planType];
    
    console.log("TEST MODE: Initiating payment simulation for:", {
      userId, 
      planType
    });
    
    // Create a local storage entry to track that we're in test payment flow
    localStorage.setItem('taskpro_test_payment', JSON.stringify({
      userId,
      planType,
      timestamp: Date.now()
    }));
    
    // Auto-process the payment immediately in test mode - no need to visit the PayPal page
    console.log("TEST MODE: Auto-processing payment after delay");
    
    // Redirect to settings page with success parameters for both plans
    window.location.href = window.location.origin + "/settings?payment_success=true&plan_type=" + planType;
    
    return paymentUrl;
  }
  
  // Production mode - use real PayPal links
  paymentUrl = PRODUCTION_LINKS[planType];
  paymentUrl += `&custom_id=${encodedCustomData}`;
  
  // Add return URL parameters for production - always return to settings page
  const settingsUrl = window.location.origin + "/settings";
  paymentUrl += `&return=${encodeURIComponent(settingsUrl + "?payment_success=true&plan_type=" + planType)}`;
  paymentUrl += `&cancel_url=${encodeURIComponent(settingsUrl + "?payment_cancelled=true")}`;
  
  return paymentUrl;
}

export async function processPaymentConfirmation(
  paymentType: 'monthly' | 'yearly',
  updateSubscription: (update: SubscriptionUpdate) => Promise<void>
): Promise<void> {
  // Calculate the new period end date based on plan type
  const currentDate = new Date();
  const periodEnd = new Date(currentDate);
  
  if (paymentType === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  try {
    console.log("Processing payment confirmation for plan:", paymentType);
    console.log("Current period starts:", currentDate.toISOString());
    console.log("Current period ends:", periodEnd.toISOString());
    
    // Update the subscription in the database
    await updateSubscription({
      status: "active",
      planType: paymentType,
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    });
    
    toast.success(`Successfully upgraded to ${paymentType} plan`);
  } catch (error) {
    console.error("Error processing payment confirmation:", error);
    toast.error(`Failed to upgrade to ${paymentType} plan`);
    throw error;
  }
}
