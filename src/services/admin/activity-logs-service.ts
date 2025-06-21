
import { supabase } from "@/integrations/supabase/client";

export type ActivityLog = {
  id: string;
  type: 'auth' | 'profile' | 'subscription' | 'task' | 'project';
  action: string;
  timestamp: string;
  user_email?: string;
  details: any;
};

export const activityLogsService = {
  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      console.log("Fetching activity logs...");
      const logs: ActivityLog[] = [];

      // Get recent user signups from profiles with error handling
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);

        if (profilesError) {
          console.error('Error fetching profiles for activity logs:', profilesError);
        } else if (profiles) {
          profiles.forEach(profile => {
            logs.push({
              id: `profile-create-${profile.id}`,
              type: 'auth',
              action: 'User Registration',
              timestamp: profile.created_at,
              user_email: profile.email,
              details: {
                user_id: profile.id,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                action: 'registered'
              }
            });

            // Add profile update logs if updated_at is significantly different from created_at
            if (profile.updated_at && profile.updated_at !== profile.created_at) {
              const updateTime = new Date(profile.updated_at).getTime();
              const createTime = new Date(profile.created_at).getTime();
              
              // Only log if updated more than 1 minute after creation
              if (updateTime - createTime > 60000) {
                logs.push({
                  id: `profile-update-${profile.id}-${profile.updated_at}`,
                  type: 'profile',
                  action: 'Profile Update',
                  timestamp: profile.updated_at,
                  user_email: profile.email,
                  details: {
                    user_id: profile.id,
                    email: profile.email,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    action: 'updated profile'
                  }
                });
              }
            }
          });
        }
      } catch (err) {
        console.error('Error processing profiles for activity logs:', err);
      }

      // Get recent subscription changes with error handling
      try {
        const { data: subscriptions, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);

        if (subscriptionsError) {
          console.error('Error fetching subscriptions for activity logs:', subscriptionsError);
        } else if (subscriptions) {
          // Get profiles for email lookup
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email');

          subscriptions.forEach(subscription => {
            const userProfile = profiles?.find(p => p.id === subscription.user_id);
            
            logs.push({
              id: `subscription-create-${subscription.id}`,
              type: 'subscription',
              action: 'Subscription Created',
              timestamp: subscription.created_at,
              user_email: userProfile?.email,
              details: {
                user_id: subscription.user_id,
                status: subscription.status,
                plan_type: subscription.plan_type,
                action: 'subscription created'
              }
            });

            // Add subscription update logs
            if (subscription.updated_at && subscription.updated_at !== subscription.created_at) {
              const updateTime = new Date(subscription.updated_at).getTime();
              const createTime = new Date(subscription.created_at).getTime();
              
              if (updateTime - createTime > 60000) {
                logs.push({
                  id: `subscription-update-${subscription.id}-${subscription.updated_at}`,
                  type: 'subscription',
                  action: 'Subscription Updated',
                  timestamp: subscription.updated_at,
                  user_email: userProfile?.email,
                  details: {
                    user_id: subscription.user_id,
                    status: subscription.status,
                    plan_type: subscription.plan_type,
                    action: 'subscription updated'
                  }
                });
              }
            }
          });
        }
      } catch (err) {
        console.error('Error processing subscriptions for activity logs:', err);
      }

      // Get recent task activities with error handling
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

        if (tasksError) {
          console.error('Error fetching tasks for activity logs:', tasksError);
        } else if (tasks) {
          // Get profiles for email lookup
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email');

          tasks.forEach(task => {
            const userProfile = profiles?.find(p => p.id === task.user_id);
            
            logs.push({
              id: `task-create-${task.id}`,
              type: 'task',
              action: 'Task Created',
              timestamp: task.created_at,
              user_email: userProfile?.email,
              details: {
                user_id: task.user_id,
                task_title: task.title,
                project_id: task.project_id,
                action: 'created task'
              }
            });
          });
        }
      } catch (err) {
        console.error('Error processing tasks for activity logs:', err);
      }

      // Get recent project activities with error handling
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);

        if (projectsError) {
          console.error('Error fetching projects for activity logs:', projectsError);
        } else if (projects) {
          // Get profiles for email lookup
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email');

          projects.forEach(project => {
            const userProfile = profiles?.find(p => p.id === project.user_id);
            
            logs.push({
              id: `project-create-${project.id}`,
              type: 'project',
              action: 'Project Created',
              timestamp: project.created_at,
              user_email: userProfile?.email,
              details: {
                user_id: project.user_id,
                project_name: project.name,
                action: 'created project'
              }
            });
          });
        }
      } catch (err) {
        console.error('Error processing projects for activity logs:', err);
      }

      // Sort by timestamp (newest first) and limit to 100 most recent
      const sortedLogs = logs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);

      console.log("Activity logs fetched:", sortedLogs.length);
      return sortedLogs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }
};
