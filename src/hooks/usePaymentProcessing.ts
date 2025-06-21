
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
    
    console.log("Starting payment processing:", { paymentId, paymentStatus });
    setIsProcessingPayment(true);

    try {
      // Mark the payment as processed
      paymentProcessed.current = true;

      // Process the payment based on status
      if (paymentStatus === "completed" || paymentStatus === "success") {
        // Call our edge function to capture the PayPal payment
        const { data, error } = await supabase.functions.invoke('capture-paypal-payment', {
          body: {
            paymentId,
            userId: user.id
          }
        });

        if (error) {
          throw new Error(`Payment capture failed: ${error.message}`);
        }

        if (data?.success) {
          console.log("Payment captured successfully:", data);
          
          // Update subscription with payment details
          const planType = data.planType as "monthly" | "yearly";
          const currentDate = new Date();
          const periodEnd = new Date(currentDate);
          
          if (planType === "monthly") {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          }
          
          await updateSubscription({
            status: "active",
            planType: planType,
            currentPeriodStart: currentDate.toISOString(),
            currentPeriodEnd: periodEnd.toISOString()
          } as SubscriptionUpdate);
          
          console.log("Subscription update completed successfully");
          toast.success("Payment successful! Your subscription is now active.");
        } else {
          throw new Error("Payment capture was not successful");
        }
      } else {
        toast.error("Payment was not completed successfully.");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast.error(`Payment processing error: ${error.message}`);
      paymentProcessed.current = false;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle test payment data (for development purposes)
  const handleTestPayment = async (testPaymentData: string) => {
    try {
      if (paymentProcessed.current) {
        console.log("Payment already processed, skipping test payment");
        return false;
      }
      
      const paymentData = JSON.parse(testPaymentData);
      const { paymentId, success } = paymentData;

      if (success && paymentId) {
        console.log("Processing test payment:", paymentData);
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
