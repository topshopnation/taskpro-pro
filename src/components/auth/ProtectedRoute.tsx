
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check user status immediately on mount
  useEffect(() => {
    if (!loading && !user && !isRedirecting) {
      console.log("ProtectedRoute: No user detected, redirecting to home from", location.pathname);
      setIsRedirecting(true);
      // Force immediate redirect on initial check
      window.location.href = '/';
    }
  }, [user, loading, location.pathname, isRedirecting]);

  // Show loading state only if we're genuinely loading auth status, not during redirect
  if (loading && !isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Loading your account...</h2>
          <div className="w-full max-w-md space-y-4 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in and not loading, redirect to home
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
