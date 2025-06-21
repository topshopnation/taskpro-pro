
import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useSubscription } from "@/contexts/subscription";

export const useSubscriptionUrlParams = (
  isProcessingSubscription: boolean,
  processSubscription: (subscriptionId: string, subscriptionStatus: string) => Promise<void>,
  subscriptionProcessed: React.RefObject<boolean>
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchSubscription } = useSubscription();

  // Extract URL parameters once on mount
  const urlParams = new URLSearchParams(location.search);
  const subscriptionSuccess = urlParams.get('subscription_success');
  const subscriptionCancelled = urlParams.get('subscription_cancelled');
  const subscriptionId = urlParams.get('subscription_id');
  const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;

  // Memoize the subscription handler to avoid recreation on every render
  const handleSubscription = useCallback(async () => {
    try {
      if (subscriptionSuccess === 'true' && subscriptionId && !subscriptionProcessed.current && !isProcessingSubscription) {
        console.log("Processing PayPal subscription from URL params:", { subscriptionId, planType, subscriptionProcessed: subscriptionProcessed.current });
        
        // Process the PayPal subscription using the subscription ID
        await processSubscription(subscriptionId, "completed");
        
        // Force refresh subscription data after URL-based subscription processing
        await fetchSubscription();
        
        // Clean up URL parameters after successful processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (error) {
      console.error("Error handling subscription from URL params:", error);
      toast.error("Error processing subscription. Please try again.");
    }
  }, [subscriptionSuccess, subscriptionId, planType, subscriptionProcessed, isProcessingSubscription, processSubscription, fetchSubscription]);

  useEffect(() => {
    if (subscriptionSuccess === 'true' && subscriptionId) {
      // Execute subscription handling
      handleSubscription();
    } else if (subscriptionCancelled === 'true') {
      toast.error("Subscription was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location.search, handleSubscription, subscriptionCancelled]);
};
