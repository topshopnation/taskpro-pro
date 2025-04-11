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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
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

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          setSession(data.session);
          try {
            const profile = await fetchUserProfile(data.session.user.id);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email,
              firstName: profile?.first_name,
              lastName: profile?.last_name,
              avatarUrl: profile?.avatar_url || data.session.user.user_metadata?.avatar_url,
            });
          } catch (error) {
            console.error("Failed to fetch profile:", error);
            setUser({
              id: data.session.user.id,
              email: data.session.user.email,
            });
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string): Promise<void> => {
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

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success("Signed in successfully");
    } catch (error: any) {
      toast.error("Sign in failed", { description: error.message });
      throw error;
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
      console.log("Signing out, current session:", session ? "exists" : "null");
      if (!session) {
        console.warn("No session found during sign out, proceeding anyway");
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      toast.success("Signed out successfully");
      navigate('/auth');
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
