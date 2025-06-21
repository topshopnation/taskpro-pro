
import { supabase } from "@/integrations/supabase/client";

export async function createTrialSubscription(userId: string): Promise<{ success: boolean; subscription?: any }> {
  try {
    console.log("Checking for existing subscription for user:", userId);
    
    // First check if user already has any subscription (trial, active, expired, or canceled)
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return { success: false };
    }

    if (existingSubscription) {
      console.log("User already has a subscription:", existingSubscription.status);
      return { success: false }; // User already has a subscription, don't create trial
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days

    console.log("Creating trial subscription for new user");
    
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
      return { success: false };
    }

    console.log("Trial subscription created successfully:", data);
    return { success: true, subscription: data };
  } catch (error) {
    console.error('Exception creating trial subscription:', error);
    return { success: false };
  }
}
