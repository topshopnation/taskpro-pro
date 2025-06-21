
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlanType } from "@/types/subscriptionTypes";

export const createTrialSubscription = async (userId: string): Promise<boolean> => {
  try {
    // First check if user already has ANY subscription (active, expired, trial, etc.)
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return false;
    }

    if (existingSubscription) {
      console.log('User already has a subscription, not creating trial:', existingSubscription);
      return false;
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

export const createPaymentUrl = async (planType: SubscriptionPlanType, userId: string): Promise<string | null> => {
  // Type guard to ensure planType is valid for subscription creation
  if (planType === 'none') {
    console.error('Cannot create subscription URL for plan type "none"');
    return null;
  }
  
  const { createSubscriptionUrl } = await import('./subscriptionUtils');
  return createSubscriptionUrl(planType, userId);
};
