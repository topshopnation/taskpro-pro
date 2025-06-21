
import { supabase } from "@/integrations/supabase/client";

export async function createSubscriptionUrl(planType: 'monthly' | 'yearly', userId: string): Promise<string | null> {
  try {
    console.log("Creating subscription URL for:", { planType, userId });
    
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planType,
        userId
      }
    });

    if (error) {
      console.error("Error creating subscription:", error);
      throw new Error(error.message || "Failed to create subscription");
    }

    if (!data?.approval_url) {
      console.error("No approval URL in response:", data);
      throw new Error("No approval URL received from PayPal");
    }

    console.log("Subscription URL created successfully:", data.approval_url);
    return data.approval_url;
  } catch (error: any) {
    console.error("Error in createSubscriptionUrl:", error);
    throw error;
  }
}

export async function activateSubscription(subscriptionId: string, userId: string): Promise<boolean> {
  try {
    console.log("🔄 Activating subscription:", { subscriptionId, userId });
    
    // Call the activate-paypal-subscription edge function
    const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
      body: {
        subscriptionId,
        userId
      }
    });

    if (error) {
      console.error("❌ Error activating subscription:", error);
      return false;
    }

    console.log("✅ Subscription activation response:", data);
    
    if (data?.success) {
      console.log("🎉 Subscription activated successfully via edge function");
      return true;
    } else {
      console.error("❌ Subscription activation failed - no success flag");
      return false;
    }
  } catch (error: any) {
    console.error("💥 Exception in activateSubscription:", error);
    return false;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    console.log("🔄 Canceling subscription:", { subscriptionId });
    
    const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
      body: {
        subscriptionId
      }
    });

    if (error) {
      console.error("❌ Error canceling subscription:", error);
      return false;
    }

    console.log("✅ Subscription cancellation response:", data);
    
    if (data?.success) {
      console.log("🎉 Subscription canceled successfully");
      return true;
    } else {
      console.error("❌ Subscription cancellation failed");
      return false;
    }
  } catch (error: any) {
    console.error("💥 Exception in cancelSubscription:", error);
    return false;
  }
}
