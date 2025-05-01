
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from "@/types/adminTypes";

/**
 * Admin service for managing subscription plans
 */
export const subscriptionPlansService = {
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform the data to ensure all plans have description and features
      return (data || []).map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlan[];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>) {
    try {
      // Ensure required fields are present
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        console.error('Missing required fields for subscription plan');
        return null;
      }

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: plan.name,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          description: plan.description || '',
          features: plan.features || [],
          is_active: plan.is_active !== undefined ? plan.is_active : true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>) {
    try {
      // Ensure we have the required fields
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        console.error('Missing required fields for subscription plan update');
        return false;
      }
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: plan.name,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          description: plan.description || '',
          features: plan.features || [],
          is_active: plan.is_active
        })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  },
  
  async deleteSubscriptionPlan(id: string) {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
        
      return !error;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      return false;
    }
  }
};
