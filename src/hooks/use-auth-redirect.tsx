
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/contexts/auth-context";

export function useAuthRedirect(user: User | null, loading: boolean) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if still loading 
    if (loading) return;

    const currentPath = location.pathname;
    const isAuthPage = currentPath === '/auth' || currentPath.startsWith('/auth/');
    const isHomePage = currentPath === '/';
    
    // Special case for payment returns - always redirect to settings
    const isPaymentReturn = location.search.includes('payment_success') || 
                           location.search.includes('payment_cancelled');
    
    if (user && isPaymentReturn) {
      console.log("Payment return detected, redirecting to settings");
      navigate('/settings', { replace: true });
      return;
    }
    
    // Only redirect authenticated users from auth/home pages, and only once
    if (user && (isAuthPage || isHomePage)) {
      console.log("User authenticated, redirecting to today page");
      navigate('/today', { replace: true });
      return;
    }
    
    // Redirect unauthenticated users from protected pages to home
    if (!user && !isAuthPage && !isHomePage) {
      console.log("No user, redirecting to home");
      navigate('/', { replace: true });
      return;
    }
  }, [user, loading, location.pathname, location.search, navigate]);
}
