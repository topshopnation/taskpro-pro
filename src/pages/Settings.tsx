
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSubscription } from "@/contexts/subscription";
import { createTrialSubscription } from "@/components/settings/subscription/paymentUtils";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { usePaymentUrlParams } from "@/hooks/usePaymentUrlParams";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default function Settings() {
  const { user } = useAuth();
  const { subscription, loading, fetchSubscription } = useSubscription();
  const { isProcessingPayment, processPayment, handleTestPayment, paymentProcessed } = usePaymentProcessing();

  // Handle URL parameters for payment processing
  usePaymentUrlParams(isProcessingPayment, processPayment, paymentProcessed);

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

  // Check for test payment in localStorage on mount and after URL changes
  useEffect(() => {
    const checkForTestPayment = async () => {
      const testPaymentData = localStorage.getItem('taskpro_test_payment');
      if (testPaymentData && !paymentProcessed.current && user) {
        try {
          console.log("Found test payment data in localStorage");
          await handleTestPayment(testPaymentData);
          // Ensure subscription state is updated after payment
          await fetchSubscription();
        } catch (error) {
          console.error("Error handling test payment:", error);
        }
      }
    };
    
    if (user && !isProcessingPayment) {
      checkForTestPayment();
    }
  }, [user, handleTestPayment, isProcessingPayment, fetchSubscription]);

  // Refresh subscription data when the component mounts
  useEffect(() => {
    if (user && !loading) {
      console.log("Settings page mounted, refreshing subscription data");
      fetchSubscription();
    }
  }, []);

  // Reset the payment processed flag when unmounting
  useEffect(() => {
    return () => {
      paymentProcessed.current = false;
    };
  }, []);

  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}
