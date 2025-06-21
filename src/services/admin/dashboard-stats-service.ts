
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  total_users: number;
  active_subscriptions: number;
  trial_users: number;
  expired_subscriptions: number;
  total_tasks: number;
  total_projects: number;
  revenue_monthly: number;
  revenue_yearly: number;
}

export const dashboardStatsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log("Fetching dashboard stats...");

      // Initialize default stats
      const stats: DashboardStats = {
        total_users: 0,
        active_subscriptions: 0,
        trial_users: 0,
        expired_subscriptions: 0,
        total_tasks: 0,
        total_projects: 0,
        revenue_monthly: 0,
        revenue_yearly: 0
      };

      // Get user count with error handling
      try {
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('Error counting users:', usersError);
        } else {
          stats.total_users = usersCount || 0;
        }
      } catch (err) {
        console.error('Error fetching user count:', err);
      }

      // Get subscription data with error handling
      try {
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('status, plan_type');

        if (subscriptionsError) {
          console.error('Error fetching subscriptions:', subscriptionsError);
        } else {
          const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
          const trialUsers = subscriptions?.filter(s => s.status === 'trial').length || 0;
          const expiredSubscriptions = subscriptions?.filter(s => s.status === 'expired').length || 0;

          stats.active_subscriptions = activeSubscriptions;
          stats.trial_users = trialUsers;
          stats.expired_subscriptions = expiredSubscriptions;

          // Calculate revenue (example pricing: $9.99/month, $99.99/year)
          const monthlyRevenue = subscriptions
            ?.filter(s => s.status === 'active' && s.plan_type === 'monthly')
            .length * 9.99 || 0;

          const yearlyRevenue = subscriptions
            ?.filter(s => s.status === 'active' && s.plan_type === 'yearly')
            .length * 99.99 || 0;

          stats.revenue_monthly = monthlyRevenue;
          stats.revenue_yearly = yearlyRevenue;
        }
      } catch (err) {
        console.error('Error fetching subscription data:', err);
      }

      // Get task count with error handling
      try {
        const { count: tasksCount, error: tasksError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });

        if (tasksError) {
          console.error('Error counting tasks:', tasksError);
        } else {
          stats.total_tasks = tasksCount || 0;
        }
      } catch (err) {
        console.error('Error fetching task count:', err);
      }

      // Get project count with error handling
      try {
        const { count: projectsCount, error: projectsError } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        if (projectsError) {
          console.error('Error counting projects:', projectsError);
        } else {
          stats.total_projects = projectsCount || 0;
        }
      } catch (err) {
        console.error('Error fetching project count:', err);
      }

      console.log("Dashboard stats calculated:", stats);
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_users: 0,
        active_subscriptions: 0,
        trial_users: 0,
        expired_subscriptions: 0,
        total_tasks: 0,
        total_projects: 0,
        revenue_monthly: 0,
        revenue_yearly: 0
      };
    }
  }
};
