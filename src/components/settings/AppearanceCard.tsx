
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "@/components/theme-provider"
import { ThemeToggleGroup } from "@/components/theme-toggle"

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
              <ThemeToggleGroup />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label>Theme Presets</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a theme preset or customize your own
            </p>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={theme === "light" ? "default" : "outline"} 
                onClick={() => setTheme("light")}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <div className="h-8 w-8 rounded-full bg-[#FFFFFF] border"></div>
                <span>Light</span>
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"} 
                onClick={() => setTheme("dark")}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <div className="h-8 w-8 rounded-full bg-[#1A1F2C] border"></div>
                <span>Dark</span>
              </Button>
              <Button 
                variant={theme === "system" ? "default" : "outline"} 
                onClick={() => setTheme("system")}
                className="flex flex-col gap-2 h-auto py-4"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FFFFFF] to-[#1A1F2C] border"></div>
                <span>System</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
