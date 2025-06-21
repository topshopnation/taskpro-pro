
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/contexts/subscription";
import { activateSubscription } from "@/components/settings/subscription/subscriptionUtils";

export function useSubscriptionProcessing() {
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);
  const subscriptionProcessed = useRef(false);
  const { user } = useAuth();
  const { fetchSubscription } = useSubscription();

  // Handle the completion of a subscription based on URL params
  const processSubscription = async (subscriptionId: string, subscriptionStatus: string) => {
    if (!user) return;
    
    console.log("Starting subscription processing:", { subscriptionId, subscriptionStatus });
    setIsProcessingSubscription(true);

    try {
      // Mark the subscription as processed
      subscriptionProcessed.current = true;

      // Process the subscription based on status
      if (subscriptionStatus === "completed" || subscriptionStatus === "success") {
        const success = await activateSubscription(subscriptionId, user.id);
        
        if (success) {
          console.log("Subscription activated successfully");
          await fetchSubscription();
          toast.success("Subscription activated! Auto-renewal is now enabled.");
        } else {
          throw new Error("Subscription activation failed");
        }
      } else {
        toast.error("Subscription was not completed successfully.");
      }
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast.error(`Subscription processing error: ${error.message}`);
      subscriptionProcessed.current = false;
    } finally {
      setIsProcessingSubscription(false);
    }
  };

  return {
    isProcessingSubscription,
    processSubscription,
    subscriptionProcessed,
  };
}
