
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
  const { subscription, loading, fetchSubscription } = useSubscription();
  const { isProcessingSubscription, processSubscription, subscriptionProcessed } = useSubscriptionProcessing();

  // Handle URL parameters for subscription processing
  useSubscriptionUrlParams(isProcessingSubscription, processSubscription, subscriptionProcessed);

  // Check if user needs a trial subscription
  useEffect(() => {
    const initializeTrialIfNeeded = async () => {
      if (user && !loading && !subscription) {
        console.log("No subscription found, attempting to create trial for user:", user.id);
        const created = await createTrialSubscription(user.id);
        if (created) {
          console.log("Created trial subscription for new user");
          await fetchSubscription();
        }
      }
    };
    
    initializeTrialIfNeeded();
  }, [user, subscription, loading, fetchSubscription]);

  // Refresh subscription data when the component mounts
  useEffect(() => {
    if (user && !loading) {
      console.log("Settings page mounted, refreshing subscription data");
      fetchSubscription();
    }
  }, []);

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
