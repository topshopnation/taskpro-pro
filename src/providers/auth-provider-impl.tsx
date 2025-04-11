
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Provider, AuthContextType } from "@/contexts/auth-context";
import { AuthContext } from "@/contexts/auth-context";
import { fetchUserProfile } from "@/utils/auth-utils";

export function AuthProviderImpl({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
          // Use setTimeout to prevent potential deadlocks with Supabase auth
          setTimeout(async () => {
            try {
              const profile = await fetchUserProfile(newSession.user.id);
              setUser({
                id: newSession.user.id,
                email: newSession.user.email,
                firstName: profile?.first_name,
                lastName: profile?.last_name,
                avatarUrl: profile?.avatar_url || newSession.user.user_metadata?.avatar_url,
              });
            } catch (error) {
              console.error("Failed to fetch profile:", error);
              setUser({
                id: newSession.user.id,
                email: newSession.user.email,
              });
            }
          }, 0);
          
          if (event === 'SIGNED_IN') {
            navigate('/today');
          }
        } else {
          setUser(null);
          setSession(null);
          
          if (event === 'SIGNED_OUT') {
            navigate('/auth');
          }
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Initial session check:", existingSession ? "session exists" : "no session");
      
      if (existingSession?.user) {
        setSession(existingSession);
        fetchUserProfile(existingSession.user.id).then(profile => {
          setUser({
            id: existingSession.user.id,
            email: existingSession.user.email,
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            avatarUrl: profile?.avatar_url || existingSession.user.user_metadata?.avatar_url,
          });
        }).catch(error => {
          console.error("Failed to fetch profile:", error);
          setUser({
            id: existingSession.user.id,
            email: existingSession.user.email,
          });
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string) => {
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
      return { error: null };
    } catch (error: any) {
      toast.error("Sign up failed", { description: error.message });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success("Signed in successfully");
      return { error: null };
    } catch (error: any) {
      toast.error("Sign in failed", { description: error.message });
      return { error };
    }
  };
  
  const signInWithProvider = async (provider: Provider): Promise<void> => {
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
  
  const updateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    try {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          avatar_url: data.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
          avatarUrl: data.avatarUrl || prev.avatarUrl
        };
      });
      
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile", { description: error.message });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out", { description: error.message });
      throw error;
    }
  };

  const authContextValue: AuthContextType = {
    user, 
    session, 
    signUp, 
    signIn, 
    signOut, 
    signInWithProvider, 
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
