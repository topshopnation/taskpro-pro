
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { useSubscription } from "@/contexts/subscription";

export const useSubscriptionUrlParams = (
  isProcessingSubscription: boolean,
  processSubscription: (subscriptionId: string, subscriptionStatus: string) => Promise<void>,
  subscriptionProcessed: React.MutableRefObject<boolean>
) => {
  const location = useLocation();
  const { fetchSubscription } = useSubscription();

  // Extract URL parameters once on mount
  const urlParams = new URLSearchParams(location.search);
  const subscriptionSuccess = urlParams.get('subscription_success');
  const subscriptionCancelled = urlParams.get('subscription_cancelled');
  const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;

  // Get the actual PayPal subscription ID from the URL fragment (PayPal redirects with subscription_id in URL)
  const subscriptionId = urlParams.get('subscription_id') || urlParams.get('ba_token');

  // Memoize the subscription handler to avoid recreation on every render
  const handleSubscription = useCallback(async () => {
    try {
      if (subscriptionSuccess === 'true' && !subscriptionProcessed.current && !isProcessingSubscription) {
        console.log("Processing PayPal subscription from URL params:", { 
          subscriptionId, 
          planType, 
          subscriptionProcessed: subscriptionProcessed.current 
        });
        
        // Mark as processed immediately to prevent double processing
        subscriptionProcessed.current = true;
        
        if (subscriptionId) {
          console.log("Processing subscription with ID:", subscriptionId);
          await processSubscription(subscriptionId, "completed");
          
          // Single refresh after successful processing with a delay
          setTimeout(async () => {
            console.log("Refreshing subscription data after successful activation");
            await fetchSubscription();
            toast.success("Subscription activated successfully! Your plan has been updated.");
          }, 1000);
        } else {
          console.error("No subscription ID found in URL parameters");
          toast.error("Subscription activation failed - missing subscription information.");
        }
        
        // Clean up URL parameters after processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (error) {
      console.error("Error handling subscription from URL params:", error);
      subscriptionProcessed.current = false; // Reset on error
      toast.error("Error processing subscription. Please contact support if the issue persists.");
    }
  }, [subscriptionSuccess, subscriptionId, planType, subscriptionProcessed, isProcessingSubscription, processSubscription, fetchSubscription]);

  useEffect(() => {
    if (subscriptionSuccess === 'true' && !subscriptionProcessed.current) {
      // Add a small delay to ensure the component is fully mounted
      const timeoutId = setTimeout(() => {
        handleSubscription();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (subscriptionCancelled === 'true') {
      toast.error("Subscription was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location.search, handleSubscription, subscriptionCancelled]);
};
