
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
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .gt('price_monthly', 0) // Only paid plans
        .order('price_monthly', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Database error fetching active plan:', error);
        return null;
      }

      console.log("Found active plan:", data);
      
      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as SubscriptionPlanData;
    } catch (error) {
      console.error('Error fetching active subscription plan:', error);
      return null;
    }
  }
};
