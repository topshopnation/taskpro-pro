
import { supabase } from "@/integrations/supabase/client";

export const activateSubscription = async (subscriptionId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Activating subscription:", { subscriptionId, userId });
    
    const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
      body: {
        subscriptionId,
        userId
      }
    });

    if (error) {
      console.error('Error activating subscription:', error);
      return false;
    }

    if (data?.success) {
      console.log('Subscription activated successfully:', data);
      return true;
    } else {
      console.error('Subscription activation failed:', data);
      return false;
    }
  } catch (error) {
    console.error('Error in activateSubscription:', error);
    return false;
  }
};

export const createSubscriptionUrl = async (planType: "monthly" | "yearly", userId: string): Promise<string | null> => {
  try {
    console.log("Creating subscription URL for:", { planType, userId });
    
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planType,
        userId
      }
    });

    if (error) {
      console.error('Error creating subscription URL:', error);
      return null;
    }

    if (data?.approval_url) {
      console.log('Subscription URL created successfully:', data.approval_url);
      return data.approval_url;
    } else {
      console.error('No approval URL returned:', data);
      return null;
    }
  } catch (error) {
    console.error('Error in createSubscriptionUrl:', error);
    return null;
  }
};
