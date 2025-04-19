
import { supabase } from '@/integrations/supabase/client';
import { Subscription, SubscriptionUpdate } from '../types';
import { toast } from 'sonner';

export const subscriptionService = {
  async updateSubscription(userId: string, update: SubscriptionUpdate) {
    console.log("Updating subscription for user:", userId);
    console.log("Update data:", update);

    try {
      const { status, planType, trialStartDate, trialEndDate, currentPeriodStart, currentPeriodEnd } = update;

      // First check if a subscription already exists for this user
      const { data: existingSubscription, error: checkError } = await supabase
        .from("subscriptions")
        .select("id, status, plan_type, current_period_end")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing subscription:", checkError);
        throw checkError;
      }

      console.log("Existing subscription check result:", existingSubscription);
      
      let updateResult;
      
      if (existingSubscription) {
        console.log("Updating existing subscription for user:", userId);
        
        // Create an update object with only the fields that have values
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString()
        };
        
        if (status) updateData.status = status;
        if (planType) updateData.plan_type = planType;
        if (trialStartDate) updateData.trial_start_date = trialStartDate;
        if (trialEndDate) updateData.trial_end_date = trialEndDate;
        if (currentPeriodStart) updateData.current_period_start = currentPeriodStart;
        if (currentPeriodEnd) updateData.current_period_end = currentPeriodEnd;
        
        console.log("Updating with data:", updateData);
        
        // Update existing subscription
        updateResult = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId)
          .select();
      } else {
        console.log("Creating new subscription for user:", userId);
        // Create new subscription
        updateResult = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            status: status || 'active',
            plan_type: planType || 'monthly',
            trial_start_date: trialStartDate || null,
            trial_end_date: trialEndDate || null,
            current_period_start: currentPeriodStart || new Date().toISOString(),
            current_period_end: currentPeriodEnd || null,
            updated_at: new Date().toISOString()
          })
          .select();
      }

      if (updateResult.error) {
        console.error("Error updating subscription:", updateResult.error);
        throw updateResult.error;
      }
      
      console.log("Subscription updated successfully:", updateResult.data[0]);
      return updateResult.data[0] as Subscription;
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Failed to update subscription. Please try again.");
      throw error;
    }
  },

  async fetchSubscription(userId: string) {
    console.log("Fetching subscription for user:", userId);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No subscription found for user:", userId);
          return null;
        }
        console.error("Error fetching subscription:", error);
        throw error;
      }

      console.log("Subscription fetched successfully:", data);
      return data as Subscription;
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription data");
      throw error;
    }
  }
};
