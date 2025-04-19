
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "./use-user-profile";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setIsLoading] = useState(true);
  const { user, setUser, updateUserFromSession } = useUserProfile();

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
          
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(async () => {
            await updateUserFromSession(
              newSession.user.id,
              newSession.user.email,
              newSession.user.user_metadata?.avatar_url
            );
            
            // Only redirect on SIGNED_IN event
            if (event === 'SIGNED_IN') {
              // Use window.location for more reliable navigation
              window.location.href = '/today';
            }
            
            // Ensure loading state is updated
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setSession(null);
          
          if (event === 'SIGNED_OUT') {
            // Use window.location for more reliable navigation
            window.location.href = '/auth';
          }
          
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
          setIsLoading(false);
          return;
        }

        if (data?.session) {
          setSession(data.session);
          await updateUserFromSession(
            data.session.user.id,
            data.session.user.email,
            data.session.user.user_metadata?.avatar_url
          );
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
  }, [setUser, updateUserFromSession]);

  return { user, setUser, session, loading };
};
