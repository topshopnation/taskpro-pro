
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useSubscription } from "@/contexts/subscription";
import { UseSubscriptionCardReturn } from "@/types/subscriptionTypes";

export function useSubscriptionCard(): UseSubscriptionCardReturn {
  const { 
    subscription, 
    loading, 
    isActive, 
    isTrialActive,
    daysRemaining,
    fetchSubscription,
    initialized
  } = useSubscription();
  
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);
  
  // Format expiry date
  useEffect(() => {
    try {
      if (subscription?.current_period_end) {
        setFormattedExpiryDate(format(new Date(subscription.current_period_end), 'MMM d, yyyy'));
      } else if (subscription?.trial_end_date) {
        setFormattedExpiryDate(format(new Date(subscription.trial_end_date), 'MMM d, yyyy'));
      } else {
        setFormattedExpiryDate(null);
      }
    } catch (err) {
      console.error("Error formatting date:", err);
      setError("Unable to format subscription date");
    }
  }, [subscription]);
  
  // Handle loading state with a longer stabilization period
  useEffect(() => {
    if (!loading && initialized) {
      // Set hasRendered immediately to show content
      setHasRendered(true);
      
      // Use a longer timeout to ensure subscription state is stable
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, initialized]);

  // Make sure subscription data is loaded only once
  useEffect(() => {
    if (!loading && !initialized && !fetchAttempted.current) {
      console.log("SubscriptionCard: Fetching subscription data");
      fetchAttempted.current = true;
      fetchSubscription().catch((err) => {
        console.error("Error fetching subscription:", err);
        setError("Unable to load subscription data");
      });
    }
  }, [loading, initialized, fetchSubscription]);

  // Check if subscription is truly active (accounts for expired dates)
  const isSubscriptionActive = subscription?.status === 'active' && (() => {
    try {
      if (!subscription.current_period_end) return false;
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      return endDate > now; // Only active if end date is in the future
    } catch (err) {
      console.error("Error checking subscription active status:", err);
      return false;
    }
  })();

  // Always show management button - users should always be able to manage their subscription
  const showManagementButton = true;

  // Check if user can upgrade (trial active or within 60 days of expiration)
  const canUpgrade = isTrialActive || (!isActive && !isTrialActive);

  return {
    subscription,
    isTrialActive,
    daysRemaining,
    formattedExpiryDate,
    hasRendered,
    isStable,
    showRenewButton: showManagementButton,
    error,
    isSubscriptionActive: isSubscriptionActive || isTrialActive
  };
}
