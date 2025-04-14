
import { toast } from "sonner";
import { SubscriptionUpdate } from "@/contexts/subscription/types";

// Payment mode for testing vs production
const PAYMENT_MODE = "test"; // Change to "production" for live payments

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
    
    // In test mode, simulate successful payment by redirecting back to app with success params
    setTimeout(() => {
      window.location.href = `${window.location.origin}/settings?payment_success=true&plan_type=${planType}`;
    }, 1500);
    
    toast.info("TEST MODE: Simulating successful payment...");
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
