
import { supabase } from "@/integrations/supabase/client";
import { AdminRole } from "@/types/adminTypes";

/**
 * Base admin service for authentication and admin user management
 */
export const adminBaseService = {
  async isUserAdmin(): Promise<boolean> {
    try {
      console.log("Checking if current user is admin...");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return false;
      }

      console.log("Current user:", user.email);

      // Use the new security definer function to check admin status
      const { data, error } = await supabase.rpc('is_current_user_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      console.log("Admin check result:", data);
      return data === true;
    } catch (error) {
      console.error('Error in isUserAdmin:', error);
      return false;
    }
  },

  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      console.log("Attempting admin login for:", email);
      
      // First verify admin credentials using the database function
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_admin_credentials', {
        input_email: email,
        input_password: password
      });

      if (verifyError) {
        console.error('Error verifying admin credentials:', verifyError);
        return false;
      }

      if (!isValid) {
        console.log("Invalid admin credentials");
        return false;
      }

      // Now we need to check if this admin email corresponds to a regular user account
      // If not, we'll create a temporary profile for admin access
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return false;
      }

      if (!profileData) {
        console.log("No profile found for admin email, admin login confirmed via database");
        // For admin-only accounts, we'll store the session in localStorage as before
        // but also mark it for database access
        return true;
      } else {
        console.log("Profile found for admin email, can use regular Supabase auth");
        // This admin has a regular user account, so we could potentially sign them in
        // For now, we'll just confirm they're an admin
        return true;
      }
    } catch (error) {
      console.error('Error in loginAdmin:', error);
      return false;
    }
  },

  async addAdminUser(email: string, password: string, role: AdminRole = 'admin'): Promise<boolean> {
    try {
      console.log("Adding new admin user:", email);
      
      // Use the new add_admin_user function
      const { data: success, error } = await supabase.rpc('add_admin_user', {
        admin_email: email,
        admin_password: password,
        admin_role: role
      });

      if (error) {
        console.error('Error adding admin user:', error);
        return false;
      }

      console.log("Admin user added successfully");
      return success === true;
    } catch (error) {
      console.error('Error in addAdminUser:', error);
      return false;
    }
  },

  async changeAdminPassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      console.log("Changing password for admin:", email);
      
      const { data: success, error } = await supabase.rpc('update_admin_password', {
        admin_email: email,
        old_password: oldPassword,
        new_password: newPassword
      });

      if (error) {
        console.error('Error changing admin password:', error);
        return false;
      }

      console.log("Admin password changed successfully");
      return success;
    } catch (error) {
      console.error('Error in changeAdminPassword:', error);
      return false;
    }
  }
};
