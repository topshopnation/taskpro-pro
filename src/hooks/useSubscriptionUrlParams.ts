
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
  const subscriptionId = urlParams.get('subscription_id');
  const token = urlParams.get('token'); // PayPal payment token
  const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;

  // Memoize the subscription handler to avoid recreation on every render
  const handleSubscription = useCallback(async () => {
    try {
      if (subscriptionSuccess === 'true' && !subscriptionProcessed.current && !isProcessingSubscription) {
        console.log("Processing PayPal subscription from URL params:", { 
          subscriptionId, 
          token,
          planType, 
          subscriptionProcessed: subscriptionProcessed.current 
        });
        
        // Mark as processed immediately to prevent double processing
        subscriptionProcessed.current = true;
        
        // Check if we have a subscription ID (for recurring subscriptions)
        if (subscriptionId) {
          console.log("Processing recurring subscription with ID:", subscriptionId);
          await processSubscription(subscriptionId, "completed");
        } else if (token) {
          // If we only have a token, this might be a one-time payment that was processed incorrectly
          console.log("Received payment token instead of subscription ID:", token);
          toast.error("Payment completed but subscription setup failed. Please contact support.");
          
          // Clean up URL parameters
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, document.title, url.toString());
          return;
        } else {
          console.error("No subscription ID or token found in URL parameters");
          toast.error("Subscription activation failed - missing payment information.");
          
          // Clean up URL parameters
          const url = new URL(window.location.href);
          url.search = '';
          window.history.replaceState({}, document.title, url.toString());
          return;
        }
        
        // Force refresh subscription data after URL-based subscription activation
        await fetchSubscription();
        
        // Clean up URL parameters after successful processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (error) {
      console.error("Error handling subscription from URL params:", error);
      subscriptionProcessed.current = false; // Reset on error
      toast.error("Error processing subscription. Please contact support if the issue persists.");
    }
  }, [subscriptionSuccess, subscriptionId, token, planType, subscriptionProcessed, isProcessingSubscription, processSubscription, fetchSubscription]);

  useEffect(() => {
    if (subscriptionSuccess === 'true' && (subscriptionId || token)) {
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
