
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Palette } from "lucide-react";
import { AdminSettings } from "@/services/admin/settings-service";

interface GeneralSettingsCardProps {
  settings: AdminSettings;
  onInputChange: (key: keyof AdminSettings, value: string | boolean) => void;
}

export function GeneralSettingsCard({ settings, onInputChange }: GeneralSettingsCardProps) {
  return (
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
            onChange={(e) => onInputChange('siteName', e.target.value)}
            placeholder="Enter site name"
          />
          <p className="text-xs text-muted-foreground">
            This will be displayed in the browser title and headers
          </p>
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
            onCheckedChange={(checked) => onInputChange('maintenanceMode', checked)}
          />
        </div>
        {settings.maintenanceMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Maintenance mode is enabled. Users will see a maintenance page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
