
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
      
      // For now, use a simple hardcoded check for the admin user
      // This is temporary until we can properly set up password hashing
      if (email === 'admin@taskpro.pro' && password === 'eur!trx1JUD!ryk-duy') {
        console.log("Admin credentials verified successfully");
        return true;
      }
      
      console.log("Invalid admin credentials");
      return false;
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
      console.log("Calling update_admin_password function...");
      
      const { data: success, error } = await supabase.rpc('update_admin_password', {
        admin_email: email,
        old_password: oldPassword,
        new_password: newPassword
      });

      if (error) {
        console.error('Error changing admin password:', error);
        return false;
      }

      console.log("Function returned:", success);
      console.log("Admin password changed successfully");
      return success;
    } catch (error) {
      console.error('Error in changeAdminPassword:', error);
      return false;
    }
  }
};
