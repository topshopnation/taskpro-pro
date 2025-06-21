
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
      
      // Get all active plans and use the most recent one
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Database error fetching active plan:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("No active subscription plan found");
        throw new Error("No active subscription plans are currently available");
      }

      const plan = data[0];
      console.log("Active plan found:", plan);
      
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
      
      // Check if user is admin to get all plans, otherwise only active ones
      let isAdmin = false;
      try {
        const { data } = await supabase.rpc('is_current_user_admin');
        isAdmin = data === true;
      } catch (adminCheckError) {
        console.log('Could not check admin status, proceeding as non-admin');
        isAdmin = false;
      }
      
      let query = supabase.from('subscription_plans').select('*');
      
      if (isAdmin) {
        console.log("User is admin, fetching all plans");
        query = query.order('created_at', { ascending: false });
      } else {
        console.log("User is not admin, fetching only active plans");
        query = query.eq('is_active', true).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error fetching subscription plans:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error("No subscription plans found");
      }

      console.log("All plans found:", data);
      return (data || []).map(plan => ({
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
