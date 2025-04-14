
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/subscription";
import { useLocation } from "react-router-dom";

// List of routes that should not be subscription restricted
const UNRESTRICTED_ROUTES = [
  '/settings',
  '/auth',
  '/auth/callback',
  '/'
];

export function useSubscriptionCheck() {
  const { isActive, isTrialActive, loading, fetchSubscription } = useSubscription();
  const [shouldRestrict, setShouldRestrict] = useState(false);
  const { pathname } = useLocation();

  // Ensure subscription data is loaded
  useEffect(() => {
    if (!loading) {
      fetchSubscription();
    }
  }, [fetchSubscription]);

  useEffect(() => {
    // Check if current route should be restricted
    const isUnrestrictedRoute = UNRESTRICTED_ROUTES.some(route => pathname.startsWith(route));
    
    // Only restrict if not on an unrestricted route and subscription is not active
    setShouldRestrict(!isUnrestrictedRoute && !isActive && !isTrialActive && !loading);
  }, [isActive, isTrialActive, loading, pathname]);

  return {
    shouldRestrict,
    loading
  };
}
