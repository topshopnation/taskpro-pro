
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./use-user-profile";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setIsLoading] = useState(true);
  const { user, setUser, updateUserFromSession } = useUserProfile();

  useEffect(() => {
    let isSubscribed = true;
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_OUT') {
          if (isSubscribed) {
            // Make sure we fully clear user data on sign out
            setUser(null);
            setSession(null);
            setIsLoading(false);
            console.log("User signed out, all user data cleared");
          }
        } else if (newSession?.user && isSubscribed) {
          setSession(newSession);
          
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(async () => {
            if (isSubscribed) {
              await updateUserFromSession(
                newSession.user.id,
                newSession.user.email,
                newSession.user.user_metadata?.avatar_url
              );
              
              // Don't redirect here - let the router handle redirects
              setIsLoading(false);
            }
          }, 0);
        } else if (isSubscribed) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isSubscribed) setIsLoading(false);
          return;
        }

        if (data?.session && isSubscribed) {
          setSession(data.session);
          await updateUserFromSession(
            data.session.user.id,
            data.session.user.email,
            data.session.user.user_metadata?.avatar_url
          );
        }
        
        if (isSubscribed) setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isSubscribed) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [setUser, updateUserFromSession]);

  return { user, setUser, session, loading };
};
