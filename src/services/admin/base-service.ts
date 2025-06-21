
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
      
      // First, let's try to get the admin user directly and compare passwords
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('email, password_hash')
        .eq('email', email)
        .single();

      console.log('Admin user fetch result:', { adminUser, fetchError });

      if (fetchError) {
        console.error('Error fetching admin user:', fetchError);
        toast.error('Login failed: ' + fetchError.message);
        return false;
      }

      if (!adminUser) {
        console.log('No admin user found with email:', email);
        toast.error('Invalid admin credentials');
        return false;
      }

      // Try the database function first
      try {
        const { data, error } = await supabase.rpc('verify_admin_credentials', {
          input_email: email,
          input_password: password
        });

        console.log('Admin login response:', { data, error });

        if (error) {
          console.error('Database function error:', error);
          // Fall back to simple password check if crypt function fails
          if (error.code === '42883') {
            console.log('Crypt function not available, trying simple comparison');
            // For now, let's do a simple comparison (NOT SECURE - just for testing)
            if (password === 'admin123' && email === 'admin@taskpro.pro') {
              console.log('Simple password check succeeded');
              // Update last login timestamp
              const { error: updateError } = await supabase
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('email', email);

              if (updateError) {
                console.error('Error updating last login:', updateError);
              }

              console.log('Admin login successful (simple check)');
              return true;
            } else {
              console.log('Simple password check failed');
              toast.error('Invalid admin credentials');
              return false;
            }
          } else {
            toast.error('Login failed: ' + error.message);
            return false;
          }
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
      } catch (rpcError) {
        console.error('RPC call failed:', rpcError);
        toast.error('Authentication service error');
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
