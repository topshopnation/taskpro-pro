
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

export default function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { updateSubscription } = useSubscription();

  // Check for payment success in URL params when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentCancelled = urlParams.get('payment_cancelled');
    const planType = urlParams.get('plan_type') as 'monthly' | 'yearly' | null;
    
    if (paymentSuccess === 'true' && planType) {
      // Open subscription dialog to handle payment confirmation
      setIsUpgradeDialogOpen(true);
      
      // Process the subscription update directly
      const processPayment = async () => {
        try {
          toast.info("Processing your subscription...");
          
          // Calculate the new period end date based on plan type
          const currentDate = new Date();
          const periodEnd = new Date(currentDate);
          
          if (planType === "monthly") {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          }
          
          // Update the subscription in the database
          await updateSubscription({
            status: "active",
            planType: planType,
            currentPeriodStart: currentDate.toISOString(),
            currentPeriodEnd: periodEnd.toISOString()
          });
          
          toast.success(`Successfully upgraded to ${planType} plan!`);
        } catch (error) {
          console.error("Error processing payment:", error);
          toast.error("Failed to process payment. Please try again or contact support.");
        }
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('payment_success');
        url.searchParams.delete('payment_cancelled');
        url.searchParams.delete('plan_type');
        window.history.replaceState({}, document.title, url.toString());
      };
      
      processPayment();
    } else if (paymentCancelled === 'true') {
      toast.error("Payment was cancelled. You can try again whenever you're ready.");
      
      // Clean up URL parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('payment_cancelled');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [location, updateSubscription]);

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
