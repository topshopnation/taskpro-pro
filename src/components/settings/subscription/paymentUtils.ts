
import { toast } from "sonner";
import { SubscriptionUpdate } from "@/contexts/subscription/types";
import { supabase } from "@/integrations/supabase/client";

// Payment mode for testing vs production
const PAYMENT_MODE: "production" | "test" = "test"; // Set to "test" for testing payments

// Get subscription plan IDs - simplified version until database is set up
async function getSubscriptionPlanIds(planType: "monthly" | "yearly"): Promise<string | null> {
  try {
    // Hardcoded values for now - will fetch from subscription_plans table later
    return null;
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return null;
  }
}

// Fallback default PayPal links if database doesn't have plan IDs
const DEFAULT_PAYPAL_PLANS = {
  monthly: "P-65H54700W12667836M7423DA",
  yearly: "P-80L22294MH2379142M7422KA"
};

// Check if user can renew (within 14 days of expiry or already expired)
export function canRenewSubscription(subscription: any): boolean {
  if (!subscription?.current_period_end) return true;
  
  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 14;
}

// Function to create a trial subscription for new users
export async function createTrialSubscription(userId: string): Promise<boolean> {
  if (!userId) {
    console.error("Cannot create trial: No user ID provided");
    return false;
  }
  
  try {
    console.log("Checking if user already has a subscription:", userId);
    
    // First, check if the user already has any subscription
    const { data: existingSubscription, error: checkError } = await supabase
      .from("subscriptions")
      .select("id, status, trial_end_date")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing subscription:", checkError);
      return false;
    }
    
    // If user already has a subscription, don't create a trial
    if (existingSubscription) {
      console.log("User already has a subscription, not creating trial:", existingSubscription);
      return false;
    }
    
    console.log("Creating trial subscription for user:", userId);
    
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 day trial
    
    // Create trial subscription
    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        status: "trial",
        plan_type: "monthly",
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString(),
        updated_at: now.toISOString()
      });
      
    if (insertError) {
      console.error("Error creating trial subscription:", insertError);
      return false;
    }
    
    console.log("Trial subscription created successfully");
    return true;
  } catch (error) {
    console.error("Error creating trial subscription:", error);
    return false;
  }
}

export async function createPaymentUrl(
  planType: "monthly" | "yearly", 
  userId: string | undefined
): Promise<string> {
  if (!userId) {
    toast.error("User ID is missing. Please sign in again.");
    return "";
  }
  
  const customData = JSON.stringify({
    user_id: userId,
    plan_type: planType
  });
  
  const encodedCustomData = encodeURIComponent(customData);
  let paymentUrl = "";
  
  if (PAYMENT_MODE === "test") {
    paymentUrl = `https://www.paypal.com/sdk/js?client-id=test&plan_type=${planType}`;
    
    console.log("TEST MODE: Initiating payment simulation for:", {
      userId, 
      planType
    });
    
    localStorage.setItem('taskpro_test_payment', JSON.stringify({
      userId,
      planType,
      timestamp: Date.now()
    }));
    
    // Always redirect to settings page
    window.location.href = window.location.origin + "/settings?payment_success=true&plan_type=" + planType;
    
    return paymentUrl;
  }
  
  // Use default plan IDs for now
  const planId = DEFAULT_PAYPAL_PLANS[planType];
  
  paymentUrl = `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${planId}`;
  paymentUrl += `&custom_id=${encodedCustomData}`;
  
  // Always return to settings page in production too
  const settingsUrl = window.location.origin + "/settings";
  paymentUrl += `&return=${encodeURIComponent(settingsUrl + "?payment_success=true&plan_type=" + planType)}`;
  paymentUrl += `&cancel_url=${encodeURIComponent(settingsUrl + "?payment_cancelled=true")}`;
  
  return paymentUrl;
}

export async function processPaymentConfirmation(
  paymentType: 'monthly' | 'yearly',
  updateSubscription: (update: SubscriptionUpdate) => Promise<void>
): Promise<void> {
  const currentDate = new Date();
  const periodEnd = new Date(currentDate);
  
  if (paymentType === "monthly") {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  try {
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
