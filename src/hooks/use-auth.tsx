
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Provider, Session } from "@supabase/supabase-js";
import { useToast } from "./use-toast";
import { useNavigate, useLocation } from "react-router-dom";

type User = {
  id: string;
  email?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  // Update user state with auth and profile data
  const updateUserState = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const profile = await fetchUserProfile(authUser.id);
    
    setUser({
      id: authUser.id,
      email: authUser.email,
      avatarUrl: profile?.avatar_url || authUser.user_metadata?.avatar_url,
      firstName: profile?.first_name,
      lastName: profile?.last_name,
    });
  };

  useEffect(() => {
    console.log("Auth provider initializing");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
          await updateUserState(newSession.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      console.log("Initial session check:", existingSession ? "session exists" : "no session");
      
      if (existingSession?.user) {
        setSession(existingSession);
        await updateUserState(existingSession.user);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect to handle redirects based on auth state
  useEffect(() => {
    if (loading) return;

    // Check if we're already on the auth page or callback page
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
    
    // Redirect logic for authenticated users
    if (user && isAuthPage) {
      console.log("User authenticated, redirecting to dashboard from auth page");
      navigate('/');
    }
    
    // Redirect logic for unauthenticated users
    if (!user && !isAuthPage && location.pathname !== '/') {
      console.log("No user, redirecting to /auth from protected page");
      navigate('/auth');
    } else if (!user && location.pathname === '/') {
      console.log("No user on root route, redirecting to /auth");
      navigate('/auth');
    }
  }, [user, loading, location.pathname, navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email/password");
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Signed in",
        description: "You have successfully signed in.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up with email/password");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        toast({
          title: "Error signing up",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Signed up",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // We'll let the auth state change event handle the navigation
      toast({
        title: "Signed out",
        description: "You have been signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      console.log(`Signing in with ${provider}`);
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log("Using redirect URL:", redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          // Add scopes that might be needed
          scopes: provider === 'github' ? 'user:email' : undefined,
        },
      });

      if (error) {
        toast({
          title: "Error signing in",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfile = async (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    try {
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

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        firstName: data.firstName ?? prev.firstName,
        lastName: data.lastName ?? prev.lastName,
        avatarUrl: data.avatarUrl ?? prev.avatarUrl,
      } : null);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut, signInWithProvider, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
