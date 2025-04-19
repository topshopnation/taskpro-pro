
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
        throw new Error(`Failed to check existing subscription: ${checkError.message}`);
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
        
        // Update existing subscription with immediate select to get the updated data
        updateResult = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId)
          .select()
          .maybeSingle();
          
        // Log the raw response for debugging  
        console.log("Update result:", updateResult);
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
          .select()
          .maybeSingle();
          
        // Log the raw response for debugging
        console.log("Insert result:", updateResult);
      }

      if (updateResult.error) {
        console.error("Error updating subscription:", updateResult.error);
        throw new Error(`Failed to update subscription: ${updateResult.error.message}`);
      }
      
      if (!updateResult.data) {
        throw new Error("No subscription data returned after update");
      }
      
      console.log("Subscription updated successfully:", updateResult.data);
      return updateResult.data as Subscription;
    } catch (error) {
      console.error("Error updating subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Subscription update failed: ${errorMessage}`);
    }
  },

  async fetchSubscription(userId: string) {
    console.log("Fetching subscription for user:", userId);
    try {
      // Force cache refresh on the fetch
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
        throw new Error(`Failed to fetch subscription: ${error.message}`);
      }

      if (data) {
        console.log("Subscription fetched successfully:", data);
        return data as Subscription;
      } else {
        console.log("No subscription found for user:", userId);
        return null;
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Subscription fetch failed: ${errorMessage}`);
    }
  }
};
