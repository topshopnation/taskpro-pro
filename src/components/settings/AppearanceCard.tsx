
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "@/components/theme-provider"
import { Monitor, Moon, Sun } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how TaskPro looks on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme">Theme</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select a theme for the application
            </p>
            
            <div className="flex justify-center">
              <ToggleGroup 
                type="single" 
                value={theme} 
                onValueChange={(value) => {
                  if (value) setTheme(value as "light" | "dark" | "system")
                }}
                className="flex items-center justify-center border rounded-md p-1"
              >
                <ToggleGroupItem value="light" aria-label="Light mode" className="flex items-center gap-2 px-3">
                  <Sun className="h-4 w-4" />
                  <span>Light</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark mode" className="flex items-center gap-2 px-3">
                  <Moon className="h-4 w-4" />
                  <span>Dark</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System mode" className="flex items-center gap-2 px-3">
                  <Monitor className="h-4 w-4" />
                  <span>System</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
