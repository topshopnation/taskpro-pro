
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanType } from "@/types/subscriptionTypes";

export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trial',
        plan_type: 'monthly',
        trial_start_date: trialStart.toISOString(),
        trial_end_date: trialEnd.toISOString(),
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString()
      });

    if (error) {
      console.error('Error creating trial subscription:', error);
      return false;
    }

    console.log('Trial subscription created successfully');
    return true;
  } catch (error) {
    console.error('Error in createTrialSubscription:', error);
    return false;
  }
};

export const createSubscriptionUrl = async (planType: SubscriptionPlanType, userId: string): Promise<string | null> => {
  try {
    console.log("Creating PayPal subscription URL for plan:", planType, "user:", userId);
    
    if (!userId) {
      console.error("No user ID provided for subscription URL creation");
      return null;
    }

    // Call our new Supabase Edge Function to create PayPal subscription
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planType,
        userId,
        returnUrl: `${window.location.origin}/settings?subscription_success=true&plan_type=${planType}`,
        cancelUrl: `${window.location.origin}/settings?subscription_cancelled=true`
      }
    });

    if (error) {
      console.error('Error creating PayPal subscription:', error);
      return null;
    }

    if (data?.approval_url) {
      console.log('PayPal subscription URL created:', data.approval_url);
      return data.approval_url;
    }

    console.error('No approval URL returned from PayPal');
    return null;
  } catch (error) {
    console.error('Error creating subscription URL:', error);
    return null;
  }
};

export const activateSubscription = async (subscriptionId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Activating PayPal subscription:", subscriptionId, "for user:", userId);

    const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
      body: {
        subscriptionId,
        userId
      }
    });

    if (error) {
      console.error('Error activating PayPal subscription:', error);
      return false;
    }

    if (data?.success) {
      console.log('PayPal subscription activated successfully:', data);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error activating subscription:', error);
    return false;
  }
};
