
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
  
  // PayPal can return various parameters - check all possible ones
  const subscriptionId = urlParams.get('subscription_id');
  const baToken = urlParams.get('ba_token'); // PayPal billing agreement token
  const token = urlParams.get('token'); // PayPal payment token
  const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;

  // Use subscription_id first, then ba_token, then token as fallback
  const finalSubscriptionId = subscriptionId || baToken || token;

  console.log("🔍 PayPal URL Debug:", { 
    subscriptionSuccess, 
    subscriptionCancelled, 
    subscriptionId,
    baToken,
    token,
    finalSubscriptionId,
    planType,
    fullUrl: location.search,
    allParams: Object.fromEntries(urlParams),
    pathname: location.pathname
  });

  // Memoize the subscription handler to avoid recreation on every render
  const handleSubscription = useCallback(async () => {
    try {
      if (subscriptionSuccess === 'true' && finalSubscriptionId && !subscriptionProcessed.current && !isProcessingSubscription) {
        console.log("🚀 Processing PayPal subscription from URL params:", { 
          finalSubscriptionId, 
          planType, 
          subscriptionProcessed: subscriptionProcessed.current,
          isProcessingSubscription
        });
        
        // Process the PayPal subscription using the subscription ID
        await processSubscription(finalSubscriptionId, "completed");
        
        // Force multiple refreshes to ensure UI updates
        console.log("🔄 Force refreshing subscription data after URL processing");
        setTimeout(async () => {
          await fetchSubscription(true); // Force refresh
        }, 500);
        
        setTimeout(async () => {
          await fetchSubscription(true); // Second force refresh
        }, 2000);
        
        // Clean up URL parameters after successful processing
        console.log("🧹 Cleaning up URL parameters");
        navigate('/settings', { replace: true });
        console.log("✅ URL cleaned up after subscription processing");
      }
    } catch (error) {
      console.error("❌ Error handling subscription from URL params:", error);
      toast.error("Error processing subscription. Please try again.");
      // Clean up URL on error too
      navigate('/settings', { replace: true });
    }
  }, [subscriptionSuccess, finalSubscriptionId, planType, subscriptionProcessed, isProcessingSubscription, processSubscription, fetchSubscription, navigate]);

  useEffect(() => {
    if (subscriptionSuccess === 'true' && finalSubscriptionId) {
      console.log("🎯 Triggering subscription handling");
      // Execute subscription handling
      handleSubscription();
    } else if (subscriptionCancelled === 'true') {
      console.log("❌ Subscription was cancelled");
      toast.error("Subscription was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      navigate('/settings', { replace: true });
    }
  }, [location.search, handleSubscription, subscriptionCancelled, navigate]);
};
