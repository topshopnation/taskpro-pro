
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSubscription } from "@/contexts/subscription";
import { createTrialSubscription } from "@/components/settings/subscription/paymentUtils";
import { useSubscriptionProcessing } from "@/hooks/useSubscriptionProcessing";
import { useSubscriptionUrlParams } from "@/hooks/useSubscriptionUrlParams";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default function Settings() {
  const { user } = useAuth();
  const { subscription, loading, fetchSubscription, initialized } = useSubscription();
  const { isProcessingSubscription, processSubscription, subscriptionProcessed } = useSubscriptionProcessing();

  // Handle URL parameters for subscription processing (PayPal returns)
  useSubscriptionUrlParams(isProcessingSubscription, processSubscription, subscriptionProcessed);

  // Check if user needs a trial subscription (but not if they had an expired trial)
  useEffect(() => {
    const initializeTrialIfNeeded = async () => {
      // Only proceed if we have a user, data is loaded, and we're initialized
      if (user && !loading && initialized && !subscription) {
        console.log("No subscription found, attempting to create trial for user:", user.id);
        try {
          const result = await createTrialSubscription(user.id);
          if (result.success && result.subscription) {
            console.log("Created trial subscription for new user");
            // Force refresh subscription data to get the new trial
            await fetchSubscription(true); // Force refresh to bypass cache
          } else {
            console.log("Could not create trial - user may have had previous subscription");
          }
        } catch (error) {
          console.error("Error creating trial subscription:", error);
        }
      }
    };
    
    initializeTrialIfNeeded();
  }, [user, subscription, loading, initialized, fetchSubscription]);

  // Reset the subscription processed flag when unmounting
  useEffect(() => {
    return () => {
      subscriptionProcessed.current = false;
    };
  }, []);

  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}
