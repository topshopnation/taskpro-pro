
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlanData {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export const subscriptionPlanService = {
  async getActivePlan(): Promise<SubscriptionPlanData | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching active subscription plan:', error);
        return null;
      }

      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as SubscriptionPlanData;
    } catch (error) {
      console.error('Error in getActivePlan:', error);
      return null;
    }
  },

  async getAllActivePlans(): Promise<SubscriptionPlanData[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) {
        console.error('Error fetching active subscription plans:', error);
        return [];
      }

      return data.map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlanData[];
    } catch (error) {
      console.error('Error in getAllActivePlans:', error);
      return [];
    }
  }
};
