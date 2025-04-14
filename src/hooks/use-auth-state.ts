
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserProfile } from "@/utils/auth-utils";
import { useNavigate } from "react-router-dom";

export const useAuthState = () => {
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

  return { user, setUser, session, loading };
};
