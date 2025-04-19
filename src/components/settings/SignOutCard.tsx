
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function SignOutCard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast.error("Error signing out", { 
        description: error.message || "Something went wrong. Please try again." 
      });
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
