
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { AdminSettings } from "@/services/admin/settings-service";

interface UserRegistrationCardProps {
  settings: AdminSettings;
  onInputChange: (key: keyof AdminSettings, value: string | boolean) => void;
}

export function UserRegistrationCard({ settings, onInputChange }: UserRegistrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <CardTitle>User Registration</CardTitle>
        </div>
        <CardDescription>
          Control user registration access
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
            onCheckedChange={(checked) => onInputChange('userRegistration', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
