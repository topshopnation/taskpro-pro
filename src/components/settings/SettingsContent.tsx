
import { useState } from "react";
import ProfileCard from "@/components/settings/ProfileCard";
import AppearanceCard from "@/components/settings/AppearanceCard";
import SubscriptionCard from "@/components/settings/SubscriptionCard";
import DataManagementCard from "@/components/settings/DataManagementCard";
import ProfileDialog from "@/components/settings/ProfileDialog";
import SubscriptionDialog from "@/components/settings/SubscriptionDialog";
import SignOutCard from "@/components/settings/SignOutCard";

export const SettingsContent = () => {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-4">
          <ProfileCard onEditProfile={() => setIsProfileDialogOpen(true)} />
          <SubscriptionCard onUpgrade={() => setIsUpgradeDialogOpen(true)} />
          <AppearanceCard />
          <DataManagementCard />
          <SignOutCard />
        </div>
      </div>

      <ProfileDialog 
        open={isProfileDialogOpen} 
        onOpenChange={setIsProfileDialogOpen} 
      />
      
      <SubscriptionDialog 
        open={isUpgradeDialogOpen} 
        onOpenChange={setIsUpgradeDialogOpen} 
      />
    </>
  );
};
