
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
      console.log('Admin login attempt for:', email);
      
      // Check if the admin user exists
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('email, password_hash')
        .eq('email', email)
        .maybeSingle();

      console.log('Admin user fetch result:', { adminUser, fetchError });

      if (fetchError) {
        console.error('Database error:', fetchError);
        toast.error('Login failed: Database error');
        return false;
      }

      if (!adminUser) {
        console.log('Admin user not found, creating default admin...');
        
        // Create default admin user if it doesn't exist
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: 'admin@taskpro.pro',
            password_hash: 'admin123', // Simple password for testing
            role: 'admin'
          });
        
        if (insertError) {
          console.error('Error creating admin user:', insertError);
          toast.error('Error creating admin user');
          return false;
        }
        
        console.log('Default admin user created successfully');
        
        // Check if this is the newly created user
        if (email === 'admin@taskpro.pro' && password === 'admin123') {
          toast.success('Admin user created and logged in successfully');
          return true;
        } else {
          toast.error('Invalid admin credentials');
          return false;
        }
      }

      // Simple password comparison for now
      console.log('Comparing passwords for existing user');
      
      if (adminUser.password_hash === password) {
        console.log('Password match - login successful');
        
        // Update last login timestamp
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating last login:', updateError);
        }

        toast.success('Admin login successful');
        return true;
      } else {
        console.log('Password mismatch');
        toast.error('Invalid admin credentials');
        return false;
      }
      
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
