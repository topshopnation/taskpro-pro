
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from "@/types/adminTypes";
import { AdminRole } from "@/types/adminTypes";

export const adminService = {
  // Admin users
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  async addAdminUser(userId: string, email: string, role: AdminRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          email,
          role
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding admin user:', error);
      return false;
    }
  },
  
  // Subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: plan.name,
          description: plan.description,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          features: plan.features || [],
          is_active: plan.is_active || true
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: plan.name,
          description: plan.description,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          features: plan.features,
          is_active: plan.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  },
  
  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      return false;
    }
  },
  
  // User management functions
  async getUserSubscriptions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            email
          )
        `);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  },
  
  async updateUserSubscription(userId: string, status: string, planType: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
  }
};
