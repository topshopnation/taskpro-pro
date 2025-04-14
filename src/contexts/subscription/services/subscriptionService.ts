
import { supabase } from '@/integrations/supabase/client';
import { Subscription, SubscriptionUpdate } from '../types';
import { toast } from 'sonner';

export const subscriptionService = {
  async updateSubscription(userId: string, update: SubscriptionUpdate) {
    console.log("Updating subscription for user:", userId);
    console.log("Update data:", update);

    try {
      const { status, planType, trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd } = update;

      const { data: existingSubscription, error: checkError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      let updateResult;
      
      if (existingSubscription) {
        updateResult = await supabase
          .from("subscriptions")
          .update({
            status,
            plan_type: planType,
            trial_start_date: trialStartDate,
            trial_end_date: trialEndDate,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .select();
      } else {
        updateResult = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            status,
            plan_type: planType,
            trial_start_date: trialStartDate,
            trial_end_date: trialEndDate,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString()
          })
          .select();
      }

      if (updateResult.error) throw updateResult.error;
      return updateResult.data[0] as Subscription;
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription. Please try again.");
      throw error;
    }
  },

  async fetchSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as Subscription;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription data");
      throw error;
    }
  }
};
