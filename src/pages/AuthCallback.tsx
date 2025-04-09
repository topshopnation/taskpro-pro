
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
        // Get the URL hash parameters (for implicit flow) or query parameters (for code flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        const accessToken = hashParams.get('access_token');
        const code = queryParams.get('code');
        
        // Handle access token (implicit flow)
        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (error) throw error;
          
          navigate("/", { replace: true });
        } 
        // Handle code (code flow)
        else if (code) {
          // Let Supabase handle it automatically
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data?.session) {
            navigate("/", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
        } 
        // Check existing session otherwise
        else {
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            navigate("/", { replace: true });
          } else {
            navigate("/auth", { replace: true });
          }
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
