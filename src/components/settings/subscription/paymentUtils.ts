
import { toast } from "sonner";
import { SubscriptionUpdate } from "@/contexts/subscription/types";
import { supabase } from "@/integrations/supabase/client";
import { adminService } from "@/services/admin";

// Payment mode for testing vs production
const PAYMENT_MODE: "production" | "test" = "test";

// Get subscription plan IDs with better error handling
async function getSubscriptionPlanIds(planType: "monthly" | "yearly"): Promise<string | null> {
  try {
    const plans = await adminService.getSubscriptionPlans();
    const plan = plans.find(p => p.is_active);
    
    if (plan) {
      return planType === "monthly" ? "monthly-plan-id" : "yearly-plan-id";
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return null;
  }
}

// Fallback default PayPal links
const DEFAULT_PAYPAL_PLANS = {
  monthly: "P-65H54700W12667836M7423DA",
  yearly: "P-80L22294MH2379142M7422KA"
};

export function canRenewSubscription(subscription: any): boolean {
  if (!subscription?.current_period_end) return true;
  
  const endDate = new Date(subscription.current_period_end);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry <= 14;
}

export async function createTrialSubscription(userId: string): Promise<boolean> {
  if (!userId) {
    console.error("Cannot create trial: No user ID provided");
    return false;
  }
  
  try {
    console.log("Checking if user already has a subscription:", userId);
    
    const { data: existingSubscription, error: checkError } = await supabase
      .from("subscriptions")
      .select("id, status, trial_end_date")
      .eq("user_id", userId)
      .maybeSingle();
      
    if (checkError) {
      console.error("Error checking existing subscription:", checkError);
      return false;
    }
    
    if (existingSubscription) {
      console.log("User already has a subscription, not creating trial:", existingSubscription);
      return false;
    }
    
    console.log("Creating trial subscription for user:", userId);
    
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);
    
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
    plan_type: planType,
    timestamp: Date.now()
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
      paymentId: planType,
      success: true,
      timestamp: Date.now()
    }));
    
    const baseUrl = window.location.origin;
    const redirectUrl = `${baseUrl}/settings?payment_success=true&plan_type=${planType}&t=${Date.now()}`;
    
    window.location.href = redirectUrl;
    return paymentUrl;
  }
  
  // Production mode
  const planId = DEFAULT_PAYPAL_PLANS[planType];
  paymentUrl = `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${planId}`;
  paymentUrl += `&custom_id=${encodedCustomData}`;
  
  const baseUrl = window.location.origin;
  const settingsUrl = `${baseUrl}/settings`;
  paymentUrl += `&return=${encodeURIComponent(settingsUrl + "?payment_success=true&plan_type=" + planType + "&t=" + Date.now())}`;
  paymentUrl += `&cancel_url=${encodeURIComponent(settingsUrl + "?payment_cancelled=true&t=" + Date.now())}`;
  
  return paymentUrl;
}

let isProcessingPayment = false;

export async function processPaymentConfirmation(
  paymentType: 'monthly' | 'yearly',
  updateSubscription: (update: SubscriptionUpdate) => Promise<void>
): Promise<void> {
  if (isProcessingPayment) {
    console.log("Payment processing already in progress, skipping duplicate attempt");
    return;
  }
  
  try {
    isProcessingPayment = true;
    console.log("Starting payment confirmation processing for plan:", paymentType);
    
    const currentDate = new Date();
    const periodEnd = new Date(currentDate);
    
    if (paymentType === "monthly") {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
    
    console.log("Updating subscription with the following details:", {
      status: "active",
      planType: paymentType,
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    });
    
    await updateSubscription({
      status: "active",
      planType: paymentType,
      currentPeriodStart: currentDate.toISOString(),
      currentPeriodEnd: periodEnd.toISOString()
    });
    
    console.log("Successfully updated subscription in database");
  } catch (error) {
    console.error("Error processing payment confirmation:", error);
    throw error;
  } finally {
    isProcessingPayment = false;
  }
}
