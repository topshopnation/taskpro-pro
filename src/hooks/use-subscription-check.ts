
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/subscription-context";
import { useLocation } from "react-router-dom";

// List of routes that should not be subscription restricted
const UNRESTRICTED_ROUTES = [
  '/settings',
  '/auth',
  '/auth/callback',
  '/'
];

export function useSubscriptionCheck() {
  const { isActive, loading } = useSubscription();
  const [shouldRestrict, setShouldRestrict] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if current route should be restricted
    const isUnrestrictedRoute = UNRESTRICTED_ROUTES.some(route => pathname.startsWith(route));
    
    // Only restrict if not on an unrestricted route and subscription is not active
    setShouldRestrict(!isUnrestrictedRoute && !isActive && !loading);
  }, [isActive, loading, pathname]);

  return {
    shouldRestrict,
    loading
  };
}
