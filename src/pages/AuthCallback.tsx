
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("AuthCallback: Processing OAuth callback");
    // Process the OAuth callback
    const processCallback = async () => {
      try {
        // Get the URL hash parameters (for implicit flow) or query parameters (for code flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Debug info
        console.log("Hash params:", Object.fromEntries(hashParams.entries()));
        console.log("Query params:", Object.fromEntries(queryParams.entries()));
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const code = queryParams.get('code');
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        // Handle errors from the OAuth provider
        if (error) {
          console.error("OAuth Error:", error, errorDescription);
          setError(errorDescription || error);
          toast.error(`Authentication error: ${errorDescription || error}`);
          setTimeout(() => navigate("/auth", { replace: true }), 3000);
          return;
        }
        
        // Handle access token (implicit flow)
        if (accessToken) {
          console.log("Processing with access token");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error("Error setting session:", error);
            throw error;
          }
          
          console.log("Session set successfully with access token");
          navigate("/", { replace: true });
        } 
        // Handle code (code flow)
        else if (code) {
          console.log("Processing with authorization code");
          
          // For code flow, we let Supabase handle the token exchange
          const { data, error } = await supabase.auth.getSession();
          console.log("Session after code flow:", data?.session ? "Session exists" : "No session", error ? `Error: ${error.message}` : "No error");
          
          if (error) {
            console.error("Error processing code:", error);
            throw error;
          }
          
          if (data?.session) {
            console.log("Session exists, navigating to dashboard");
            navigate("/", { replace: true });
          } else {
            console.log("No session found after code exchange, redirecting to auth");
            toast.error("Authentication failed. Please try again.");
            navigate("/auth", { replace: true });
          }
        } 
        // Check existing session otherwise
        else {
          console.log("No token or code found, checking for existing session");
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            console.log("Existing session found, redirecting to dashboard");
            navigate("/", { replace: true });
          } else {
            console.log("No existing session, redirecting to auth");
            navigate("/auth", { replace: true });
          }
        }
      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        setError("Authentication failed. Please try again.");
        toast.error("Authentication failed. Please try again.");
        setTimeout(() => navigate("/auth", { replace: true }), 3000);
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
        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-destructive">
            <p>{error}</p>
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
