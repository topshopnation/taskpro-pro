
import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"

// Import all the component cards
import ProfileCard from "@/components/settings/ProfileCard"
import SubscriptionCard from "@/components/settings/SubscriptionCard"
import AppearanceCard from "@/components/settings/AppearanceCard"
import SmartFeaturesCard from "@/components/settings/SmartFeaturesCard"
import VoiceInputCard from "@/components/settings/VoiceInputCard"
import DataManagementCard from "@/components/settings/DataManagementCard"

// Import the dialog components
import ProfileDialog from "@/components/settings/ProfileDialog"
import SubscriptionDialog from "@/components/settings/SubscriptionDialog"

export default function Settings() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

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
          <SmartFeaturesCard />
          <VoiceInputCard />
          <DataManagementCard />
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
  )
}
