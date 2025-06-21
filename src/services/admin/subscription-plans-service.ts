
import { supabase } from "@/integrations/supabase/client";
import { adminDatabaseService } from "./admin-database-service";
import { SubscriptionPlan } from "@/types/adminTypes";

export const subscriptionPlansService = {
  async getSubscriptionPlans() {
    return adminDatabaseService.getAllSubscriptionPlans();
  },

  async createSubscriptionPlan(plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log("Creating subscription plan:", plan);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([plan])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Subscription plan created:", data);
      return data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  },

  async updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>) {
    try {
      console.log("Updating subscription plan:", id, updates);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Subscription plan updated:", data);
      return data;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  },

  async deleteSubscriptionPlan(id: string) {
    try {
      console.log("Deleting subscription plan:", id);
      
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log("Subscription plan deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  }
};
