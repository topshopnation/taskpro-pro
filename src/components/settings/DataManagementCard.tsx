
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function DataManagementCard() {
  const clearAllData = () => {
    toast.success("All data has been cleared")
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Manage your TaskPro data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Clear All Data</Label>
            <p className="text-sm text-muted-foreground">
              Delete all tasks, projects, and settings
            </p>
          </div>
          <Button variant="destructive" onClick={clearAllData}>
            Clear Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
