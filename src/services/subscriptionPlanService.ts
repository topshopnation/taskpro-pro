
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
      console.log("Fetching all active subscription plans...");
      
      // Simple query without any user-specific filtering since plans should be public
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Database error fetching plans:', error);
        
        // If RLS is blocking, provide helpful error info
        if (error.message.includes('policy')) {
          console.error('RLS policy error - subscription plans should be publicly readable');
          throw new Error('Subscription plans are not accessible. Please contact support.');
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Raw plans data from database:", data);

      if (!data || data.length === 0) {
        console.log("No active plans found in database");
        return [];
      }

      // Filter out free plans (plans with no pricing) and format the data
      const validPlans = data
        .filter(plan => {
          const isValidPlan = plan.price_monthly > 0 || plan.price_yearly > 0;
          console.log(`Plan ${plan.name}: monthly=${plan.price_monthly}, yearly=${plan.price_yearly}, valid=${isValidPlan}`);
          return isValidPlan;
        })
        .map(plan => ({
          ...plan,
          description: plan.description || '',
          features: Array.isArray(plan.features) ? plan.features : []
        })) as SubscriptionPlanData[];

      console.log("Filtered valid plans for regular users:", validPlans);
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
