
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/contexts/auth-context";

export function useAuthRedirect(user: User | null, loading: boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if still loading 
    if (loading) return;

    // Store the current path to avoid unnecessary redirects
    const currentPath = location.pathname;
    
    // Check if we're on authentication pages
    const isAuthPage = currentPath === '/auth' || currentPath.startsWith('/auth/');
    const isHomePage = currentPath === '/';
    
    // Special case for payment returns
    const isPaymentReturn = location.search.includes('payment_success') || 
                           location.search.includes('payment_cancelled');
    
    // If it's a payment return, always go to settings regardless of current page
    if (user && isPaymentReturn) {
      console.log("Payment return detected, redirecting to settings");
      navigate('/settings', { replace: true });
      return;
    }
    
    // Redirect authenticated users from auth/home to today page (but reduce redirects)
    if (user && (isAuthPage || isHomePage)) {
      console.log("User authenticated, redirecting to today page from:", currentPath);
      navigate('/today', { replace: true });
      return;
    }
    
    // Redirect unauthenticated users from protected pages to home page
    if (!user && !isAuthPage && !isHomePage) {
      console.log("No user, redirecting to / from protected page:", currentPath);
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, location.pathname, location.search, navigate]);
}
