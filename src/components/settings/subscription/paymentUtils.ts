
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
// Note: These plan IDs should be verified in your PayPal dashboard
const PRODUCTION_LINKS = {
  monthly: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-65H54700W12667836M7423DA",
  yearly: "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-80L22294MH2379142M7422KA"
};

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
    
    // In test mode, directly process the payment on the client side
    // instead of waiting for the webhook to be called
    console.log("TEST MODE: Directly processing payment for user", userId, "with plan", planType);
    
    toast.info("TEST MODE: Processing payment...");
    
    // Simulate a brief delay, then trigger the payment confirmation
    setTimeout(() => {
      // Use window.postMessage to communicate with the parent window in case
      // this was opened in a new tab
      const message = {
        type: "TEST_PAYMENT_COMPLETED",
        payload: {
          user_id: userId,
          plan_type: planType,
          success: true
        }
      };
      
      // Post to current window (if in same tab) and parent window (if in popup)
      window.postMessage(message, window.location.origin);
      
      try {
        // Also redirect to success page
        window.location.href = `${window.location.origin}/settings?payment_success=true&plan_type=${planType}`;
      } catch (e) {
        console.error("Error redirecting:", e);
      }
    }, 1500);
    
    return paymentUrl;
  }
  
  // Production mode - use real PayPal links
  paymentUrl = PRODUCTION_LINKS[planType];
  
  // Add custom data to the PayPal URL
  paymentUrl += `&custom_id=${encodedCustomData}`;
  
  // Append return parameters to track payment type
  paymentUrl += `&return=${encodeURIComponent(window.location.origin + "/settings?payment_success=true&plan_type=" + planType)}`;
  
  // Add cancel URL to handle user cancellations
  paymentUrl += `&cancel_url=${encodeURIComponent(window.location.origin + "/settings?payment_cancelled=true")}`;
  
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
    throw error;
  }
}
