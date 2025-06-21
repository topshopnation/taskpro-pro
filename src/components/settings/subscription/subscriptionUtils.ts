
import { supabase } from "@/integrations/supabase/client";

export const createSubscriptionUrl = async (planType: 'monthly' | 'yearly', userId: string): Promise<string | null> => {
  try {
    console.log("Creating PayPal subscription URL for:", { planType, userId });
    
    const currentUrl = window.location.origin;
    const returnUrl = `${currentUrl}/settings?subscription_success=true&plan_type=${planType}`;
    const cancelUrl = `${currentUrl}/settings?subscription_cancelled=true`;
    
    console.log("Return URL:", returnUrl);
    console.log("Cancel URL:", cancelUrl);
    
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planType,
        userId,
        returnUrl,
        cancelUrl
      }
    });

    if (error) {
      console.error("Error calling create-paypal-subscription function:", error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    if (!data?.approval_url) {
      console.error("No approval URL received from PayPal:", data);
      throw new Error("PayPal did not return an approval URL");
    }

    console.log("PayPal subscription URL created successfully:", data.approval_url);
    return data.approval_url;
  } catch (error: any) {
    console.error("Error in createSubscriptionUrl:", error);
    throw error;
  }
};

export const activateSubscription = async (subscriptionId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Activating PayPal subscription:", { subscriptionId, userId });
    
    const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
      body: {
        subscriptionId,
        userId
      }
    });

    if (error) {
      console.error("Error calling activate-paypal-subscription function:", error);
      throw new Error(`Failed to activate subscription: ${error.message}`);
    }

    if (!data?.success) {
      console.error("Subscription activation was not successful:", data);
      throw new Error(data?.error || "Subscription activation failed");
    }

    console.log("Subscription activated successfully:", data);
    return true;
  } catch (error: any) {
    console.error("Error in activateSubscription:", error);
    throw error;
  }
};

export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    console.log("Checking if user can create trial subscription:", userId);
    
    // Check if user already has any subscription record
    const { data: existingSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId);
      
    if (fetchError) {
      console.error('Error checking existing subscriptions:', fetchError);
      return false;
    }
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log("User already has subscription records, cannot create trial");
      return false;
    }
    
    console.log("User eligible for trial, creating trial subscription");
    
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14); // 14 days trial
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trial',
        plan_type: 'monthly',
        trial_start_date: now.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: trialEnd.toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }
    
    console.log('Trial subscription created successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in createTrialSubscription:', error);
    return false;
  }
};
