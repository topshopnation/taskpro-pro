
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSubscription } from "@/contexts/subscription";

export function useSubscriptionCard() {
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
  
  // Format expiry date
  useEffect(() => {
    if (subscription?.current_period_end) {
      setFormattedExpiryDate(format(new Date(subscription.current_period_end), 'MMM d, yyyy'));
    } else if (subscription?.trial_end_date) {
      setFormattedExpiryDate(format(new Date(subscription.trial_end_date), 'MMM d, yyyy'));
    } else {
      setFormattedExpiryDate(null);
    }
  }, [subscription]);
  
  // Handle loading state
  useEffect(() => {
    if (!loading && initialized) {
      setHasRendered(true);
      
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 250);
      
      return () => clearTimeout(timer);
    }
  }, [loading, initialized]);

  // Make sure subscription data is loaded
  useEffect(() => {
    if (!loading && !initialized) {
      console.log("SubscriptionCard: Fetching subscription data");
      fetchSubscription();
    }
  }, [loading, initialized, fetchSubscription]);

  const showRenewButton = subscription?.status === 'active' && (() => {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 14;
  })();

  return {
    subscription,
    isTrialActive,
    daysRemaining,
    formattedExpiryDate,
    hasRendered,
    isStable,
    showRenewButton
  };
}
