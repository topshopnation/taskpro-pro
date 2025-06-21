
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

  // Handle URL parameters for subscription processing
  useSubscriptionUrlParams(isProcessingSubscription, processSubscription, subscriptionProcessed);

  // Check if user needs a trial subscription (but not if they had an expired trial)
  useEffect(() => {
    const initializeTrialIfNeeded = async () => {
      // Only proceed if we have a user, data is loaded, and we're initialized
      if (user && !loading && initialized && !subscription) {
        console.log("No subscription found, attempting to create trial for user:", user.id);
        try {
          const created = await createTrialSubscription(user.id);
          if (created) {
            console.log("Created trial subscription for new user");
            // Wait a moment before fetching to ensure the trigger has processed
            setTimeout(() => {
              fetchSubscription();
            }, 1000);
          } else {
            console.log("Could not create trial - user may have had previous trial");
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
