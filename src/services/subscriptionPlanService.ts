
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
      
      // This query should work with the new RLS policy that allows anyone to view active plans
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Database error fetching active plan:', error);
        throw error;
      }

      if (!data) {
        console.log("No active subscription plan found");
        return null;
      }

      console.log("Active plan found:", data);
      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
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
      const { data: isAdmin } = await supabase.rpc('is_current_user_admin').catch(() => ({ data: false }));
      
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
        throw error;
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
