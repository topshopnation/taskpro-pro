
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan, AdminRole } from "@/types/adminTypes";

// Mock data for development until tables are created
const mockAdminUsers = [
  { id: "1", user_id: "123", email: "admin@example.com", role: "admin" as AdminRole },
  { id: "2", user_id: "456", email: "support@example.com", role: "support" as AdminRole }
];

const mockSubscriptionPlans = [
  {
    id: "1",
    name: "Basic",
    description: "Basic plan with essential features",
    price_monthly: 3.00,
    price_yearly: 30.00,
    features: ["Unlimited tasks", "5 projects", "Basic reporting"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Pro",
    description: "Professional plan with advanced features",
    price_monthly: 8.00,
    price_yearly: 80.00,
    features: ["Unlimited tasks", "Unlimited projects", "Advanced reporting", "Priority support"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
  }
};
