
import { supabase } from "@/integrations/supabase/client";
import { Subscription, SubscriptionUpdate, SubscriptionStatus, SubscriptionPlanType } from "../types";

export const subscriptionService = {
  async fetchSubscription(userId: string): Promise<Subscription | null> {
    try {
      console.log("Fetching subscription for user:", userId);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      if (!data) {
        console.log("No subscription found for user");
        return null;
      }

      // Ensure status and plan_type match our types
      const subscription: Subscription = {
        ...data,
        status: (data.status as SubscriptionStatus) || 'none',
        plan_type: (data.plan_type as SubscriptionPlanType) || 'none'
      };

      console.log("Subscription fetched successfully:", subscription);
      return subscription;
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      return null;
    }
  },

  async updateSubscription(userId: string, update: SubscriptionUpdate): Promise<Subscription> {
    try {
      console.log("Updating subscription for user:", userId, "with:", update);

      // Check if subscription exists
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const updateData = {
        user_id: userId,
        status: update.status || 'trial',
        plan_type: update.planType || 'monthly',
        trial_start_date: update.trialStartDate,
        trial_end_date: update.trialEndDate,
        current_period_start: update.currentPeriodStart,
        current_period_end: update.currentPeriodEnd,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            ...updateData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      const subscription: Subscription = {
        ...result,
        status: (result.status as SubscriptionStatus) || 'none',
        plan_type: (result.plan_type as SubscriptionPlanType) || 'none'
      };

      console.log("Subscription updated successfully:", subscription);
      return subscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
};
