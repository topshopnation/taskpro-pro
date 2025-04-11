
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
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

export default function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const location = useLocation();

  // Check for payment success in URL params when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const paymentSuccess = urlParams.get('payment_success');
    
    if (paymentSuccess === 'true') {
      // Open subscription dialog to handle payment confirmation
      setIsUpgradeDialogOpen(true);
    }
  }, [location]);

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
