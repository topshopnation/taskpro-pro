
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription";
import { SubscriptionUpdate } from "@/contexts/subscription/types";

export function usePaymentProcessing() {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const paymentProcessed = useRef(false);
  const { user } = useAuth();
  const { updateSubscription } = useSubscription();

  // Handle the completion of a payment based on URL params
  const processPayment = async (paymentId: string, paymentStatus: string) => {
    if (!user) return;
    setIsProcessingPayment(true);

    try {
      // Mark the payment as processed
      paymentProcessed.current = true;

      // Process the payment based on status
      if (paymentStatus === "completed" || paymentStatus === "success") {
        // Update subscription with payment details
        await updateSubscription({
          payment_id: paymentId,
          status: "active",
        } as SubscriptionUpdate);
        
        toast.success("Payment successful! Your subscription is now active.");
      } else {
        toast.error("Payment was not completed successfully.");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(`Payment processing error: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle test payment data (for development purposes)
  const handleTestPayment = async (testPaymentData: string) => {
    try {
      const paymentData = JSON.parse(testPaymentData);
      const { paymentId, success } = paymentData;

      if (success && paymentId) {
        await processPayment(paymentId, "completed");
        // Clear the test payment data
        localStorage.removeItem("taskpro_test_payment");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error handling test payment:", error);
      return false;
    }
  };

  return {
    isProcessingPayment,
    processPayment,
    handleTestPayment,
    paymentProcessed,
  };
}
