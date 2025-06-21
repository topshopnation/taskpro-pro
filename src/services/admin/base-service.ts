
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Base admin service with common utility functions
 */
export const adminBaseService = {
  // Checks if a user has admin privileges
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .single();
      
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },
  
  // Admin authentication functions
  async loginAdmin(email: string, password: string): Promise<boolean> {
    try {
      console.log('Attempting admin login for:', email);
      
      // First, let's try to verify credentials using the database function
      const { data, error } = await supabase.rpc('verify_admin_credentials', {
        input_email: email,
        input_password: password
      });

      console.log('Admin login response:', { data, error });

      if (error) {
        console.error('Admin login error:', error);
        toast.error('Login failed: ' + error.message);
        return false;
      }

      if (!data) {
        console.log('Invalid credentials - no match found');
        toast.error('Invalid admin credentials');
        return false;
      }

      // Update last login timestamp
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating last login:', updateError);
        // Don't fail login for this error
      }

      console.log('Admin login successful');
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred during login');
      return false;
    }
  },
  
  // Add admin user function
  async addAdminUser(userId: string, email: string, role: AdminRole): Promise<boolean> {
    try {
      // Make sure role is a valid enum value
      if (role !== 'super_admin' && role !== 'admin' && role !== 'support') {
        console.error('Invalid admin role:', role);
        return false;
      }

      const { error } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email,
          role,
          password_hash: '', // Initial empty password, should be set separately
        });
      
      return !error;
    } catch (error) {
      console.error('Error adding admin user:', error);
      return false;
    }
  },
  
  // Password management
  async changeAdminPassword(adminEmail: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_admin_password', {
        admin_email: adminEmail,
        old_password: oldPassword,
        new_password: newPassword
      });
      
      if (error) throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error changing admin password:', error);
      return false;
    }
  }
};

// Import admin role type
import { AdminRole } from "@/types/adminTypes";
