
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
    
    const clearAllUserData = () => {
      // Thorough cleanup of all user data
      setUser(null);
      setSession(null);
      setIsLoading(false);
      
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name.includes('sb-') || name.includes('supabase')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      });
    };
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (event === 'SIGNED_OUT') {
          if (isSubscribed) {
            // Make sure we fully clear user data on sign out
            console.log("SIGNED_OUT event detected, clearing all user data");
            clearAllUserData();
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
          // No active session, ensure user data is cleared
          console.log("No active session, clearing user data");
          clearAllUserData();
        }
      }
    );

    // Then check for an existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isSubscribed) {
            clearAllUserData();
          }
          return;
        }

        if (data?.session && isSubscribed) {
          setSession(data.session);
          await updateUserFromSession(
            data.session.user.id,
            data.session.user.email,
            data.session.user.user_metadata?.avatar_url
          );
        } else if (isSubscribed) {
          // No active session, make sure user data is cleared
          clearAllUserData();
        }
        
        if (isSubscribed) setIsLoading(false);
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isSubscribed) {
          clearAllUserData();
        }
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
