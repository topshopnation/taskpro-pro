
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

export const createPaymentUrl = async (planType: SubscriptionPlanType, userId: string): Promise<string | null> => {
  try {
    console.log("Creating PayPal payment URL for plan:", planType, "user:", userId);
    
    if (!userId) {
      console.error("No user ID provided for payment URL creation");
      return null;
    }

    // Call our Supabase Edge Function to create PayPal payment
    const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
      body: {
        planType,
        userId,
        returnUrl: `${window.location.origin}/settings?payment_success=true&plan_type=${planType}`,
        cancelUrl: `${window.location.origin}/settings?payment_cancelled=true`
      }
    });

    if (error) {
      console.error('Error creating PayPal payment:', error);
      return null;
    }

    if (data?.approval_url) {
      console.log('PayPal payment URL created:', data.approval_url);
      return data.approval_url;
    }

    console.error('No approval URL returned from PayPal');
    return null;
  } catch (error) {
    console.error('Error creating payment URL:', error);
    return null;
  }
};
