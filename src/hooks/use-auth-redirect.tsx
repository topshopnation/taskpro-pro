
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
      console.log("User authenticated, redirecting to today page from auth/home page");
      navigate('/today');
    }
    
    // Redirect dashboard to today
    if (user && location.pathname === '/dashboard') {
      navigate('/today');
    }
    
    // Redirect logic for unauthenticated users - only for protected routes
    if (!user && !isAuthPage && !isHomePage) {
      console.log("No user, redirecting to /auth from protected page");
      navigate('/auth');
    }

    // IMPORTANT: Do NOT add any other redirects that would trigger on regular page loads
  }, [user, loading, location.pathname, navigate]);
}
