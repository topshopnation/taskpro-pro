
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SignOutCard() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      toast.loading("Signing out...");
      
      // Clear storage first to prevent state persistence issues
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      });
      
      // Call the actual sign out function
      await signOut();
      
      // Display success toast
      toast.success("Successfully signed out");
      
      // Force reload and redirect after a short delay
      // This ensures all React state is completely reset
      setTimeout(() => {
        console.log("Forcing complete page reload and redirect to auth page");
        window.location.href = '/auth';
      }, 100);
      
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Error signing out", { 
        description: "Redirecting to login page" 
      });
      
      // Force cleanup and redirect regardless of error
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload the page to clear React state
      window.location.href = '/auth';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle>Sign Out</CardTitle>
        <CardDescription>
          Sign out of your TaskPro account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You will be logged out of your account and redirected to the login page.
        </p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Signing out..." : "Sign Out"}
        </Button>
      </CardFooter>
    </Card>
  );
}
