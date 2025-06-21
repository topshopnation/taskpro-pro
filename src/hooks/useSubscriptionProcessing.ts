
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
    if (!user) {
      console.error("No user available for subscription processing");
      return;
    }
    
    console.log("Starting subscription processing:", { subscriptionId, subscriptionStatus });
    setIsProcessingSubscription(true);

    try {
      // Process the subscription based on status
      if (subscriptionStatus === "completed" || subscriptionStatus === "success") {
        console.log("Processing successful subscription activation");
        const success = await activateSubscription(subscriptionId, user.id);
        
        if (success) {
          console.log("Subscription activated successfully");
          // Refresh subscription data
          await fetchSubscription();
          toast.success("Subscription activated! Auto-renewal is now enabled.");
        } else {
          throw new Error("Subscription activation failed");
        }
      } else {
        console.error("Subscription was not completed successfully, status:", subscriptionStatus);
        toast.error("Subscription was not completed successfully.");
      }
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast.error(`Subscription processing error: ${error.message}`);
      subscriptionProcessed.current = false; // Reset on error
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
