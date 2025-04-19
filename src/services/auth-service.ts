
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/contexts/auth-context";
import { toast } from "sonner";

export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) throw error;
    
    toast.success("Check your email for the confirmation link");
  } catch (error: any) {
    toast.error("Sign up failed", { description: error.message });
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    
    toast.success("Signed in successfully");
  } catch (error: any) {
    toast.error("Sign in failed", { description: error.message });
    throw error;
  }
};

export const signInWithProvider = async (provider: Provider): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error signing in with provider:', error);
    toast.error(`Failed to sign in with ${provider}`, { description: error.message });
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    console.log('Starting sign out process with force clear...');
    
    // Start with a thorough clearing of all local storage and cookies
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear Supabase auth cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    });
    
    // Reset Supabase client state before calling signOut
    await supabase.auth.initialize();
    
    // Now proceed with the sign out operation
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all devices
    });
    
    if (error) {
      console.error('Error signing out from Supabase:', error);
      throw error;
    }
    
    // Final cleanup after successful sign out
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Supabase sign out successful, all storage cleared');
    toast.success("Signed out successfully");
    
    // Force a new initialization of Supabase client
    await supabase.auth.initialize();
    
  } catch (error: any) {
    console.error('Error during sign out:', error);
    toast.error("Failed to sign out", { description: error.message });
    
    // Force cleanup even if there was an error
    localStorage.clear();
    sessionStorage.clear();
    
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success("Profile updated successfully");
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error("Failed to update profile", { description: error.message });
    throw error;
  }
};
