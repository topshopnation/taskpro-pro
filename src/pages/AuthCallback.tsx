
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
        
        // The core issue: we need to handle the session that's already being set by Supabase's auto-handling
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }
        
        if (data?.session) {
          console.log("Session exists after OAuth flow, navigating to dashboard");
          // Success - redirect to dashboard
          toast.success("Successfully signed in!");
          navigate("/dashboard", { replace: true }); // Changed to dashboard
          return;
        }
        
        // If we don't have a session yet, we need to handle error cases
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          console.error("OAuth Error:", error, errorDescription);
          setError(errorDescription || error);
          toast.error(`Authentication error: ${errorDescription || error}`);
          setTimeout(() => navigate("/auth", { replace: true }), 3000);
          return;
        }
        
        // If we get here and don't have a session or an error, wait a bit longer then redirect to auth
        console.log("No session or error found, waiting a bit longer...");
        
        // Wait a bit longer for the session to be established
        setTimeout(async () => {
          const { data: delayedData } = await supabase.auth.getSession();
          if (delayedData?.session) {
            console.log("Session established after delay, navigating to dashboard");
            toast.success("Successfully signed in!");
            navigate("/dashboard", { replace: true }); // Changed to dashboard
          } else {
            console.log("No session established after delay, redirecting to auth");
            toast.error("Authentication failed. Please try again.");
            navigate("/auth", { replace: true });
          }
        }, 2000);
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
