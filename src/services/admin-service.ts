import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, AdminRole } from "@/types/adminTypes";
import { toast } from "sonner";

export const adminService = {
  // Admin users
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      // In a real implementation, this would query the admin_users table
      // For now, use hardcoded mock data
      const admin = mockAdminUsers.find(admin => admin.user_id === userId);
      return !!admin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  async addAdminUser(userId: string, email: string, role: AdminRole): Promise<boolean> {
    try {
      // In a real implementation, this would add a record to admin_users table
      // For now, just simulate success
      console.log('Adding admin user:', {userId, email, role});
      return true;
    } catch (error) {
      console.error('Error adding admin user:', error);
      return false;
    }
  },
  
  // Subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      // In a real implementation, this would query the subscription_plans table
      // For now, use hardcoded mock data
      return mockSubscriptionPlans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    try {
      // In a real implementation, this would add a record to subscription_plans table
      // For now, just simulate success
      const newPlan: SubscriptionPlan = {
        id: Math.random().toString(36).substring(2, 11),
        name: plan.name || "",
        description: plan.description || "",
        price_monthly: plan.price_monthly || 0,
        price_yearly: plan.price_yearly || 0,
        features: plan.features || [],
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Creating subscription plan:', newPlan);
      return newPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>): Promise<boolean> {
    try {
      // In a real implementation, this would update a record in the subscription_plans table
      // For now, just simulate success
      console.log('Updating subscription plan:', {id, ...plan});
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return false;
    }
  },
  
  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    try {
      // In a real implementation, this would delete a record from the subscription_plans table
      // For now, just simulate success
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
      // In a real implementation, this would join subscriptions with user profiles
      // For now, use the actual subscriptions table but without joining to non-existent tables
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
      // First, check if the user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      if (adminError || !adminUser) {
        toast.error('Invalid admin credentials');
        return false;
      }

      // Verify credentials (replace with a more secure method in production)
      const { data, error } = await supabase.rpc('verify_admin_credentials', {
        input_email: email,
        input_password: password
      });

      if (error || !data) {
        toast.error('Authentication failed');
        return false;
      }

      // Update last login timestamp
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      toast.success('Admin login successful');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred');
      return false;
    }
  }
};
