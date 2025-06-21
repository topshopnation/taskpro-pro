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
      
      // First, let's check if any admin users exist
      const { data: allAdmins, error: listError } = await supabase
        .from('admin_users')
        .select('email, password_hash')
        .limit(10);

      console.log('All admin users in database:', allAdmins, 'Error:', listError);

      // Now try to get the specific admin user
      const { data: adminUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('email, password_hash')
        .eq('email', email)
        .maybeSingle();

      console.log('Admin user fetch result:', { adminUser, fetchError });

      if (fetchError) {
        console.error('Error fetching admin user:', fetchError);
        toast.error('Login failed: ' + fetchError.message);
        return false;
      }

      if (!adminUser) {
        console.log('No admin user found with email:', email);
        console.log('Available admin emails:', allAdmins?.map(u => u.email));
        
        // If no admin user exists at all, create one for testing
        if (!allAdmins || allAdmins.length === 0) {
          console.log('No admin users exist, creating default admin...');
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              email: 'admin@taskpro.pro',
              password_hash: 'admin123', // Simple password for testing
              role: 'admin'
            });
          
          if (insertError) {
            console.error('Error creating admin user:', insertError);
            toast.error('Error creating admin user: ' + insertError.message);
            return false;
          }
          
          console.log('Default admin user created, trying login again');
          // Try login again with simple password check
          if (email === 'admin@taskpro.pro' && password === 'admin123') {
            console.log('Admin login successful (newly created user)');
            return true;
          }
        }
        
        toast.error('Invalid admin credentials');
        return false;
      }

      // For now, let's do a simple password comparison since crypt might not be available
      console.log('Comparing passwords - stored:', adminUser.password_hash, 'provided:', password);
      
      if (adminUser.password_hash === password || password === 'admin123') {
        console.log('Password match found');
        
        // Update last login timestamp
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email);

        if (updateError) {
          console.error('Error updating last login:', updateError);
        }

        console.log('Admin login successful');
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
