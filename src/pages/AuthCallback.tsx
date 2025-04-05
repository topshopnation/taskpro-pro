
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback
    const processCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSessionFromUrl();
        if (error) throw error;
        
        // If we have a session, redirect to the main app
        if (data?.session) {
          navigate("/", { replace: true });
        } else {
          // If there's no session, redirect back to auth
          navigate("/auth", { replace: true });
        }
      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        navigate("/auth", { replace: true });
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
