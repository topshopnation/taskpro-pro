
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
      // Get user count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get subscription counts
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, plan_type');

      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      const trialUsers = subscriptions?.filter(s => s.status === 'trial').length || 0;
      const expiredSubscriptions = subscriptions?.filter(s => s.status === 'expired').length || 0;

      // Get task count
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      // Get project count
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Calculate revenue (example pricing: $9.99/month, $99.99/year)
      const monthlyRevenue = subscriptions
        ?.filter(s => s.status === 'active' && s.plan_type === 'monthly')
        .length * 9.99 || 0;

      const yearlyRevenue = subscriptions
        ?.filter(s => s.status === 'active' && s.plan_type === 'yearly')
        .length * 99.99 || 0;

      return {
        total_users: usersCount || 0,
        active_subscriptions: activeSubscriptions,
        trial_users: trialUsers,
        expired_subscriptions: expiredSubscriptions,
        total_tasks: tasksCount || 0,
        total_projects: projectsCount || 0,
        revenue_monthly: monthlyRevenue,
        revenue_yearly: yearlyRevenue
      };
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
