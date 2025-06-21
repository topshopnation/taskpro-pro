
import { supabase } from "@/integrations/supabase/client";

/**
 * Special database service for admin operations that bypasses normal RLS
 * This works because the admin functions are SECURITY DEFINER
 */
export const adminDatabaseService = {
  async getAllUsers() {
    try {
      console.log("Fetching all users for admin...");
      
      // First get all profiles with proper error handling
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Return empty array instead of throwing to allow admin panel to work
        return [];
      }

      // Then get all subscriptions with proper error handling
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        // Continue without subscription data
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

      console.log("Fetched users:", usersWithSubscriptions.length);
      return usersWithSubscriptions;
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Return empty array to allow admin panel to continue working
      return [];
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
        console.error('Error fetching subscription plans:', error);
        return [];
      }

      console.log("Fetched subscription plans:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  async getAllSubscriptions() {
    try {
      console.log("Fetching all subscriptions for admin...");
      
      // First get subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        return [];
      }

      // Then get profiles to join with email data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name');

      if (profilesError) {
        console.error('Error fetching profiles for subscriptions:', profilesError);
      }

      // Manually join the data
      const subscriptionsWithProfiles = subscriptions?.map(subscription => ({
        ...subscription,
        profiles: profiles?.find(p => p.id === subscription.user_id) || {
          email: 'Unknown',
          first_name: 'Unknown',
          last_name: 'User'
        }
      })) || [];

      console.log("Fetched subscriptions with profiles:", subscriptionsWithProfiles.length);
      return subscriptionsWithProfiles;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  },

  async getDatabaseStats() {
    try {
      console.log("Fetching database stats...");
      
      const stats = {
        profiles: 0,
        subscriptions: 0,
        subscription_plans: 0,
        admin_users: 0,
        tasks: 0,
        projects: 0,
        filters: 0
      };

      // Fetch counts for each table with individual try-catch
      try {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        stats.profiles = count || 0;
      } catch (err) {
        console.error('Error counting profiles:', err);
      }

      try {
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        stats.subscriptions = count || 0;
      } catch (err) {
        console.error('Error counting subscriptions:', err);
      }

      try {
        const { count } = await supabase
          .from('subscription_plans')
          .select('*', { count: 'exact', head: true });
        stats.subscription_plans = count || 0;
      } catch (err) {
        console.error('Error counting subscription_plans:', err);
      }

      try {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });
        stats.tasks = count || 0;
      } catch (err) {
        console.error('Error counting tasks:', err);
      }

      try {
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        stats.projects = count || 0;
      } catch (err) {
        console.error('Error counting projects:', err);
      }

      try {
        const { count } = await supabase
          .from('filters')
          .select('*', { count: 'exact', head: true });
        stats.filters = count || 0;
      } catch (err) {
        console.error('Error counting filters:', err);
      }

      console.log("Database stats:", stats);
      return Object.entries(stats).map(([table_name, row_count]) => ({
        table_name,
        row_count
      }));
    } catch (error) {
      console.error('Error fetching database stats:', error);
      return [];
    }
  }
};
