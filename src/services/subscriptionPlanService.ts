
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlanData {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const subscriptionPlanService = {
  async getActivePlan(): Promise<SubscriptionPlanData | null> {
    try {
      console.log("Fetching active subscription plan (excluding free trial)...");
      
      // Get active plans that are NOT free trials (have a price > 0)
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .gt('price_monthly', 0) // Exclude free trial plans
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Database error fetching active plan:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("No active paid subscription plan found");
        throw new Error("No paid subscription plans are currently available");
      }

      const plan = data[0];
      console.log("Active paid plan found:", plan);
      
      // Validate plan data
      if (!plan.name || plan.price_monthly == null || plan.price_yearly == null || plan.price_monthly <= 0) {
        console.error("Invalid plan data:", plan);
        throw new Error("Subscription plan data is incomplete or invalid");
      }
      
      return {
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      } as SubscriptionPlanData;
    } catch (error) {
      console.error('Error fetching active subscription plan:', error);
      throw error;
    }
  },

  async getAllPlans(): Promise<SubscriptionPlanData[]> {
    try {
      console.log("Fetching all paid subscription plans...");
      
      // Always filter out free trial plans for regular users
      // Only show plans with price > 0
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .gt('price_monthly', 0) // Exclude free trial plans
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching subscription plans:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("No paid subscription plans found");
        throw new Error("No paid subscription plans found");
      }

      console.log("Paid plans found:", data);
      
      // Validate and filter plans
      const validPlans = data.filter(plan => 
        plan.name && 
        plan.price_monthly != null && 
        plan.price_yearly != null && 
        plan.price_monthly > 0
      );

      if (validPlans.length === 0) {
        throw new Error("No valid paid subscription plans available");
      }

      return validPlans.map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlanData[];
    } catch (error) {
      console.error('Error fetching all subscription plans:', error);
      throw error;
    }
  }
};
