
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";

export const usePaymentUrlParams = (
  isProcessingPayment: boolean,
  processPayment: (planType: 'monthly' | 'yearly') => Promise<void>,
  paymentProcessed: React.RefObject<boolean>
) => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;
    
    if (paymentSuccess === 'true' && planType && !paymentProcessed.current && !isProcessingPayment) {
      processPayment(planType);
    } else if (paymentCancelled === 'true') {
      toast.error("Payment was cancelled. You can try again whenever you're ready.");
      
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location, processPayment, isProcessingPayment, paymentProcessed]);
};
