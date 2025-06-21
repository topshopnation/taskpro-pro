
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const getSubscriptionPlan = async (supabase: any) => {
  const { data: plans, error: planError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .gt('price_monthly', 0)
    .order('created_at', { ascending: false });
  
  if (planError) {
    console.error('Error fetching subscription plans:', planError);
    throw new Error('Failed to fetch subscription plans');
  }
  
  if (!plans || plans.length === 0) {
    console.error('No paid subscription plans found');
    throw new Error('No paid subscription plans are currently available');
  }
  
  return plans[0];
};

export const validatePlanPricing = (plan: any, planType: 'monthly' | 'yearly') => {
  const planPrice = planType === 'yearly' ? plan.price_yearly : plan.price_monthly;
  if (!planPrice || planPrice <= 0) {
    console.error(`Invalid pricing for ${planType} plan:`, planPrice);
    throw new Error(`${planType} plan pricing is not available`);
  }
  return planPrice;
};
