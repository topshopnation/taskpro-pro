
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SmartFeaturesCard() {
  const [smartSuggestions, setSmartSuggestions] = useState(true)
  const [autoCategorizeTasks, setAutoCategorizeTasks] = useState(true)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Features</CardTitle>
        <CardDescription>
          Control the intelligent features of TaskPro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
            <p className="text-sm text-muted-foreground">
              Suggest due dates and priorities based on task title
            </p>
          </div>
          <Switch
            id="smart-suggestions"
            checked={smartSuggestions}
            onCheckedChange={setSmartSuggestions}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-categorize">Auto-Categorize Tasks</Label>
            <p className="text-sm text-muted-foreground">
              Automatically assign tasks to projects based on keywords
            </p>
          </div>
          <Switch
            id="auto-categorize"
            checked={autoCategorizeTasks}
            onCheckedChange={setAutoCategorizeTasks}
          />
        </div>
      </CardContent>
    </Card>
  )
}
