
import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useSubscription } from "@/contexts/subscription";

export const usePaymentUrlParams = (
  isProcessingPayment: boolean,
  processPayment: (paymentId: string, paymentStatus: string) => Promise<void>,
  paymentProcessed: React.RefObject<boolean>
) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchSubscription } = useSubscription();

  // Extract URL parameters once on mount
  const urlParams = new URLSearchParams(location.search);
  const paymentSuccess = urlParams.get('payment_success');
  const paymentCancelled = urlParams.get('payment_cancelled');
  const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;

  // Memoize the payment handler to avoid recreation on every render
  const handlePayment = useCallback(async () => {
    try {
      if (paymentSuccess === 'true' && planType && !paymentProcessed.current && !isProcessingPayment) {
        console.log("Processing payment from URL params:", { planType, paymentProcessed: paymentProcessed.current });
        
        // We're using a payment ID that's the same as the plan type for simplicity
        // and passing "completed" as the payment status
        await processPayment(planType, "completed");
        
        // Force refresh subscription data after URL-based payment and wait for it to complete
        await fetchSubscription();
        
        // Clean up URL parameters after successful processing
        const url = new URL(window.location.href);
        url.search = '';
        window.history.replaceState({}, document.title, url.toString());
        
        // Show success message after parameters are cleared
        toast.success("Payment successful! Your subscription is now active.");
      }
    } catch (error) {
      console.error("Error handling payment from URL params:", error);
      toast.error("Error processing payment. Please try again.");
    }
  }, [paymentSuccess, planType, paymentProcessed, isProcessingPayment, processPayment, fetchSubscription]);

  useEffect(() => {
    if (paymentSuccess === 'true' && planType) {
      // Execute payment handling
      handlePayment();
    } else if (paymentCancelled === 'true') {
      toast.error("Payment was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location.search, handlePayment, paymentCancelled]);
};
