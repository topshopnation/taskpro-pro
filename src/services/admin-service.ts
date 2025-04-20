import { supabase } from "@/integrations/supabase/client";
import { AdminRole, AdminUser, SubscriptionPlan, UserProfile } from "@/types/adminTypes";
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
  
  async changeAdminPassword(adminEmail: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_admin_password', {
        admin_email: adminEmail,
        old_password: oldPassword,
        new_password: newPassword
      });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error changing admin password:', error);
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
      
      // Transform the data to ensure all plans have description and features
      return (data || []).map(plan => ({
        ...plan,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : []
      })) as SubscriptionPlan[];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },
  
  async createSubscriptionPlan(plan: Partial<SubscriptionPlan>) {
    try {
      // Ensure required fields are present
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        console.error('Missing required fields for subscription plan');
        return null;
      }

      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: plan.name,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          description: plan.description || '',
          features: plan.features || [],
          is_active: plan.is_active !== undefined ? plan.is_active : true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : []
      } as SubscriptionPlan;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      return null;
    }
  },
  
  async updateSubscriptionPlan(id: string, plan: Partial<SubscriptionPlan>) {
    try {
      // Ensure we have the required fields
      if (!plan.name || plan.price_monthly === undefined || plan.price_yearly === undefined) {
        console.error('Missing required fields for subscription plan update');
        return false;
      }
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: plan.name,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          description: plan.description || '',
          features: plan.features || [],
          is_active: plan.is_active
        })
        .eq('id', id);
        
      if (error) throw error;
      return true;
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
  },
  
  async getActivityLogs(): Promise<any[]> {
    try {
      // Instead of querying auth_events directly, focus on profile and subscription changes
      // which are tables we know exist in our schema
      
      // Get the last 100 profile updates
      const { data: profileEvents, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
        
      if (profileError) throw profileError;
      
      // Get the last 100 subscription updates
      const { data: subscriptionEvents, error: subError } = await supabase
        .from('subscriptions')
        .select('user_id, status, plan_type, updated_at')
        .order('updated_at', { ascending: false })
        .limit(100);
        
      if (subError) throw subError;
      
      // Create simulated auth events based on profile creation dates
      // This is a workaround since we can't directly access auth events
      const { data: recentProfiles, error: recentProfilesError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (recentProfilesError) throw recentProfilesError;
      
      const simulatedAuthEvents = (recentProfiles || []).map(profile => ({
        type: 'auth',
        timestamp: profile.created_at,
        details: {
          user_id: profile.id,
          event_type: 'signup',
          created_at: profile.created_at
        }
      }));
      
      // Combine all events and sort by timestamp
      const allEvents = [
        ...simulatedAuthEvents,
        ...(profileEvents || []).map(event => ({
          type: 'profile',
          timestamp: event.updated_at,
          details: event
        })),
        ...(subscriptionEvents || []).map(event => ({
          type: 'subscription',
          timestamp: event.updated_at,
          details: event
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return allEvents.slice(0, 100); // Return only the most recent 100 events
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }
};
