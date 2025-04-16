
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
      }, 500); // Increased delay for more stability
      
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

  const showRenewButton = subscription?.status === 'active' && (() => {
    try {
      const endDate = new Date(subscription.current_period_end);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14;
    } catch (err) {
      console.error("Error calculating renewal status:", err);
      return false;
    }
  })();

  return {
    subscription,
    isTrialActive,
    daysRemaining,
    formattedExpiryDate,
    hasRendered,
    isStable,
    showRenewButton,
    error
  };
}
