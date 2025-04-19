
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { useSubscription } from "@/contexts/subscription";

export const usePaymentUrlParams = (
  isProcessingPayment: boolean,
  processPayment: (paymentId: string, paymentStatus: string) => Promise<void>,
  paymentProcessed: React.RefObject<boolean>
) => {
  const location = useLocation();
  const { fetchSubscription } = useSubscription();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;
    
    const handlePayment = async () => {
      try {
        if (paymentSuccess === 'true' && planType && !paymentProcessed.current && !isProcessingPayment) {
          // We're using a payment ID that's the same as the plan type for simplicity
          // and passing "completed" as the payment status
          await processPayment(planType, "completed");
          // Force refresh subscription data after URL-based payment
          await fetchSubscription();
        }
      } catch (error) {
        console.error("Error handling payment from URL params:", error);
        toast.error("Error processing payment. Please try again.");
      }
    };

    if (paymentSuccess === 'true' && planType) {
      handlePayment();
    } else if (paymentCancelled === 'true') {
      toast.error("Payment was cancelled. You can try again whenever you're ready.");
      
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location, processPayment, isProcessingPayment, paymentProcessed, fetchSubscription]);
};
