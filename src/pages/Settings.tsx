
import { useState, useEffect } from "react";
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
import { processPaymentConfirmation } from "@/components/settings/subscription/paymentUtils";

export default function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateSubscription, subscription } = useSubscription();

  // Listen for test payment messages from the payment window
  useEffect(() => {
    const handlePaymentMessage = (event: MessageEvent) => {
      // Only process messages from our origin
      if (event.origin !== window.location.origin) return;
      
      // Check if this is a test payment completion message
      if (event.data?.type === "TEST_PAYMENT_COMPLETED" && event.data?.payload?.success) {
        const { user_id, plan_type } = event.data.payload;
        console.log("Received test payment message:", event.data.payload);
        
        // Make sure this is for the current user
        if (user && user.id === user_id) {
          const processPayment = async () => {
            try {
              toast.info("Processing your test subscription...");
              await processPaymentConfirmation(plan_type, updateSubscription);
              
              // Open dialog to show confirmation
              setIsUpgradeDialogOpen(true);
            } catch (error) {
              console.error("Error processing test payment:", error);
              toast.error("Failed to process test payment. Please try again.");
            }
          };
          
          processPayment();
        }
      }
    };
    
    // Add the event listener
    window.addEventListener("message", handlePaymentMessage);
    
    // Clean up
    return () => {
      window.removeEventListener("message", handlePaymentMessage);
    };
  }, [user, updateSubscription]);

  // Check for payment success in URL params when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;
    
    // Process successful payment
    if (paymentSuccess === 'true' && planType) {
      console.log("Processing payment success. Plan type:", planType);
      console.log("Current user:", user ? user.id : 'Not logged in');
      console.log("Current subscription status:", subscription ? subscription.status : 'None');
      
      // Process the subscription update
      const processPayment = async () => {
        try {
          toast.info("Processing your subscription...");
          console.log("Starting payment processing for plan:", planType);
          
          await processPaymentConfirmation(planType, updateSubscription);
          console.log("Subscription updated successfully");
          
          // Open dialog to show confirmation
          setIsUpgradeDialogOpen(true);
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-6">
          <ProfileCard onEditProfile={() => setIsProfileDialogOpen(true)} />
          <SubscriptionCard onUpgrade={() => setIsUpgradeDialogOpen(true)} />
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
