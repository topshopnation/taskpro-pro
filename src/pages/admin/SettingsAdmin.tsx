
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Save, Shield, Database, Bell, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    siteName: "TaskPro",
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    backupFrequency: "daily",
    sessionTimeout: "24",
    maxUsersPerPlan: "1000"
  });

  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>General Settings</CardTitle>
            </div>
            <CardDescription>
              Basic application configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable user access for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>User Management</CardTitle>
            </div>
            <CardDescription>
              Control user registration and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={settings.userRegistration}
                onCheckedChange={(checked) => handleInputChange('userRegistration', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                placeholder="24"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="maxUsersPerPlan">Max Users Per Plan</Label>
              <Input
                id="maxUsersPerPlan"
                type="number"
                value={settings.maxUsersPerPlan}
                onChange={(e) => handleInputChange('maxUsersPerPlan', e.target.value)}
                placeholder="1000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure system notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for important events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <CardTitle>Database Settings</CardTitle>
            </div>
            <CardDescription>
              Database backup and maintenance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
