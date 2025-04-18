
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, AdminRole, AdminUser, mockAdminUsers, mockSubscriptionPlans } from "@/types/adminTypes";
import { toast } from "sonner";

export const adminService = {
  // Admin users
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single();
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  async addAdminUser(userId: string, email: string, role: AdminRole): Promise<boolean> {
    try {
      // Make sure role is a valid enum value
      if (role !== 'super_admin' && role !== 'admin' && role !== 'support') {
        console.error('Invalid admin role:', role);
        return false;
      }

      const { error } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email,
          role,
          password_hash: '', // Initial empty password, should be set separately
        });
      
      return !error;
    } catch (error) {
      console.error('Error adding admin user:', error);
      return false;
    }
  },
  
  // Subscription plans - mock implementation for now
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return mockSubscriptionPlans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      const newPlan: SubscriptionPlan = {
        id: crypto.randomUUID(),
        name: plan.name || "",
        description: plan.description || "",
        price_monthly: plan.price_monthly || 0,
        price_yearly: plan.price_yearly || 0,
        features: plan.features || [],
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<boolean> {
    try {
      console.log('Updating subscription plan:', {id, ...plan});
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  },
  
  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    try {
      console.log('Deleting subscription plan:', id);
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
        .select('*');
      
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
  },
  
  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      // Use the Supabase RPC to verify admin credentials
      const { data, error } = await supabase.rpc('verify_admin_credentials', {
        input_email: email,
        input_password: password
      });

      if (error) {
        toast.error('Authentication failed');
        return false;
      }

      if (!data) {
        toast.error('Invalid admin credentials');
        return false;
      }

      // Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);

      toast.success('Admin login successful');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  }
};
