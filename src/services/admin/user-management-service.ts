
import { supabase } from "@/integrations/supabase/client";
import { adminDatabaseService } from "./admin-database-service";

export const userManagementService = {
  async getAllUsers() {
    return adminDatabaseService.getAllUsers();
  },

  async updateUserProfile(userId: string, updates: { first_name?: string; last_name?: string; email?: string }) {
    try {
      console.log("Updating user profile:", userId, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("User profile updated:", data);
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async updateUserSubscription(userId: string, updates: { status?: string; plan_type?: string }) {
    try {
      console.log("Updating user subscription:", userId, updates);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("User subscription updated:", data);
      return data;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  },

  async deleteUser(userId: string) {
    try {
      console.log("Deleting user:", userId);
      
      // Delete from profiles table (this should cascade to other tables)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log("User deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
