
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
      console.error("❌ No user available for subscription processing");
      toast.error("Please sign in to complete subscription activation");
      return;
    }
    
    // Prevent duplicate processing
    if (subscriptionProcessed.current || isProcessingSubscription) {
      console.log("⏭️ Subscription already processed or processing, skipping");
      return;
    }
    
    console.log("🚀 Starting subscription processing:", { 
      subscriptionId, 
      subscriptionStatus, 
      userId: user.id,
      timestamp: new Date().toISOString()
    });
    
    setIsProcessingSubscription(true);
    subscriptionProcessed.current = true; // Mark as processed immediately to prevent duplicates

    try {
      // Process the subscription based on status
      if (subscriptionStatus === "completed" || subscriptionStatus === "success") {
        console.log("✅ Processing successful subscription activation");
        
        // Show immediate feedback to user
        toast.loading("Processing your subscription...", { id: "subscription-processing" });
        
        const success = await activateSubscription(subscriptionId, user.id);
        
        if (success) {
          console.log("🎉 Subscription activated successfully");
          toast.success("Subscription activated successfully! Your plan has been updated.", { 
            id: "subscription-processing" 
          });
          
          // Force immediate refresh of subscription data to update UI
          console.log("🔄 Refreshing subscription data immediately after activation");
          await fetchSubscription();
          
          // Force a second refresh after a brief delay to ensure database has fully updated
          setTimeout(async () => {
            console.log("🔄 Second subscription refresh to ensure UI is updated");
            await fetchSubscription();
          }, 1000);
          
        } else {
          console.error("❌ Subscription activation failed");
          toast.error("Subscription activation failed - please contact support", { 
            id: "subscription-processing" 
          });
          subscriptionProcessed.current = false; // Reset on failure
        }
      } else {
        console.error("❌ Subscription was not completed successfully, status:", subscriptionStatus);
        toast.error("Subscription was not completed successfully.");
        subscriptionProcessed.current = false; // Reset on failure
      }
    } catch (error: any) {
      console.error("💥 Error processing subscription:", error);
      toast.error(`Subscription processing error: ${error.message}`, { 
        id: "subscription-processing" 
      });
      subscriptionProcessed.current = false; // Reset on error
    } finally {
      setIsProcessingSubscription(false);
      console.log("🏁 Subscription processing completed");
    }
  };

  return {
    isProcessingSubscription,
    processSubscription,
    subscriptionProcessed,
  };
}
