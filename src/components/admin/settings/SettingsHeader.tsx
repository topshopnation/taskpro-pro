
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";

interface SettingsHeaderProps {
  loading: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsHeader({ loading, onSave, onReset }: SettingsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onReset} 
          variant="outline" 
          disabled={loading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={onSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
