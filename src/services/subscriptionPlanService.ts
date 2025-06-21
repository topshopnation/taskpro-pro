
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
      console.log("Fetching active subscription plan...");
      
      // Get active plans that are paid plans (not free trials)
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching active plan:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Raw subscription plans data:", data);

      if (!data || data.length === 0) {
        console.log("No subscription plans found");
        throw new Error("No subscription plans are currently available");
      }

      // Filter out free trial plans (name contains "free" or "trial", or price is 0)
      const paidPlans = data.filter(plan => {
        const nameCheck = plan.name && !plan.name.toLowerCase().includes('free') && !plan.name.toLowerCase().includes('trial');
        const priceCheck = plan.price_monthly > 0;
        return nameCheck && priceCheck;
      });

      console.log("Filtered paid plans:", paidPlans);

      if (paidPlans.length === 0) {
        console.log("No paid subscription plans found after filtering");
        throw new Error("No paid subscription plans are currently available");
      }

      const plan = paidPlans[0];
      console.log("Selected paid plan:", plan);
      
      // Validate plan data
      if (!plan.name || plan.price_monthly == null || plan.price_yearly == null) {
        console.error("Invalid plan data:", plan);
        throw new Error("Subscription plan data is incomplete");
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
      console.log("Fetching all subscription plans...");
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching subscription plans:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("All subscription plans data:", data);

      if (!data || data.length === 0) {
        console.log("No subscription plans found");
        throw new Error("No subscription plans found");
      }

      // Filter out free trial plans
      const paidPlans = data.filter(plan => {
        const nameCheck = plan.name && !plan.name.toLowerCase().includes('free') && !plan.name.toLowerCase().includes('trial');
        const priceCheck = plan.price_monthly > 0;
        return nameCheck && priceCheck;
      });

      console.log("Filtered paid plans:", paidPlans);
      
      if (paidPlans.length === 0) {
        throw new Error("No paid subscription plans available");
      }

      // Validate plans
      const validPlans = paidPlans.filter(plan => 
        plan.name && 
        plan.price_monthly != null && 
        plan.price_yearly != null
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
