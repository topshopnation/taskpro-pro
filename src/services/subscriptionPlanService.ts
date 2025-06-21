
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
  async getActivePlans(): Promise<SubscriptionPlanData[]> {
    try {
      console.log("Fetching paid subscription plans...");
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .gt('price_monthly', 0) // Only get plans with actual pricing
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Database error fetching plans:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Raw paid plans data from database:", data);

      if (!data || data.length === 0) {
        console.log("No paid plans found in database");
        return [];
      }

      // Format the data
      const validPlans = data.map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlanData[];

      console.log("Valid paid plans:", validPlans);
      return validPlans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  async getActivePlan(): Promise<SubscriptionPlanData | null> {
    try {
      const plans = await this.getActivePlans();
      return plans.length > 0 ? plans[0] : null;
    } catch (error) {
      console.error('Error fetching active plan:', error);
      return null;
    }
  }
};
