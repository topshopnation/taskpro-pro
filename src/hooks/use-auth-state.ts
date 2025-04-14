
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "./use-user-profile";

export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, setUser, updateUserFromSession } = useUserProfile();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession ? "session exists" : "no session");
        
        if (newSession?.user) {
          setSession(newSession);
          setTimeout(async () => {
            await updateUserFromSession(
              newSession.user.id,
              newSession.user.email,
              newSession.user.user_metadata?.avatar_url
            );
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
  }, [navigate, setUser, updateUserFromSession]);

  return { user, setUser, session, loading };
};
