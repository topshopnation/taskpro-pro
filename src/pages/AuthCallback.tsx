
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (redirecting) return;
    
    console.log("AuthCallback: Processing OAuth callback");
    setRedirecting(true);
    
    const processCallback = async () => {
      try {
        // Get URL parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        console.log("Processing callback with params:", {
          hash: Object.fromEntries(hashParams.entries()),
          query: Object.fromEntries(queryParams.entries())
        });
        
        // Check for OAuth errors first
        const error = hashParams.get('error') || queryParams.get('error');
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
        
        if (error) {
          console.error("OAuth Error:", error, errorDescription);
          const message = errorDescription || error;
          setError(message);
          toast.error(`Authentication error: ${message}`);
          
          // Clear any potential auth state
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error("Error during cleanup sign out:", signOutError);
          }
          
          setTimeout(() => navigate("/auth", { replace: true }), 3000);
          return;
        }
        
        // Check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (sessionData?.session) {
          console.log("Session exists after OAuth flow, user authenticated");
          toast.success("Successfully signed in!");
          navigate("/today", { replace: true });
          return;
        }
        
        // If no session yet, wait a bit for it to be established
        console.log("No immediate session, waiting for establishment...");
        
        let attempts = 0;
        const maxAttempts = 5;
        
        const checkSession = async (): Promise<boolean> => {
          attempts++;
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            console.log(`Session established after ${attempts} attempts`);
            toast.success("Successfully signed in!");
            navigate("/today", { replace: true });
            return true;
          }
          
          if (attempts >= maxAttempts) {
            console.log("Max attempts reached, redirecting to auth");
            throw new Error("Authentication timed out. Please try again.");
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkSession();
        };
        
        await checkSession();
        
      } catch (error: any) {
        console.error("Error processing OAuth callback:", error);
        const message = error.message || "Authentication failed. Please try again.";
        setError(message);
        toast.error(message);
        
        // Clear any auth state before redirecting
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error during cleanup sign out:", signOutError);
        }
        
        setTimeout(() => navigate("/auth", { replace: true }), 3000);
      }
    };

    processCallback();
  }, [navigate, redirecting]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-destructive max-w-md text-center">
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
