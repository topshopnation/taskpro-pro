
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/contexts/auth-context";
import { fetchUserProfile } from "@/utils/auth-utils";

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
    console.log("Auth session initializing");
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
          // Use setTimeout to prevent potential deadlocks with Supabase auth
          setTimeout(() => {
            updateUserState(newSession.user);
          }, 0);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Initial session check:", existingSession ? "session exists" : "no session");
      
      if (existingSession?.user) {
        setSession(existingSession);
        updateUserState(existingSession.user);
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

  return { user, session, loading, setUser };
}
