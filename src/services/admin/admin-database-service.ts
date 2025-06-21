
import { supabase } from "@/integrations/supabase/client";

/**
 * Special database service for admin operations that bypasses normal RLS
 * This works because the admin functions are SECURITY DEFINER
 */
export const adminDatabaseService = {
  async getAllUsers() {
    try {
      console.log("Fetching all users for admin...");
      
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Then get all subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subscriptionsError) {
        throw subscriptionsError;
      }

      // Combine the data
      const usersWithSubscriptions = profiles?.map(profile => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
        return {
          ...profile,
          subscription_status: userSubscription?.status || 'none',
          plan_type: userSubscription?.plan_type || 'free',
          current_period_end: userSubscription?.current_period_end,
          trial_end_date: userSubscription?.trial_end_date
        };
      }) || [];

      console.log("Fetched users:", usersWithSubscriptions);
      return usersWithSubscriptions;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  async getAllSubscriptionPlans() {
    try {
      console.log("Fetching all subscription plans for admin...");
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched subscription plans:", data);
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  },

  async getAllSubscriptions() {
    try {
      console.log("Fetching all subscriptions for admin...");
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!inner(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("Fetched subscriptions:", data);
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }
};
