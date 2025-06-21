import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/adminTypes";

export const userManagementService = {
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      console.log('Starting to fetch all users...');
      
      // Get all profiles (this is safer than trying to access auth.admin)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Get all subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        // Don't throw here, continue without subscription data
      }

      console.log('Profiles found:', profiles?.length || 0);
      console.log('Subscriptions found:', subscriptions?.length || 0);

      // Build users array from profiles
      const users: UserProfile[] = (profiles || []).map(profile => {
        const userSubscription = subscriptions?.find(sub => sub.user_id === profile.id);
        
        console.log(`Processing user ${profile.id}:`, {
          hasProfile: true,
          hasSubscription: !!userSubscription,
          email: profile.email
        });
        
        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          subscription_status: userSubscription?.status || 'none',
          plan_type: userSubscription?.plan_type || 'none',
          current_period_end: userSubscription?.current_period_end,
          trial_end_date: userSubscription?.trial_end_date,
          role: profile.role || 'user',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_login: profile.updated_at
        };
      });

      console.log('Final users array:', users.length, users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          email: updates.email,
          role: updates.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  async updateUserSubscription(userId: string, status: string, planType: string) {
    try {
      // Check if subscription exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingSub) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status,
            plan_type: planType,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            status,
            plan_type: planType,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
  },

  async deleteUser(userId: string) {
    try {
      // Delete user's subscription first
      await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', userId);

      // Delete user's tasks
      await supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId);

      // Delete user's projects
      await supabase
        .from('projects')
        .delete()
        .eq('user_id', userId);

      // Delete user's filters
      await supabase
        .from('filters')
        .delete()
        .eq('user_id', userId);

      // Finally delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
};
