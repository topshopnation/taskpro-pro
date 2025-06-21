
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { adminService } from "@/services/admin";
import { AdminSettings } from "@/services/admin/settings-service";
import { SettingsHeader } from "@/components/admin/settings/SettingsHeader";
import { GeneralSettingsCard } from "@/components/admin/settings/GeneralSettingsCard";
import { SecuritySettingsCard } from "@/components/admin/settings/SecuritySettingsCard";
import { UserRegistrationCard } from "@/components/admin/settings/UserRegistrationCard";
import { NotificationSettingsCard } from "@/components/admin/settings/NotificationSettingsCard";
import { DatabaseSettingsCard } from "@/components/admin/settings/DatabaseSettingsCard";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: "TaskPro",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    backupFrequency: "daily"
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const currentSettings = await adminService.getSettings();
        setSettings(currentSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const success = await adminService.updateSettings(settings);
      if (success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = async () => {
    setLoading(true);
    try {
      const success = await adminService.resetToDefaults();
      if (success) {
        const defaultSettings = await adminService.getSettings();
        setSettings(defaultSettings);
        toast.success("Settings reset to defaults");
      } else {
        toast.error("Failed to reset settings");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof AdminSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <SettingsHeader
        loading={loading}
        onSave={handleSaveSettings}
        onReset={handleResetToDefaults}
      />

      <div className="grid gap-6">
        <GeneralSettingsCard
          settings={settings}
          onInputChange={handleInputChange}
        />

        <SecuritySettingsCard />

        <UserRegistrationCard
          settings={settings}
          onInputChange={handleInputChange}
        />

        <NotificationSettingsCard
          settings={settings}
          onInputChange={handleInputChange}
        />

        <DatabaseSettingsCard
          settings={settings}
          onInputChange={handleInputChange}
        />
      </div>
    </AdminLayout>
  );
}
