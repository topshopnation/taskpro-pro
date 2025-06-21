
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanType } from "@/types/subscriptionTypes";

export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    console.log("Creating trial subscription for user:", userId);
    
    // First check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking existing subscription:', fetchError);
      return false;
    }
    
    if (existingSubscription) {
      console.log('User already has a subscription:', existingSubscription);
      
      // Check if they had an expired trial - if so, they cannot get another trial
      if (existingSubscription.status === 'expired' && existingSubscription.trial_end_date) {
        console.log('User has expired trial, cannot create new trial');
        return false; // Don't create another trial for expired trial users
      }
      
      return true; // Consider this a success if they already have one
    }

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

    // Call our Supabase Edge Function to create PayPal subscription
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
      throw new Error(`PayPal subscription creation failed: ${error.message}`);
    }

    if (data?.approval_url) {
      console.log('PayPal subscription URL created:', data.approval_url);
      return data.approval_url;
    }

    console.error('No approval URL returned from PayPal:', data);
    throw new Error('No approval URL returned from PayPal');
  } catch (error) {
    console.error('Error creating subscription URL:', error);
    throw error; // Re-throw to let calling code handle the error
  }
};

export const activateSubscription = async (subscriptionId: string, userId: string): Promise<boolean> => {
  try {
    console.log("Activating PayPal subscription:", subscriptionId, "for user:", userId);

    if (!subscriptionId || !userId) {
      console.error("Missing required parameters for subscription activation");
      return false;
    }

    const { data, error } = await supabase.functions.invoke('activate-paypal-subscription', {
      body: {
        subscriptionId,
        userId
      }
    });

    if (error) {
      console.error('Error activating PayPal subscription:', error);
      throw new Error(`PayPal subscription activation failed: ${error.message}`);
    }

    if (data?.success) {
      console.log('PayPal subscription activated successfully:', data);
      return true;
    }

    console.error('Subscription activation was not successful:', data);
    return false;
  } catch (error) {
    console.error('Error activating subscription:', error);
    throw error; // Re-throw to let calling code handle the error
  }
};
