
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { AdminSettings } from "@/services/admin/settings-service";

interface NotificationSettingsCardProps {
  settings: AdminSettings;
  onInputChange: (key: keyof AdminSettings, value: string | boolean) => void;
}

export function NotificationSettingsCard({ settings, onInputChange }: NotificationSettingsCardProps) {
  return (
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
            onCheckedChange={(checked) => onInputChange('emailNotifications', checked)}
          />
        </div>
        
        {settings.emailNotifications && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              📧 Email notifications are enabled for user signups, password resets, and subscription changes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
