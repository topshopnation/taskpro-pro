
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from "@/types/adminTypes";

/**
 * Admin service for managing subscription plans
 */
export const subscriptionPlansService = {
  async getSubscriptionPlans() {
    try {
      console.log("Fetching subscription plans...");
      
      // Check if current user is admin for full access
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_current_user_admin');
      
      if (adminCheckError) {
        console.error('Error checking admin status:', adminCheckError);
        // Fall back to public access (only active plans)
      }

      let query = supabase.from('subscription_plans').select('*');
      
      if (isAdmin) {
        console.log('User is admin, fetching all plans');
        // Admin can see all plans
        query = query.order('created_at', { ascending: false });
      } else {
        console.log('User is not admin, fetching only active plans');
        // Non-admin can only see active plans
        query = query.eq('is_active', true).order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Database error fetching subscription plans:', error);
        throw error;
      }
      
      console.log("Fetched plans:", data);
      return (data || []).map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlan[];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>) {
    try {
      console.log("Creating subscription plan:", plan);
      
      // Check if current user is admin
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_current_user_admin');
      
      if (adminCheckError || !isAdmin) {
        console.error('User is not admin, cannot create plan');
        throw new Error('Admin access required');
      }
      
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        throw new Error('Missing required fields for subscription plan');
      }

      // Deactivate all other plans if this one is being set to active
      if (plan.is_active) {
        const { error: deactivateError } = await supabase
          .from('subscription_plans')
          .update({ is_active: false })
          .neq('id', 'temp'); // This will match all existing records
        
        if (deactivateError) {
          console.error('Error deactivating other plans:', deactivateError);
        }
      }

      const planData = {
        name: plan.name,
        price_monthly: Number(plan.price_monthly),
        price_yearly: Number(plan.price_yearly),
        description: plan.description || '',
        features: plan.features || [],
        is_active: plan.is_active !== undefined ? plan.is_active : true
      };

      console.log("Inserting plan data:", planData);

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) {
        console.error('Database error creating subscription plan:', error);
        throw error;
      }
      
      console.log("Created plan:", data);
      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>) {
    try {
      console.log("Updating subscription plan:", id, plan);
      
      // Check if current user is admin
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_current_user_admin');
      
      if (adminCheckError || !isAdmin) {
        console.error('User is not admin, cannot update plan');
        throw new Error('Admin access required');
      }
      
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        throw new Error('Missing required fields for subscription plan update');
      }
      
      // Deactivate all other plans if this one is being set to active
      if (plan.is_active) {
        const { error: deactivateError } = await supabase
          .from('subscription_plans')
          .update({ is_active: false })
          .neq('id', id);
        
        if (deactivateError) {
          console.error('Error deactivating other plans:', deactivateError);
        }
      }
      
      const updateData = {
        name: plan.name,
        price_monthly: Number(plan.price_monthly),
        price_yearly: Number(plan.price_yearly),
        description: plan.description || '',
        features: plan.features || [],
        is_active: plan.is_active
      };

      console.log("Update data:", updateData);

      const { error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id);
        
      if (error) {
        console.error('Database error updating subscription plan:', error);
        throw error;
      }
      
      console.log("Plan updated successfully");
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw error;
    }
  },
  
  async deleteSubscriptionPlan(id: string) {
    try {
      console.log("Deleting subscription plan:", id);
      
      // Check if current user is admin
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_current_user_admin');
      
      if (adminCheckError || !isAdmin) {
        console.error('User is not admin, cannot delete plan');
        throw new Error('Admin access required');
      }
      
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Database error deleting subscription plan:', error);
        throw error;
      }
      
      console.log("Plan deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      throw error;
    }
  }
};
