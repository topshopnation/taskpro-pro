
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
  const { isActive, isTrialActive, loading, fetchSubscription, initialized } = useSubscription();
  const [shouldRestrict, setShouldRestrict] = useState(false);
  const { pathname } = useLocation();

  // Ensure subscription data is loaded - only fetch once
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("useSubscriptionCheck: Fetching subscription data");
      fetchSubscription();
    }
  }, [fetchSubscription, loading, initialized]);

  useEffect(() => {
    // Always allow access while loading or not initialized to prevent flashing
    if (loading || !initialized) {
      setShouldRestrict(false);
      return;
    }
    
    // Check if current route should be restricted
    const isUnrestrictedRoute = UNRESTRICTED_ROUTES.some(route => pathname.startsWith(route));
    
    // User has access if they have an active subscription OR an active trial
    const hasAccess = isActive || isTrialActive;
    
    // Only restrict if not on an unrestricted route AND user doesn't have access
    // AND we're sure the data has loaded (to prevent false positives)
    const shouldRestrictAccess = !isUnrestrictedRoute && !hasAccess && initialized && !loading;
    
    setShouldRestrict(shouldRestrictAccess);
    
    console.log("Subscription check:", {
      pathname,
      isUnrestrictedRoute,
      isActive,
      isTrialActive,
      hasAccess,
      initialized,
      loading,
      shouldRestrictAccess
    });
  }, [isActive, isTrialActive, loading, initialized, pathname]);

  return {
    shouldRestrict,
    loading: loading || !initialized
  };
}
