
import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription";
import { processPaymentConfirmation } from "@/components/settings/subscription/paymentUtils";

export const usePaymentProcessing = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { updateSubscription, fetchSubscription } = useSubscription();
  const paymentProcessed = useRef(false);

  const processPayment = async (planType: 'monthly' | 'yearly') => {
    try {
      paymentProcessed.current = true;
      setIsProcessingPayment(true);
      
      const loadingToast = toast.loading("Processing your subscription...");
      
      console.log("Starting payment processing for plan:", planType);
      
      await processPaymentConfirmation(planType, updateSubscription);
      console.log("Subscription updated successfully");
      
      // Force a fresh subscription fetch directly after processing
      const fetchResult = await fetchSubscription();
      console.log("Subscription refetched after payment:", fetchResult);
      
      toast.dismiss(loadingToast);
      toast.success(`Successfully subscribed to ${planType} plan!`);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment. Please try again or contact support.");
    } finally {
      setIsProcessingPayment(false);
      
      // Remove URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_success');
      url.searchParams.delete('payment_cancelled');
      url.searchParams.delete('plan_type');
      window.history.replaceState({}, document.title, url.toString());
    }
  };

  const handleTestPayment = async (testPaymentData: string) => {
    try {
      const { userId, planType, timestamp } = JSON.parse(testPaymentData);
      console.log("Found test payment data:", { userId, planType, timestamp });
      
      localStorage.removeItem('taskpro_test_payment');
      
      const isRecent = Date.now() - timestamp < 5 * 60 * 1000;
      
      if (user && user.id === userId && isRecent) {
        await processPayment(planType);
        // Force a fresh subscription fetch here too
        await fetchSubscription();
      }
    } catch (error) {
      console.error("Error processing test payment:", error);
      toast.error("Failed to process test payment. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return {
    isProcessingPayment,
    processPayment,
    handleTestPayment,
    paymentProcessed
  };
};
