
import { supabase } from "@/integrations/supabase/client";

export type ActivityLog = {
  type: 'auth' | 'profile' | 'subscription';
  timestamp: string;
  details: any;
};

export const activityLogsService = {
  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      // Get user signup activity from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Get subscription activity
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const logs: ActivityLog[] = [];

      // Add profile creation logs
      if (profiles) {
        profiles.forEach(profile => {
          logs.push({
            type: 'auth',
            timestamp: profile.created_at,
            details: {
              user_id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name
            }
          });

          // Add profile update logs if updated_at is different from created_at
          if (profile.updated_at !== profile.created_at) {
            logs.push({
              type: 'profile',
              timestamp: profile.updated_at,
              details: {
                user_id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name
              }
            });
          }
        });
      }

      // Add subscription logs
      if (subscriptions) {
        subscriptions.forEach(subscription => {
          logs.push({
            type: 'subscription',
            timestamp: subscription.created_at,
            details: {
              user_id: subscription.user_id,
              status: subscription.status,
              plan_type: subscription.plan_type
            }
          });

          // Add subscription update logs if updated_at is different from created_at
          if (subscription.updated_at !== subscription.created_at) {
            logs.push({
              type: 'subscription',
              timestamp: subscription.updated_at,
              details: {
                user_id: subscription.user_id,
                status: subscription.status,
                plan_type: subscription.plan_type
              }
            });
          }
        });
      }

      // Sort by timestamp (newest first)
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }
};
