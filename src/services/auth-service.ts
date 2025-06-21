
import { supabase } from "@/integrations/supabase/client";
import { Provider } from "@/contexts/auth-context";
import { toast } from "sonner";

export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: redirectUrl,
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
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
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
    
    // Clear all auth-related storage
    const clearAuthStorage = () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('taskpro_')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key.startsWith('taskpro_')) {
          sessionStorage.removeItem(key);
        }
      });
    };
    
    // Clear storage first
    clearAuthStorage();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut({
      scope: 'global'
    });
    
    if (error) {
      console.error('Error signing out from Supabase:', error);
      // Still proceed with cleanup even if sign out fails
    }
    
    // Final cleanup
    clearAuthStorage();
    
    console.log('Sign out completed, redirecting to home');
    toast.success("Signed out successfully");
    
    // Force page reload to ensure clean state
    window.location.href = '/';
    
  } catch (error: any) {
    console.error('Error during sign out:', error);
    toast.error("Failed to sign out", { description: error.message });
    
    // Force cleanup and redirect even on error
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
    
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
