
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function NavBar() {
  const { user } = useAuth();

  return (
    <nav className="py-4 border-b bg-background sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-primary">
          TaskPro
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Button size="sm" asChild>
              <Link to="/today">
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link to="/" className="flex items-center gap-1.5">
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
