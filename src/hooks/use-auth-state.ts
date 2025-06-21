
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./use-user-profile";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setIsLoading] = useState(true);
  const { user, setUser, resetUser, updateUserFromSession } = useUserProfile();

  useEffect(() => {
    let isSubscribed = true;
    
    // Define a thorough cleanup function that can be called at multiple points
    const clearAllUserData = () => {
      if (!isSubscribed) return;
      
      console.log("Thoroughly clearing all user data in auth state");
      
      // Reset all state
      resetUser();
      setSession(null);
      setIsLoading(false);
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.includes('sb-') || name.includes('supabase')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        }
      });
    };
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        // Handle signed out events
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          if (isSubscribed) {
            console.log(`${event} event detected, clearing all user data`);
            clearAllUserData();
            window.location.href = '/';
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
              setIsLoading(false);
            }
          }, 0);
        } else if (isSubscribed) {
          // No active session, ensure user data is cleared only if it's a genuine sign out
          if (event === 'SIGNED_OUT') {
            console.log("No active session after sign out, clearing user data");
            clearAllUserData();
          } else {
            // For other events like TOKEN_REFRESHED, just update session state
            setSession(null);
            resetUser();
            setIsLoading(false);
          }
        }
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isSubscribed) {
            setSession(null);
            resetUser();
            setIsLoading(false);
          }
          return;
        }

        if (data?.session && isSubscribed) {
          console.log("Found existing session, updating user data");
          setSession(data.session);
          await updateUserFromSession(
            data.session.user.id,
            data.session.user.email,
            data.session.user.user_metadata?.avatar_url
          );
        } else if (isSubscribed) {
          console.log("No existing session found");
          setSession(null);
          resetUser();
        }
        
        if (isSubscribed) setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isSubscribed) {
          setSession(null);
          resetUser();
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [resetUser, setUser, updateUserFromSession]);

  return { user, setUser, session, loading, resetUser };
};
