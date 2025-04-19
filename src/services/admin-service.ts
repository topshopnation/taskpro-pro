
import { supabase } from "@/integrations/supabase/client";
import { AdminRole, AdminUser } from "@/types/adminTypes";
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
  
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Ensure all plans have description and features properties
      return data.map(plan => ({
        ...plan,
        description: plan.description || '',
        features: plan.features || []
      }));
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: any) {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(plan)
        .select()
        .single();
        
      if (error) throw error;
      return {
        ...data,
        description: data.description || '',
        features: data.features || []
      };
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: any) {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update(plan)
        .eq('id', id);
        
      return !error;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  },
  
  async deleteSubscriptionPlan(id: string) {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
        
      return !error;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      return false;
    }
  },
  
  async getUserSubscriptions() {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }
  },
  
  async updateUserSubscription(userId: string, status: string, planType: string) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          plan_type: planType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      return !error;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
  },
  
  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('verify_admin_credentials', {
        input_email: email,
        input_password: password
      });

      if (error || !data) {
        toast.error('Invalid admin credentials');
        return false;
      }

      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);

      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  }
};
