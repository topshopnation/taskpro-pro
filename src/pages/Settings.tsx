
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/AppLayout";
import ProfileCard from "@/components/settings/ProfileCard";
import AppearanceCard from "@/components/settings/AppearanceCard";
import SubscriptionCard from "@/components/settings/SubscriptionCard";
import VoiceInputCard from "@/components/settings/VoiceInputCard";
import DataManagementCard from "@/components/settings/DataManagementCard";
import ProfileDialog from "@/components/settings/ProfileDialog";
import SubscriptionDialog from "@/components/settings/SubscriptionDialog";
import SignOutCard from "@/components/settings/SignOutCard";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSubscription } from "@/contexts/subscription";
import { processPaymentConfirmation, createTrialSubscription } from "@/components/settings/subscription/paymentUtils";

export default function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateSubscription, subscription, loading, fetchSubscription } = useSubscription();
  const paymentProcessed = useRef(false);

  // Check if user needs a trial subscription
  useEffect(() => {
    const initializeTrialIfNeeded = async () => {
      if (user && !loading && !subscription) {
        console.log("No subscription found, attempting to create trial for user:", user.id);
        const created = await createTrialSubscription(user.id);
        if (created) {
          console.log("Created trial subscription for new user");
          // Refresh the subscription data
          await fetchSubscription();
        }
      }
    };
    
    initializeTrialIfNeeded();
  }, [user, subscription, loading, fetchSubscription]);

  // Check for test payment in localStorage when component mounts or after navigation
  useEffect(() => {
    const checkForTestPayment = async () => {
      try {
        const testPaymentData = localStorage.getItem('taskpro_test_payment');
        if (testPaymentData) {
          const { userId, planType, timestamp } = JSON.parse(testPaymentData);
          console.log("Found test payment data:", { userId, planType, timestamp });
          
          // Clear the test payment data immediately to prevent double processing
          localStorage.removeItem('taskpro_test_payment');
          
          // Make sure this is for the current user and not too old (5 minutes max)
          const isRecent = Date.now() - timestamp < 5 * 60 * 1000;
          
          if (user && user.id === userId && isRecent && !paymentProcessed.current) {
            console.log("Processing test payment for plan:", planType);
            paymentProcessed.current = true;
            toast.loading("Processing your subscription...");
            
            try {
              await processPaymentConfirmation(planType, updateSubscription);
              toast.success(`Subscription processed successfully!`);
            } catch (error) {
              console.error("Error processing test payment:", error);
              toast.error("Failed to process test payment. Please try again.");
            }
          } else if (!isRecent) {
            console.log("Test payment data is too old, ignoring");
          } else if (!user || user.id !== userId) {
            console.log("Test payment user ID doesn't match current user");
          }
        }
      } catch (error) {
        console.error("Error processing test payment data:", error);
        toast.error("Failed to process test payment. Please try again.");
      }
    };
    
    if (user) {
      checkForTestPayment();
    }
  }, [user, updateSubscription]);

  // Check for payment success in URL params when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;
    
    // Process successful payment
    if (paymentSuccess === 'true' && planType && !paymentProcessed.current) {
      console.log("Processing payment success from URL. Plan type:", planType);
      console.log("Current user:", user ? user.id : 'Not logged in');
      console.log("Current subscription status:", subscription ? subscription.status : 'None');
      
      // Process the subscription update
      const processPayment = async () => {
        try {
          // Set the flag to prevent duplicate processing
          paymentProcessed.current = true;
          
          toast.loading("Processing your subscription...");
          console.log("Starting payment processing for plan:", planType);
          
          await processPaymentConfirmation(planType, updateSubscription);
          console.log("Subscription updated successfully");
          
          toast.success(`Successfully subscribed to ${planType} plan!`);
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Failed to process payment. Please try again or contact support.");
        } finally {
          // Clean up URL parameters
          const url = new URL(window.location.href);
          url.searchParams.delete('payment_success');
          url.searchParams.delete('payment_cancelled');
          url.searchParams.delete('plan_type');
          window.history.replaceState({}, document.title, url.toString());
        }
      };
      
      if (user) {
        processPayment();
      } else {
        console.error("Cannot process payment: User not logged in");
        toast.error("You must be logged in to process payments");
      }
    } 
    // Handle payment cancellation
    else if (paymentCancelled === 'true') {
      toast.error("Payment was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location, updateSubscription, user, subscription]);

  // Reset the payment processed flag when the component unmounts
  useEffect(() => {
    return () => {
      paymentProcessed.current = false;
    };
  }, []);

  const handleUpgradeClick = () => {
    setIsUpgradeDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-4">
          <ProfileCard onEditProfile={() => setIsProfileDialogOpen(true)} />
          <SubscriptionCard onUpgrade={handleUpgradeClick} />
          <AppearanceCard />
          <VoiceInputCard />
          <DataManagementCard />
          <SignOutCard />
        </div>
      </div>

      {/* Dialogs */}
      <ProfileDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
      
      <SubscriptionDialog 
        open={isUpgradeDialogOpen} 
        onOpenChange={setIsUpgradeDialogOpen} 
      />
    </AppLayout>
  );
}
