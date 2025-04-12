
import { toast } from "sonner";
import { SubscriptionUpdate } from "@/contexts/subscription/types";

export function createPaymentUrl(
  planType: "monthly" | "yearly", 
  userId: string | undefined
): string {
  if (!userId) {
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
  
  if (planType === "monthly") {
    paymentUrl = "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-65H54700W12667836M7423DA";
  } else if (planType === "yearly") {
    paymentUrl = "https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-80L22294MH2379142M7422KA";
  }
  
  // Add custom data to the PayPal URL
  paymentUrl += `&custom_id=${encodedCustomData}`;
  
  // Append return parameters to track payment type
  paymentUrl += `&return=${encodeURIComponent(window.location.origin + window.location.pathname + "?payment_success=true&plan_type=" + planType)}`;
  
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
  
  // Update the subscription in the database
  await updateSubscription({
    status: "active",
    planType: paymentType,
    currentPeriodStart: currentDate.toISOString(),
    currentPeriodEnd: periodEnd.toISOString()
  });
  
  toast.success(`Successfully upgraded to ${paymentType} plan`);
}
