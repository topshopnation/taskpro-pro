
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
    console.log('Starting sign out process...');
    
    // Get the current session first to check if it exists
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Clear all browser storage related to authentication
    localStorage.clear();
    sessionStorage.clear();
    
    // If no session exists, just clear local state and return without error
    if (!sessionData?.session) {
      console.log('No active session found, cleaning up client-side state only');
      return;
    }
    
    // Proceed with sign out if session exists
    console.log('Active session found, signing out from Supabase');
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all devices
    });
    
    if (error) {
      console.error('Error signing out from Supabase:', error);
      throw error;
    }
    
    // Ensure all local storage is wiped even after signOut
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Supabase sign out successful');
    toast.success("Signed out successfully");
  } catch (error: any) {
    // If the error is about missing session, handle it gracefully
    if (error.message?.includes('Auth session missing')) {
      console.log('Auth session already cleared, proceeding with navigation');
      return; // Return without error to allow navigation
    }
    
    console.error('Error signing out:', error);
    toast.error("Failed to sign out", { description: error.message });
    throw error;
  } finally {
    // Ensure localStorage is cleared regardless of success or failure
    localStorage.clear();
    sessionStorage.clear();
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
