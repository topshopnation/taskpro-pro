
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Database } from "lucide-react";
import { AdminSettings } from "@/services/admin/settings-service";

interface DatabaseSettingsCardProps {
  settings: AdminSettings;
  onInputChange: (key: keyof AdminSettings, value: string | boolean) => void;
}

export function DatabaseSettingsCard({ settings, onInputChange }: DatabaseSettingsCardProps) {
  return (
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
            onChange={(e) => onInputChange('backupFrequency', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily (Recommended)</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="text-xs text-muted-foreground">
            How often to create automatic database backups
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-sm text-green-800">
            ✅ Database backups are currently set to {settings.backupFrequency}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
