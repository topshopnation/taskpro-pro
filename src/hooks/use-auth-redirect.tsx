
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/contexts/auth-context";

export function useAuthRedirect(user: User | null, loading: boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Check if we're already on the auth page or callback page
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
    const isHomePage = location.pathname === '/';
    
    // Redirect logic for authenticated users
    if (user && (isAuthPage || isHomePage)) {
      console.log("User authenticated, redirecting to dashboard from auth/home page");
      navigate('/dashboard');
    }
    
    // Redirect logic for unauthenticated users - only for protected routes
    if (!user && !isAuthPage && !isHomePage) {
      console.log("No user, redirecting to /auth from protected page");
      navigate('/auth');
    }
  }, [user, loading, location.pathname, navigate]);
}
