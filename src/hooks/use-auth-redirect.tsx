
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/contexts/auth-context";

export function useAuthRedirect(user: User | null, loading: boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only run this effect if we're in a browser environment with access to React Router
    if (typeof window === 'undefined' || !navigate || loading) return;

    // Check if we're already on the auth page or callback page
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
    const isHomePage = location.pathname === '/';
    
    // Special case for payment returns
    const isPaymentReturn = location.search.includes('payment_success') || 
                           location.search.includes('payment_cancelled');
    
    // If it's a payment return, always go to settings regardless of current page
    if (user && isPaymentReturn) {
      navigate('/settings');
      return;
    }
    
    // Redirect authenticated users from auth/home to today page
    if (user && (isAuthPage || isHomePage)) {
      console.log("User authenticated, redirecting to today page from auth/home page");
      navigate('/today');
    }
    
    // Redirect dashboard to today
    if (user && location.pathname === '/dashboard') {
      navigate('/today');
    }
    
    // Redirect unauthenticated users to home page, except from auth pages
    if (!user && !isAuthPage && !isHomePage) {
      console.log("No user, redirecting to / from protected page");
      navigate('/');
    }
  }, [user, loading, location.pathname, location.search, navigate]);
}
