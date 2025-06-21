
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/services/admin";

export function SecuritySettingsCard() {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession) {
        toast.error("Admin session not found");
        return;
      }

      const { email } = JSON.parse(adminSession);
      // Use empty string for current password since we're removing that requirement
      const success = await adminService.changeAdminPassword(
        email,
        "", // No current password required
        passwordData.newPassword
      );

      if (success) {
        toast.success("Password changed successfully");
        setPasswordData({
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordChange();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5" />
          <CardTitle>Security</CardTitle>
        </div>
        <CardDescription>
          Admin account security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handlePasswordChange} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
              onKeyPress={handlePasswordKeyPress}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
              onKeyPress={handlePasswordKeyPress}
              placeholder="Confirm new password"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={passwordLoading}
            className="w-fit"
          >
            {passwordLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
